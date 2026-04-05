const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    label: {
      type: String,
      enum: ["Home", "Work", "Other"],
      default: "Home",
    },
    fullName: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{10}$/, "Phone must be 10 digits"],
    },
    line1:   { type: String, required: true, trim: true },
    line2:   { type: String, trim: true, default: "" },
    city:    { type: String, required: true, trim: true },
    state:   { type: String, required: true, trim: true },
    pincode: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{6}$/, "Pincode must be 6 digits"],
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", addressSchema);