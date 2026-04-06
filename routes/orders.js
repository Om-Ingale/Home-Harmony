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

    // ── Restore stock on cancellation ─────────────────────────────────────────
    if (order.product) {
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
                // sell listing — restore
                product.isAvailable = true;
                product.status = "available";
            }
            await product.save();
        }
    }

    req.flash("success", "Order cancelled successfully. 🚫");
    res.redirect(`/orders/${order._id}`);
}));

module.exports = router;
