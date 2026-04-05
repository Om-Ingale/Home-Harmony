// routes/orders.js

const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn } = require("../middleware");
const orderController = require("../controllers/orderController");
const Order = require("../models/Order");
const Product = require("../models/Product");

router.get("/checkout/:productId", isLoggedIn, catchAsync(orderController.renderCheckout));
router.get("/my-orders", isLoggedIn, catchAsync(orderController.myOrders));
router.get("/:id/receipt", isLoggedIn, catchAsync(orderController.downloadReceipt));
router.get("/:id", isLoggedIn, catchAsync(orderController.showOrder));

// ── PATCH /orders/:id/cancel ──────────────────────────────────────────────────
router.patch("/:id/cancel", isLoggedIn, catchAsync(async (req, res) => {
    const order = await Order.findById(req.params.id).populate("product");

    if (!order) {
        req.flash("error", "Order not found.");
        return res.redirect("/orders/my-orders");
    }
    if (!order.buyer.equals(req.user._id)) {
        req.flash("error", "Access denied.");
        return res.redirect("/orders/my-orders");
    }
    if (order.status === "delivered" || order.status === "cancelled") {
        req.flash("error", "This order cannot be cancelled.");
        return res.redirect(`/orders/${order._id}`);
    }

    order.status = "cancelled";
    await order.save();

    await Product.findByIdAndUpdate(order.product._id, { status: "available" });

    req.flash("success", "Order cancelled successfully. 🚫");
    res.redirect(`/orders/${order._id}`);
}));

module.exports = router;