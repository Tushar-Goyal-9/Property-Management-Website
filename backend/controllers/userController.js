import User from '../models/User.js';
import Property from '../models/Property.js';

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