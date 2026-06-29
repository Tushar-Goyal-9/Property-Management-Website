import User from '../models/User.js';
import Property from '../models/Property.js';
import sendEmail from "../utils/sendEmail.js";

// @desc    Get all users (admin only)
// @route   GET /api/v1/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/v1/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @desc    Update user (admin only)
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.isVerified = req.body.isVerified !== undefined ? req.body.isVerified : user.isVerified;
    const updatedUser = await user.save();
    res.json({ _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user count
// @route   GET /api/v1/users/count
// @access  Public/Admin
export const getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add property to wishlist
// @route   POST /api/v1/users/wishlist/:id
// @access  Private
export const addToWishlist = async (req, res) => {
  try {
    console.log('Adding to wishlist:');
console.log('- User ID:', req.user?._id);
console.log('- Property ID:', req.params.id);
    const propertyId = req.params.id;
    
    // Verify property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      res.status(404);
      throw new Error('Property not found');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Check if already in wishlist
    if (!user.wishlist.includes(propertyId)) {
      user.wishlist.push(propertyId);
      await user.save();
    }

    // Return populated wishlist
    const populatedUser = await User.findById(req.user._id).populate('wishlist');
    res.status(200).json(populatedUser.wishlist);
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Remove from wishlist
// @route   DELETE /api/v1/users/wishlist/:id
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== req.params.id
    );
    await user.save();

    const populatedUser = await User.findById(req.user._id).populate('wishlist');
    res.status(200).json(populatedUser.wishlist);
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user's wishlist
// @route   GET /api/v1/users/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.status(200).json(user.wishlist);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Request agent access
// @route   POST /api/v1/users/request-agent
// @access  Private
export const requestAgentAccess = async (req, res) => {
  try {
    const { agencyName, licenseNumber } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Already an approved agent
    if (user.role === "agent") {
      res.status(400);
      throw new Error("You are already an agent.");
    }

    // Already waiting for approval
    if (user.agentRequest?.status === "pending") {
      res.status(400);
      throw new Error("You already have a pending agent request.");
    }

    // Save latest application details
    user.agencyName = agencyName;
    user.licenseNumber = licenseNumber;

    // Create / Update request
    user.agentRequest.status = "pending";
    user.agentRequest.requestedAt = new Date();
    user.agentRequest.reviewedAt = undefined;
    user.agentRequest.reviewedBy = undefined;
    user.agentRequest.rejectionReason = "";

    await user.save();

    res.status(201).json({
      message: "Agent access request submitted successfully.",
      agentRequest: user.agentRequest,
    });

  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
      message: error.message,
    });
  }
};

// @desc    Get pending agent requests
// @route   GET /api/v1/users/agent-requests
// @access  Private/Admin
export const getPendingAgentRequests = async (req, res) => {
  try {
    const requests = await User.find({
      "agentRequest.status": "pending",
    }).select("name email phone role agencyName licenseNumber isVerified agentRequest createdAt");

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// @desc    Approve agent request
// @route   PATCH /api/v1/users/agent-requests/:id/approve
// @access  Private/Admin
export const approveAgentRequest = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    // Check if user exists
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Already an approved agent
    if (user.role === "agent") {
      res.status(400);
      throw new Error("User is already an approved agent.");
    }

    // No pending request
    if (user.agentRequest.status !== "pending") {
      res.status(400);
      throw new Error("No pending agent request found.");
    }

    // Approve request
    user.role = "agent";
    user.isVerified = true;

    user.agentRequest.status = "approved";
    user.agentRequest.reviewedAt = new Date();
    user.agentRequest.reviewedBy = req.user._id;

    await user.save();

    await sendEmail({
  to: user.email,
  subject: "Agent Request Approved",
  html: `
    <h2>Congratulations, ${user.name}! 🎉</h2>
    <p>Your request to become a verified Property Dunia Agent has been approved.</p>
    <p>You can now log in and access your Agent Dashboard to start listing and managing your properties.</p>
    <p>Thank you for choosing Property Dunia.</p>
  `,
});

    res.status(200).json({
  message: "Agent request approved successfully.",
  role: user.role,
  isVerified: user.isVerified,
  agentRequest: user.agentRequest,
});

  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
      message: error.message,
    });
  }
};

// @desc    Reject agent request
// @route   PATCH /api/v1/users/agent-requests/:id/reject
// @access  Private/Admin
export const rejectAgentRequest = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (user.role === "agent") {
      res.status(400);
      throw new Error("Approved agents cannot be rejected.");
    }

    if (user.agentRequest.status !== "pending") {
      res.status(400);
      throw new Error("No pending agent request found.");
    }

    user.agentRequest.status = "rejected";
    user.agentRequest.reviewedAt = new Date();
    user.agentRequest.reviewedBy = req.user._id;
    user.agentRequest.rejectionReason = rejectionReason;

    await user.save();

    await sendEmail({
  to: user.email,
  subject: "Agent Request Rejected",
  html: `
    <h2>Hello ${user.name},</h2>
    <h2>Hello ${user.name},</h2>

   <p>Thank you for applying to become a Property Dunia Agent.</p>
   <p>After reviewing your application, we couldn't approve it at this time.</p>
   <p><strong>Reason:</strong> ${rejectionReason}</p>
   <p>You may update your information and submit another request whenever you're ready.</p>
  `,
});

    res.status(200).json({
  message: "Agent request rejected successfully.",
  role: user.role,
  isVerified: user.isVerified,
  agentRequest: user.agentRequest,
});

  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
      message: error.message,
    });
  }
};

// @desc    Revoke agent status
// @route   PATCH /api/v1/users/:id/revoke-agent
// @access  Private/Admin
export const revokeAgentStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (user.role !== "agent") {
      res.status(400);
      throw new Error("User is not an agent.");
    }

    user.role = "user";
    user.isVerified = false;

    user.agentRequest.status = "none";
    user.agentRequest.requestedAt = undefined;
    user.agentRequest.reviewedAt = undefined;
    user.agentRequest.reviewedBy = undefined;
    user.agentRequest.rejectionReason = "";

    await user.save();

    res.status(200).json({
      message: "Agent status revoked successfully.",
      role: user.role,
      isVerified: user.isVerified,
      agentRequest: user.agentRequest,
    });

  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
      message: error.message,
    });
  }
};