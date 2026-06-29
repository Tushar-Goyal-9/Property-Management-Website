import mongoose from 'mongoose';

const inquirySchema = mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Property',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },

  },
  {
    timestamps: true,
  }
);

const Inquiry = mongoose.model('Inquiry', inquirySchema);
export default Inquiry;