import Property from "../models/Property.js";

// @desc    Add new property
// @route   POST /api/properties
// @access  Protected
export const addProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      location,
      bedrooms,
      bathrooms,
      area,
      status,
      images,

      // ✅ NEW CONTACT FIELDS
      contactName,
      contactPhone,
      contactEmail,
    } = req.body;

    const property = await Property.create({
      title,
      description,
      price,
      location,
      bedrooms,
      bathrooms,
      area,
      status,
      images,

      // ✅ SAVE CONTACT INFO
      contactName,
      contactPhone,
      contactEmail,

      createdBy: req.user._id, // admin user
    });

    res.status(201).json({
      message: "Property added successfully",
      property,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
export const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email role");

    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// @desc    Get single property by ID
// @route   GET /api/properties/:id
// @access  Public
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "createdBy",
      "name email role"
    );

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


