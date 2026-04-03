// controllers/reviewController.js

const Product = require("../models/Product");
const Review  = require("../models/Review");

// ── POST /products/:id/reviews ────────────────
const createReview = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    req.flash("error", "Product not found.");
    return res.redirect("/products");
  }

  // Prevent duplicate reviews from the same user on the same product
  const existing = await Review.findOne({
    product: product._id,
    author:  req.user._id,
  });
  if (existing) {
    req.flash("error", "You have already reviewed this listing.");
    return res.redirect(`/products/${product._id}`);
  }

  const review    = new Review(req.body.review);
  review.author   = req.user._id;
  review.product  = product._id;
  await review.save();

  product.reviews.push(review);
  await product.save();

  req.flash("success", "Review added! Thanks for your feedback. ⭐");
  res.redirect(`/products/${product._id}`);
};

// ── DELETE /products/:id/reviews/:reviewId ────
const deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;

  // Pull the review ref from product's reviews array + delete the Review doc
  await Product.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review deleted.");
  res.redirect(`/products/${id}`);
};

module.exports = { createReview, deleteReview };