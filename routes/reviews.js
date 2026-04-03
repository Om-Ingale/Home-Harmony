// routes/reviews.js

const express    = require("express");
const router     = express.Router({ mergeParams: true }); // access :id from parent
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isReviewAuthor } = require("../middleware");
const reviewController               = require("../controllers/reviewController");

// ── Create review ─────────────────────────────
router.post("/reviews", isLoggedIn, catchAsync(reviewController.createReview));

// ── Delete review ─────────────────────────────
router.delete(
  "/reviews/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviewController.deleteReview)
);

module.exports = router;    