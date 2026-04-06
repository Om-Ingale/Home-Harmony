// controllers/orderController.js

const Order   = require("../models/Order");
const Product = require("../models/Product");
const Address = require("../models/Address");
const { generateReceipt }        = require("../utils/pdfReceipt");
const { sendOrderConfirmation, sendSellerNotification } = require("../utils/mailer");

// ── GET /orders/checkout/:productId ───────────────────────────────────────────
const renderCheckout = async (req, res) => {
  const product = await Product.findById(req.params.productId).populate("owner");
  if (!product) {
    req.flash("error", "Listing not found.");
    return res.redirect("/products");
  }

  // Availability check
  if (!product.isAvailable) {
    req.flash("error", "This listing is currently unavailable.");
    return res.redirect(`/products/${product._id}`);
  }

  // Stock check for rent/buy
  if ((product.type === "rent" || product.type === "buy") && product.availableStock <= 0) {
    req.flash("error", "This item is out of stock.");
    return res.redirect(`/products/${product._id}`);
  }

  // Block owner from ordering own sell listing
  if (product.ownerType === "user" && product.owner?._id.equals(req.user._id)) {
    req.flash("error", "You cannot order your own listing.");
    return res.redirect(`/products/${product._id}`);
  }

  const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1 });

  res.render("orders/checkout", {
    title:       `Checkout — ${product.title}`,
    product,
    addresses,
    razorpayKey: process.env.RAZORPAY_KEY_ID,
  });
};

// ── GET /orders/my-orders ─────────────────────────────────────────────────────
const myOrders = async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id })
    .populate("product", "title images type")
    .populate("address")
    .sort({ createdAt: -1 });

  res.render("orders/my-orders", {
    title: "My Orders — Home Harmony",
    orders,
  });
};

// ── GET /orders/:id ───────────────────────────────────────────────────────────
const showOrder = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("product", "title images type category")
    .populate("address")
    .populate("buyer",  "username email")
    .populate("seller", "username email");

  if (!order) {
    req.flash("error", "Order not found.");
    return res.redirect("/orders/my-orders");
  }

  // Only buyer (or admin) can view
  if (!order.buyer._id.equals(req.user._id) && req.user.role !== "admin") {
    req.flash("error", "Access denied.");
    return res.redirect("/orders/my-orders");
  }

  res.render("orders/confirm", {
    title: `Order #${order._id.toString().slice(-8).toUpperCase()} — Home Harmony`,
    order,
  });
};

// ── GET /orders/:id/receipt ───────────────────────────────────────────────────
const downloadReceipt = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("product")
    .populate("address")
    .populate("buyer");

  if (!order || !order.buyer._id.equals(req.user._id)) {
    req.flash("error", "Receipt not found.");
    return res.redirect("/orders/my-orders");
  }

  const pdfBuffer = await generateReceipt(order, order.buyer, order.product, order.address);
  const filename  = `receipt-${order._id.toString().slice(-8).toUpperCase()}.pdf`;

  res.setHeader("Content-Type",        "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(pdfBuffer);
};

module.exports = { renderCheckout, myOrders, showOrder, downloadReceipt };
