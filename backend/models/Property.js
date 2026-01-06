import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
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

    location: {
      type: String,
      required: true,
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
      type: Number, // in sq ft
      required: true,
    },

    status: {
      type: String,
      enum: ["sale", "rent"],
      required: true,
    },

    images: [
      {
        type: String,
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    contactName: {
  type: String,
  required: true,
},

contactPhone: {
  type: String,
  required: true,
},

contactEmail: {
  type: String,
  required: true,
},

  },
  {
    timestamps: true,
  }
);

const Property = mongoose.model("Property", propertySchema);

export default Property;
