import Inquiry from '../models/Inquiry.js';
import Property from '../models/Property.js';

// @desc    Create a new inquiry
// @route   POST /api/v1/inquiries
// @access  Private
export const createInquiry = async (req, res) => {
  try {
    const { propertyId, name, email, phone, message } = req.body;

    const property = await Property.findById(propertyId).populate('owner');
    if (!property) {
      res.status(404);
      throw new Error('Property not found');
    }

    const inquiry = await Inquiry.create({
      property: propertyId,
      user: req.user._id,
      agent: property.owner._id,
      name,
      email,
      phone,
      message,
    });

    // Increment inquiry count on property
    property.inquiries = (property.inquiries || 0) + 1;
    await property.save();

    res.status(201).json(inquiry);
  } catch (error) {
    console.error('Error in createInquiry:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get inquiries for logged in user/agent
// @route   GET /api/v1/inquiries
// @access  Private
export const getMyInquiries = async (req, res) => {
  try {
    let inquiries;
    if (req.user.role === 'agent') {
      // Agents see inquiries for their properties
      inquiries = await Inquiry.find({ agent: req.user._id })
        .populate('property', 'title images')
        .populate('user', 'name email')
        .sort('-createdAt');
    } else {
      // Regular users see inquiries they made
      inquiries = await Inquiry.find({ user: req.user._id })
        .populate('property', 'title images')
        .populate('agent', 'name email agencyName')
        .sort('-createdAt');
    }
    res.json(inquiries);
  } catch (error) {
    console.error('Error in getMyInquiries:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark inquiry as read
// @route   PATCH /api/v1/inquiries/:id/read
// @access  Private/Agent
export const markAsRead = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      res.status(404);
      throw new Error('Inquiry not found');
    }

    if (inquiry.agent.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized');
    }

    inquiry.isRead = true;
    await inquiry.save();
    res.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('Error in markAsRead:', error);
    res.status(400).json({ message: error.message });
  }
};
