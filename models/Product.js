// models/Product.js

const mongoose = require("mongoose");
const Review   = require("./Review");

const imageSchema = new mongoose.Schema({
  url:      { type: String, required: true },
  filename: { type: String, required: true },
});

// Virtual: generate a thumbnail URL (useful for Cloudinary or similar)
imageSchema.virtual("thumbnail").get(function () {
  // If using Cloudinary, replace '/upload/' with '/upload/w_300/'
  return this.url.replace("/upload/", "/upload/w_300/");
});

const productSchema = new mongoose.Schema(
  {
    title: {
      type:      String,
      required:  [true, "Product title is required"],
      trim:      true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    description: {
      type:      String,
      required:  [true, "Description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    category: {
      type:     String,
      required: [true, "Category is required"],
      enum:     {
        values:  ["furniture", "appliance", "decor", "electronics", "other"],
        message: "{VALUE} is not a valid category",
      },
    },

    type: {
      type:     String,
      required: [true, "Listing type is required"],
      enum:     {
        values:  ["rent", "buy", "sell"],
        message: "{VALUE} is not a valid listing type",
      },
    },

    price: {
      type:     Number,
      required: [true, "Price is required"],
      min:      [0, "Price cannot be negative"],
    },

    // Only relevant when type === 'rent'
    rentPerMonth: {
      type: Number,
      min:  [0, "Rent cannot be negative"],
    },

    images: [imageSchema],

    location: {
      type:  String,
      trim:  true,
    },

    city: {
      type:     String,
      required: [true, "City is required"],
      trim:     true,
    },

    status: {
      type:    String,
      enum:    ["available", "rented", "sold"],
      default: "available",
    },

    owner: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },

    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:  "Review",
      },
    ],
  },
  {
    timestamps:  true,
    toJSON:      { virtuals: true },
    toObject:    { virtuals: true },
  }
);

// ─── Virtual: average rating ──────────────────────────────────────────────────
// Computed on-the-fly from populated reviews. Not stored in DB.
productSchema.virtual("averageRating").get(function () {
  if (!this.reviews || this.reviews.length === 0) return 0;
  const populated = this.reviews.filter((r) => r.rating !== undefined);
  if (populated.length === 0) return 0;
  const sum = populated.reduce((acc, r) => acc + r.rating, 0);
  return (sum / populated.length).toFixed(1);
});

// ─── Middleware: cascade-delete reviews when a product is removed ─────────────
productSchema.post("findOneAndDelete", async function (doc) {
  if (doc && doc.reviews.length) {
    await Review.deleteMany({ _id: { $in: doc.reviews } });
  }
});

module.exports = mongoose.model("Product", productSchema);