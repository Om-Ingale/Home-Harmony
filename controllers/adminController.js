// controllers/adminController.js

const User    = require("../models/User");
const Product = require("../models/Product");
const Review  = require("../models/Review");
const { cloudinary } = require("../utils/cloudinary");

// ── GET /admin ────────────────────────────────────────────────────────────────
const dashboard = async (req, res) => {
  const [userCount, productCount, reviewCount, recentProducts] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Review.countDocuments(),
    Product.find().sort({ createdAt: -1 }).limit(5).populate("owner", "username"),
  ]);

  // Stats: products by type
  const rentCount     = await Product.countDocuments({ type: "rent" });
  const buyCount      = await Product.countDocuments({ type: "buy" });
  const sellCount     = await Product.countDocuments({ type: "sell" });
  const availableCount = await Product.countDocuments({ status: "available" });

  res.render("admin/dashboard", {
    title: "Admin Dashboard — Home Harmony",
    stats: { userCount, productCount, reviewCount, rentCount, buyCount, sellCount, availableCount },
    recentProducts,
  });
};

// ── GET /admin/users ──────────────────────────────────────────────────────────
const listUsers = async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.render("admin/users", { title: "Manage Users", users });
};

// ── GET /admin/products ───────────────────────────────────────────────────────
const listProducts = async (req, res) => {
  const products = await Product.find()
    .populate("owner", "username")
    .sort({ createdAt: -1 });
  res.render("admin/products", { title: "Manage Listings", products });
};

// ── GET /admin/reviews ────────────────────────────────────────────────────────
const listReviews = async (req, res) => {
  const reviews = await Review.find()
    .populate("author", "username")
    .populate("product", "title")
    .sort({ createdAt: -1 });
  res.render("admin/reviews", { title: "Manage Reviews", reviews });
};

// ── DELETE /admin/users/:id ───────────────────────────────────────────────────
const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  req.flash("success", "User deleted.");
  res.redirect("/admin/users");
};

// ── DELETE /admin/products/:id ────────────────────────────────────────────────
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    for (const img of product.images) {
      if (img.filename !== "placeholder") {
        await cloudinary.uploader.destroy(img.filename);
      }
    }
    await Product.findByIdAndDelete(req.params.id);
  }
  req.flash("success", "Listing deleted.");
  res.redirect("/admin/products");
};

// ── DELETE /admin/reviews/:id ─────────────────────────────────────────────────
const deleteReview = async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (review) {
    await Product.findByIdAndUpdate(review.product, {
      $pull: { reviews: review._id },
    });
  }
  req.flash("success", "Review deleted.");
  res.redirect("/admin/reviews");
};

// ── POST /admin/users/:id/toggle-role ─────────────────────────────────────────
const toggleRole = async (req, res) => {
  const user  = await User.findById(req.params.id);
  user.role   = user.role === "admin" ? "user" : "admin";
  await user.save();
  req.flash("success", `${user.username} is now a ${user.role}.`);
  res.redirect("/admin/users");
};

module.exports = {
  dashboard, listUsers, listProducts, listReviews,
  deleteUser, deleteProduct, deleteReview, toggleRole,
};