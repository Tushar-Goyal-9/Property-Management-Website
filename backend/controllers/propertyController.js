import Property from '../models/Property.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// @desc    Get all properties with filtering, search, pagination
// @route   GET /api/v1/properties
// @access  Public
export const getProperties = async (req, res) => {
  try {
    const {
      keyword,
      city,
      minPrice,
      maxPrice,
      bedrooms,
      propertyType,
      listingType,
      status,
      featured,
      hot,
      owner,
      sortBy,
      page = 1,
      limit = 9,
    } = req.query;

     // ✅ Manual token check for owner requests when route is public
    if (owner && !req.user) {
      const token = req.cookies.token;
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {
          // Invalid token – ignore, req.user stays undefined
        }
      }
    }
    
    const queryObj = {};


 // ✅ ALWAYS handle owner first (agent dashboard)
if (owner && req.user?._id.toString() === owner) {
  queryObj.owner = owner;
}

// ✅ ADMIN
else if (req.user?.role === 'admin') {
  if (status) {
    queryObj.status = status;
  }
}

// ✅ EVERYONE ELSE (IMPORTANT FIX)
// Public users
else {
  queryObj.status = 'approved';
  queryObj.visibility = 'public';
  queryObj.listingStatus = "active";
}
    // Keyword search
    if (keyword) {
      queryObj.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { address: { $regex: keyword, $options: 'i' } },
        { city: { $regex: keyword, $options: 'i' } },
      ];
    }

    // City filter
    if (city) {
      queryObj.city = { $regex: city, $options: 'i' };
    }

    // Price range
    if (minPrice || maxPrice) {
      queryObj.price = {};
      if (minPrice) queryObj.price.$gte = Number(minPrice);
      if (maxPrice) queryObj.price.$lte = Number(maxPrice);
    }

    // Bedrooms
    if (bedrooms) {
      queryObj.bedrooms = { $gte: Number(bedrooms) };
    }

    // Property type
    if (propertyType) {
      queryObj.propertyType = propertyType;
    }

    // Listing type
    if (listingType) {
      queryObj.listingType = listingType;
    }

    // Featured/Hot flags
    if (featured === 'true') queryObj.featured = true;
    if (hot === 'true') queryObj.hot = true;

    // Filter by owner (for agent dashboard) – IMPORTANT: place after status logic
    if (owner) {
      queryObj.owner = owner;
    }

    // Sorting
    let sortOptions = {};
    if (sortBy === 'price-asc') sortOptions.price = 1;
    else if (sortBy === 'price-desc') sortOptions.price = -1;
    else if (sortBy === 'newest') sortOptions.createdAt = -1;
    else if (sortBy === 'oldest') sortOptions.createdAt = 1;
    else sortOptions.createdAt = -1;

    // Pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const properties = await Property.find(queryObj)
      .populate('owner', 'name email avatar agencyName phone')
      .sort(sortOptions)
      .limit(limitNum)
      .skip(skip)
      .lean();

    const total = await Property.countDocuments(queryObj);

    res.json({
      properties,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total,
    });
  } catch (error) {
    console.error('Error in getProperties:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single property by ID
// @route   GET /api/v1/properties/:id
// @access  Public
export const getPropertyById = async (req, res) => {
  try {
    // Optional token check for owner/admin access
if (!req.user) {
  const token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    } catch (error) {
      // Invalid token – ignore, req.user stays undefined
    }
  }
}
    const property = await Property.findById(req.params.id).populate(
      'owner',
      'name email avatar agencyName phone'
    );

    if (!property) {
      res.status(404);
      throw new Error('Property not found');
    }

    // Public users can only access public + active + approved properties
if (
  !req.user &&
  (
    property.visibility !== "public" ||
    property.status !== "approved" ||
    property.listingStatus !== "active"
  )
) {
  res.status(404);
  throw new Error("Property not found");
}

// Owner can access their own properties
if (
  req.user &&
  property.owner._id.toString() === req.user._id.toString()
) {
  // Allow access
}

// Admin can access everything
else if (
  req.user &&
  req.user.role === "admin"
) {
  // Allow access
}

// Logged-in users who are not owner/admin
else if (
  req.user &&
  (
    property.visibility !== "public" ||
    property.status !== "approved" ||
    property.listingStatus !== "active"
  )
) {
  res.status(403);
  throw new Error("Not authorized to view this property");
}

    // Increment view count
    await Property.findByIdAndUpdate(
    req.params.id,
    {
        $inc: { views: 1 }
    }
);

    res.json(property);
  } catch (error) {
  console.error("Error in getPropertyById:", error);

  res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
    message: error.message,
  });
}
};

// @desc    Create a new property
// @route   POST /api/v1/properties
// @access  Private (Agent/Admin)
export const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      address,
      city,
      state,
      zipCode,
      bedrooms,
      bathrooms,
      area,
      propertyType,
      listingType,
      visibility,
      listingStatus,
      images,
    } = req.body;

    // Validate required fields
    // Done through express-validator 
    if (!images || images.length === 0) {
      res.status(400);
      throw new Error('Please upload at least one image');
    }

    const property = await Property.create({
      title,
      description,
      price,
      address,
      city,
      state: state || '',
      zipCode: zipCode || '',
      bedrooms,
      bathrooms,
      area,
      propertyType,
      listingType,
      images,

      visibility: visibility || "public",
      listingStatus: listingStatus || "active",

      owner: req.user._id,
      status: 'approved',
    });

    res.status(201).json(property);
  } catch (error) {
    console.error('Error in createProperty:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a property
// @route   PUT /api/v1/properties/:id
// @access  Private (Owner or Admin)
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      res.status(404);
      throw new Error('Property not found');
    }

    // Check ownership
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to update this property');
    }

    const {
      title,
      description,
      price,
      address,
      city,
      state,
      zipCode,
      bedrooms,
      bathrooms,
      area,
      propertyType,
      listingType,
      visibility,
      listingStatus,
      images,
    } = req.body;

    property.title = title || property.title;
    property.description = description || property.description;
    property.price = price ?? property.price;
    property.address = address || property.address;
    property.city = city || property.city;
    property.state = state !== undefined ? state : property.state;
    property.zipCode = zipCode !== undefined ? zipCode : property.zipCode;
    property.bedrooms = bedrooms ?? property.bedrooms;
    property.bathrooms = bathrooms ?? property.bathrooms;
    property.area = area ?? property.area;
    property.propertyType = propertyType || property.propertyType;
    property.listingType = listingType || property.listingType;
    property.visibility =
       visibility !== undefined
         ? visibility
         : property.visibility;
    property.listingStatus =
       listingStatus !== undefined
        ? listingStatus
        : property.listingStatus;     
    if (images && images.length > 0) {
      property.images = images;
    }

    const updatedProperty = await property.save();
    res.json(updatedProperty);
  } catch (error) {
    console.error('Error in updateProperty:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a property
// @route   DELETE /api/v1/properties/:id
// @access  Private (Owner or Admin)
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      res.status(404);
      throw new Error('Property not found');
    }

    // Check ownership
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to delete this property');
    }

    await property.deleteOne();
    res.json({ message: 'Property removed' });
  } catch (error) {
    console.error('Error in deleteProperty:', error);
    res.status(400).json({ message: error.message });
  }
};


// @desc    Toggle featured status (admin only)
// @route   PATCH /api/v1/properties/:id/feature
// @access  Private/Admin
export const toggleFeatured = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      res.status(404);
      throw new Error('Property not found');
    }

    property.featured = !property.featured;
    const updatedProperty = await property.save();
    res.json(updatedProperty);
  } catch (error) {
    console.error('Error in toggleFeatured:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get property count (for stats)
// @route   GET /api/v1/properties/count
// @access  Public/Admin
export const getPropertyCount = async (req, res) => {
  try {
    const { status, featured, hot } = req.query;
    const query = {};
    if (status) query.status = status;
    if (featured) query.featured = featured === 'true';
    if (hot) query.hot = hot === 'true';

    const count = await Property.countDocuments(query);
    res.json({ count });
  } catch (error) {
    console.error('Error in getPropertyCount:', error);
    res.status(500).json({ message: error.message });
  }
};