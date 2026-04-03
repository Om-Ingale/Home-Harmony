// routes/payment.js

const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn } = require("../middleware");
const razorpay = require("../utils/razorpay");
const crypto = require("crypto");

// ── POST /payment/create-order ────────────────────────────────────────────────
router.post("/create-order", isLoggedIn, catchAsync(async (req, res) => {
    const { amount, productId, productTitle } = req.body;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
        return res.status(400).json({ success: false, message: "Invalid amount." });
    }

    const options = {
        amount: Math.round(Number(amount) * 100),
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
        notes: { productId, productTitle, userId: req.user._id.toString() },
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
}));

// ── POST /payment/verify ──────────────────────────────────────────────────────
router.post("/verify", isLoggedIn, (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ success: false, message: "Missing payment fields." });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

    if (expected === razorpay_signature) {
        res.json({ success: true, paymentId: razorpay_payment_id });
    } else {
        res.status(400).json({ success: false, message: "Payment verification failed." });
    }
});

module.exports = router;