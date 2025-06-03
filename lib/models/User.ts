import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false,
  },
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
    maxlength: [50, "First name cannot exceed 50 characters"],
  },

  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true,
    maxlength: [50, "Last name cannot exceed 50 characters"],
  },  role: {
    type: String,
    enum: ["member", "manager", "admin"],
    default: "member",
  },
  savedPaymentInfo: {
    cardName: { type: String, default: "" },
    cardNumber: { type: String, default: "" }, // Last 4 digits only for security
    expiryDate: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    zipCode: { type: String, default: "" },
  },
});

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
