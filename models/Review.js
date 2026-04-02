// models/Review.js

const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    comment: {
      type:      String,
      required:  [true, "Review comment is required"],
      trim:      true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },

    rating: {
      type:     Number,
      required: [true, "Rating is required"],
      min:      [1, "Rating must be at least 1"],
      max:      [5, "Rating cannot exceed 5"],
    },

    author: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },

    product: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Product",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);