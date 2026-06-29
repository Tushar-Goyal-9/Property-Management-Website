import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'agent', 'admin'],
      default: 'user',
    },
    phone: {
      type: String,
    },
    avatar: {
      type: String,
      default: '',
    },
    // Agent specific fields
    agencyName: {
      type: String,
      default: '',
    },
    licenseNumber: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Agent approval workflow
agentRequest: {
  status: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none',
  },
  requestedAt: {
    type: Date,
  },
  reviewedAt: {
    type: Date,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  rejectionReason: {
    type: String,
    default: '',
  },
},

    // Wishlist - array of property IDs
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
      },
    ],

    passwordResetToken: String,
    passwordResetExpires: Date,
    
  },
  {
    timestamps: true,
  }
);

// Match password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ✅ Correct pre-save middleware – async function, no 'next' parameter
userSchema.pre('save', async function () {
  // Only hash password if it has been modified
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;