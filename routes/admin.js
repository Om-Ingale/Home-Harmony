// routes/admin.js

const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAdmin } = require("../middleware");
const adminController = require("../controllers/adminController");
const Order = require("../models/Order");
const Product = require("../models/Product");

router.use(isLoggedIn, isAdmin);

router.get("/", catchAsync(adminController.dashboard));
router.get("/users", catchAsync(adminController.listUsers));
router.get("/products", catchAsync(adminController.listProducts));
router.get("/reviews", catchAsync(adminController.listReviews));

router.delete("/users/:id", catchAsync(adminController.deleteUser));
router.delete("/products/:id", catchAsync(adminController.deleteProduct));
router.delete("/reviews/:id", catchAsync(adminController.deleteReview));

router.post("/users/:id/toggle-role", catchAsync(adminController.toggleRole));

// ── GET /admin/orders ─────────────────────────────────────────────────────────
router.get("/orders", catchAsync(async (req, res) => {
    const orders = await Order.find()
        .populate("buyer", "username email")
        .populate("seller", "username")
        .populate("product", "title type ownerType")
        .populate("address")
        .sort({ createdAt: -1 });

    res.render("admin/orders", { title: "Orders — Admin", orders });
}));

// ── PATCH /admin/orders/:id/status ────────────────────────────────────────────
router.patch("/orders/:id/status", catchAsync(async (req, res) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id)
        .populate("buyer")
        .populate("product", "title type ownerType availableStock stock isAvailable status");

    if (!order) return res.status(404).json({ success: false, message: "Order not found." });

    const prevStatus = order.status;
    order.status = status;
    await order.save();

    // ── Restore stock if admin cancels ────────────────────────────────────────
    if (status === "cancelled" && prevStatus !== "cancelled" && order.product) {
        const product = await Product.findById(order.product._id || order.product);
        if (product) {
            if (product.type === "rent" || product.type === "buy") {
                product.availableStock = Math.min(
                    (product.availableStock || 0) + 1,
                    product.stock || Infinity
                );
                product.isAvailable = true;
                if (product.availableStock > 0) product.status = "available";
            } else {
                product.isAvailable = true;
                product.status = "available";
            }
            await product.save();
        }
    }

    // ── Status update email ────────────────────────────────────────────────────
    try {
        const { sendStatusUpdate } = require("../utils/mailer");
        await sendStatusUpdate(order, order.buyer, order.product);
    } catch (e) {
        console.error("Status email error:", e);
    }

    res.json({ success: true });
}));

module.exports = router;
