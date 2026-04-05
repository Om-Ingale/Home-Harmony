const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    type: {
      type: String,
      enum: ["buy", "rent"],
      required: true,
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },

    // ── Rent only ─────────────────────────────────────────────
    startDate:  { type: Date },
    endDate:    { type: Date },
    totalDays:  { type: Number },

    // ── Pricing ───────────────────────────────────────────────
    totalAmount: { type: Number, required: true },

    // ── Status ────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "confirmed", "in_transit", "delivered", "cancelled"],
      default: "pending",
    },

    // ── Razorpay ──────────────────────────────────────────────
    paymentId:       { type: String },
    razorpayOrderId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);