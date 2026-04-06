// routes/payment.js

const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn } = require("../middleware");
const razorpay = require("../utils/razorpay");
const ExpressError = require("../utils/ExpressError");

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

    // Quick stock pre-check before payment
    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json({ success: false, message: "Product not found." });
    }
    if ((product.type === "rent" || product.type === "buy") && product.availableStock <= 0) {
        return res.status(400).json({ success: false, message: "This item is out of stock." });
    }
    if (!product.isAvailable) {
        return res.status(400).json({ success: false, message: "This item is unavailable." });
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

    // ── Verify HMAC signature ──────────────────────────────────────────────────
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

    if (expected !== razorpay_signature) {
        return res.status(400).json({ success: false, message: "Payment verification failed." });
    }

    // ── Fetch entities ─────────────────────────────────────────────────────────
    const product = await Product.findById(orderMeta.productId).populate("owner");
    if (!product) {
        return res.status(404).json({ success: false, message: "Product not found." });
    }

    // ── Final stock check (atomic guard) ─────────────────────────────────────
    if ((product.type === "rent" || product.type === "buy") && product.availableStock <= 0) {
        return res.status(400).json({ success: false, message: "Sorry, this item just went out of stock." });
    }

    const address = await Address.findById(orderMeta.addressId);
    const buyer = await User.findById(req.user._id);

    // ── Decrement stock ────────────────────────────────────────────────────────
    if (product.type === "rent" || product.type === "buy") {
        product.availableStock = Math.max(0, product.availableStock - 1);
        if (product.availableStock === 0) {
            product.isAvailable = false;
            product.status = product.type === "buy" ? "sold" : "rented";
        }
        await product.save();
    } else {
        // sell listing → mark as sold
        product.isAvailable = false;
        product.status = "sold";
        await product.save();
    }

    // ── Build order document ───────────────────────────────────────────────────
    const orderData = {
        buyer: buyer._id,
        seller: product.ownerType === "user" ? product.owner?._id : null,
        product: product._id,
        type: orderMeta.type,
        address: address._id,
        totalAmount: orderMeta.totalAmount,
        status: "confirmed",
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,

        // ── Snapshots ────────────────────────────────────────────────────────────
        userDetails: {
            name: buyer.username,
            email: buyer.email,
        },
        productDetails: {
            title: product.title,
            price: product.price,
            type: product.type,
        },
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

    // ── PDF receipt ────────────────────────────────────────────────────────────
    let pdfBuffer = null;
    try {
        pdfBuffer = await generateReceipt(order, buyer, product, address);
    } catch (e) {
        console.error("PDF generation error:", e);
    }

    // ── Emails ─────────────────────────────────────────────────────────────────
    try {
        await sendOrderConfirmation(order, buyer, product, address, pdfBuffer);
        if (product.ownerType === "user" && product.owner) {
            await sendSellerNotification(order, product.owner, buyer, product);
        }
    } catch (e) {
        console.error("Email send error:", e);
    }

    res.json({ success: true, paymentId: razorpay_payment_id, orderId: order._id });
}));

module.exports = router;
