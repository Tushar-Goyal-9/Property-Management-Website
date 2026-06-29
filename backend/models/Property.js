import mongoose from 'mongoose';

const propertySchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      default: '',
    },
    zipCode: {
      type: String,
      default: '',
    },
    bedrooms: {
      type: Number,
      required: true,
    },
    bathrooms: {
      type: Number,
      required: true,
    },
    area: {
      type: Number,
      required: true,
    },
    propertyType: {
      type: String,
      enum: ['Apartment', 'House', 'Villa', 'Office', 'Land', 'Condo'],
      required: true,
    },
    listingType: {
      type: String,
      enum: ['Sale', 'Rent'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    visibility: {
    type: String,
    enum: ["public", "private"],
    default: "public",
    },
    listingStatus: {
    type: String,
    enum: ["active", "sold", "rented", "archived"],
    default: "active",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    hot: {
      type: Boolean,
      default: false,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    views: {
      type: Number,
      default: 0,
    },
    inquiries: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search performance
propertySchema.index({ city: 1, price: 1, bedrooms: 1, listingType: 1 });

const Property = mongoose.model('Property', propertySchema);
export default Property;