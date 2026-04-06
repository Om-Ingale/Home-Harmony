// middleware/index.js

const Product = require("../models/Product");
const Review = require("../models/Review");
const ExpressError = require("../utils/ExpressError");

// ── isLoggedIn ────────────────────────────────────────────────────────────────
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  req.session.returnTo = req.originalUrl;
  req.flash("error", "You must be signed in to do that.");
  res.redirect("/auth/login");
};

// ── storeReturnTo ─────────────────────────────────────────────────────────────
const storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

// ── isAdmin ───────────────────────────────────────────────────────────────────
const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "admin") return next();
  req.flash("error", "You must be an admin to access this page.");
  res.redirect("/");
};

// ── isOwner ───────────────────────────────────────────────────────────────────
// Platform products (rent/buy) → admin only
// User products (sell) → owner only
const isOwner = async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    req.flash("error", "Product not found.");
    return res.redirect("/products");
  }

  // Platform products can only be managed by admin
  if (product.ownerType === "platform") {
    if (req.user.role !== "admin") {
      req.flash("error", "Only admins can modify platform listings.");
      return res.redirect(`/products/${id}`);
    }
    return next();
  }

  // User sell listings — must be owner
  if (!product.owner || !product.owner.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that.");
    return res.redirect(`/products/${id}`);
  }
  next();
};

// ── isReviewAuthor ────────────────────────────────────────────────────────────
const isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review) {
    req.flash("error", "Review not found.");
    return res.redirect(`/products/${id}`);
  }
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that.");
    return res.redirect(`/products/${id}`);
  }
  next();
};

module.exports = { isLoggedIn, storeReturnTo, isOwner, isReviewAuthor, isAdmin };
