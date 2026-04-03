// routes/reviews.js

const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isReviewAuthor } = require("../middleware");
const reviewController = require("../controllers/reviewController");

// POST /products/:id/reviews
router.post("/:id/reviews", isLoggedIn, catchAsync(reviewController.createReview));

// DELETE /products/:id/reviews/:reviewId
router.delete("/:id/reviews/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviewController.deleteReview));

module.exports = router;