// utils/razorpay.js

const Razorpay = require("razorpay");

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("❌ Razorpay keys missing — payment will fail");
}

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID     || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

module.exports = razorpay;