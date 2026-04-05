const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn } = require("../middleware");
const razorpay = require("../utils/razorpay");

const Order = require("../models/Order");
const Product = require("../models/Product");
const Address = require("../models/Address");
const User = require("../models/User");

const { generateReceipt } = require("../utils/pdfReceipt");
const { sendOrderConfirmation, sendSellerNotification } = require("../utils/mailer");

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
router.post("/verify", isLoggedIn, catchAsync(async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderMeta,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ success: false, message: "Missing payment fields." });
    }

    // ── Verify signature ───────────────────────────────────────────────────────
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

    if (expected !== razorpay_signature) {
        return res.status(400).json({ success: false, message: "Payment verification failed." });
    }

    // ── Build order document ───────────────────────────────────────────────────
    const product = await Product.findById(orderMeta.productId).populate("owner");
    const address = await Address.findById(orderMeta.addressId);
    const buyer = await User.findById(req.user._id);
    const seller = product.owner;

    const orderData = {
        buyer: buyer._id,
        seller: seller._id,
        product: product._id,
        type: orderMeta.type,
        address: address._id,
        totalAmount: orderMeta.totalAmount,
        status: "confirmed",
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
    };

    if (orderMeta.type === "rent") {
        const startDate = new Date(orderMeta.startDate);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + Number(orderMeta.totalDays));

        orderData.startDate = startDate;
        orderData.endDate = endDate;
        orderData.totalDays = Number(orderMeta.totalDays);
    }

    const order = new Order(orderData);
    await order.save();

    // ── Update product status ──────────────────────────────────────────────────
    if (orderMeta.type === "buy") {
        await Product.findByIdAndUpdate(product._id, { status: "sold" });
    } else if (orderMeta.type === "rent") {
        await Product.findByIdAndUpdate(product._id, { status: "rented" });
    }

    // ── Generate PDF receipt ───────────────────────────────────────────────────
    let pdfBuffer = null;
    try {
        pdfBuffer = await generateReceipt(order, buyer, product, address);
    } catch (e) {
        console.error("PDF generation error:", e);
    }

    // ── Send emails (non-blocking) ─────────────────────────────────────────────
    try {
        await sendOrderConfirmation(order, buyer, product, address, pdfBuffer);
        await sendSellerNotification(order, seller, buyer, product);
    } catch (e) {
        console.error("Email send error:", e);
    }

    res.json({ success: true, paymentId: razorpay_payment_id, orderId: order._id });
}));

module.exports = router;