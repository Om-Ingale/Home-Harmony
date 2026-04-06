// models/User.js

const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Invalid email format"],
    },

    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-]{7,15}$/, "Invalid phone number"],
    },

    avatar: {
      url: { type: String, default: "https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=User" },
      filename: { type: String, default: "" },
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

userSchema.plugin(passportLocalMongoose);

// ── Phase 8: Cascade delete ONLY user-owned sell products on user deletion ─────
userSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;
  const Product = require("./Product");
  const { cloudinary } = require("../utils/cloudinary");

  // Only delete sell listings owned by this user — never touch platform products
  const userProducts = await Product.find({ owner: doc._id, type: "sell" });
  for (const product of userProducts) {
    for (const img of product.images || []) {
      if (img.filename && img.filename !== "placeholder") {
        try { await cloudinary.uploader.destroy(img.filename); } catch (e) { /* ignore */ }
      }
    }
    await Product.findByIdAndDelete(product._id);
  }
});

module.exports = mongoose.model("User", userSchema);
