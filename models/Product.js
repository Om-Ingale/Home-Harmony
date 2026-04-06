// models/Product.js

const mongoose = require("mongoose");
const Review = require("./Review");

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  filename: { type: String, required: true },
});

imageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload/", "/upload/w_400,h_300,c_fill/");
});

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String, required: [true, "Title is required"],
      trim: true, maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String, required: [true, "Description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: String, required: true,
      enum: ["furniture", "appliance", "decor", "electronics", "other"],
    },
    subcategory: {
      type: String, trim: true,
    },
    type: {
      type: String, required: true,
      enum: ["rent", "buy", "sell"],
    },
    condition: {
      type: String,
      enum: ["new", "refurbished", "used"],
      default: "used",
    },
    price: {
      type: Number, required: true, min: [0, "Price cannot be negative"],
    },
    rentPerMonth: {
      type: Number, min: [0, "Rent cannot be negative"],
    },

    // ── Phase 8: Stock & Availability ─────────────────────────────────────
    isAvailable: {
      type: Boolean, default: true,
    },
    stock: {
      type: Number, min: [0, "Stock cannot be negative"],
    },
    availableStock: {
      type: Number, min: [0, "Available stock cannot be negative"],
    },

    // ── Phase 8: Ownership Type ───────────────────────────────────────────
    ownerType: {
      type: String,
      enum: ["user", "platform"],
      default: "user",
    },

    images: [imageSchema],
    location: { type: String, trim: true },
    city: { type: String, required: true, trim: true },

    // ── MapBox GeoJSON point ───────────────────────────────────────────────
    geometry: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
      placeName: String,
    },

    status: {
      type: String,
      enum: ["available", "rented", "sold"],
      default: "available",
    },

    // nullable for platform products (rent/buy)
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── 2dsphere index ─────────────────────────────────────────────────────────────
productSchema.index({ geometry: "2dsphere" });

// ── Average rating virtual ─────────────────────────────────────────────────────
productSchema.virtual("averageRating").get(function () {
  if (!this.reviews || this.reviews.length === 0) return 0;
  const populated = this.reviews.filter((r) => r.rating !== undefined);
  if (!populated.length) return 0;
  return (populated.reduce((acc, r) => acc + r.rating, 0) / populated.length).toFixed(1);
});

// ── Cascade delete reviews ─────────────────────────────────────────────────────
productSchema.post("findOneAndDelete", async function (doc) {
  if (doc?.reviews?.length) {
    await Review.deleteMany({ _id: { $in: doc.reviews } });
  }
});

module.exports = mongoose.model("Product", productSchema);
