// middleware/index.js

const Product      = require("../models/Product");
const Review       = require("../models/Review");
const ExpressError = require("../utils/ExpressError");

// ─── isLoggedIn ───────────────────────────────────────────────────────────────
// Protects any route that requires authentication.
// Saves the originally requested URL so we can redirect back after login.
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  req.session.returnTo = req.originalUrl;
  req.flash("error", "You must be signed in to do that.");
  res.redirect("/auth/login");
};

// ─── storeReturnTo ────────────────────────────────────────────────────────────
// Passport clears req.session on login; this middleware copies returnTo
// into res.locals BEFORE passport.authenticate() runs, so we can still use it.
const storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

// ─── isOwner ──────────────────────────────────────────────────────────────────
// Ensures only the product owner can edit or delete a listing.
const isOwner = async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    req.flash("error", "Product not found.");
    return res.redirect("/products");
  }
  if (!product.owner.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that.");
    return res.redirect(`/products/${id}`);
  }
  next();
};

// ─── isReviewAuthor ───────────────────────────────────────────────────────────
// Ensures only the review author can delete their own review.
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

module.exports = { isLoggedIn, storeReturnTo, isOwner, isReviewAuthor };