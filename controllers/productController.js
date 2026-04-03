// controllers/productController.js  (full Phase 6 version)

const Product           = require("../models/Product");
const { cloudinary }    = require("../utils/cloudinary");
const { geocode }       = require("../utils/mapbox");

// ── GET /products ─────────────────────────────────────────────────────────────
const index = async (req, res) => {
  const { category, type, city, search } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (type)     filter.type     = type;
  if (city)     filter.city     = new RegExp(city, "i");
  if (search)   filter.title    = new RegExp(search, "i");

  const products = await Product.find(filter)
    .populate("owner", "username avatar")
    .sort({ createdAt: -1 });

  res.render("products/index", {
    title: "Browse Listings — Home Harmony",
    products,
    filters: req.query,
    mapboxToken: process.env.MAPBOX_TOKEN,
  });
};

// ── GET /products/new ─────────────────────────────────────────────────────────
const renderNewForm = (req, res) => {
  res.render("products/new", { title: "New Listing — Home Harmony" });
};

// ── POST /products ────────────────────────────────────────────────────────────
const createProduct = async (req, res) => {
  const productData = req.body.product;

  // ── Cloudinary uploaded images ────────────────
  if (req.files?.length) {
    productData.images = req.files.map((f) => ({
      url:      f.path,
      filename: f.filename,
    }));
  } else {
    productData.images = [{
      url:      "https://placehold.co/800x600?text=Home+Harmony",
      filename: "placeholder",
    }];
  }

  // ── Geocode city + location ───────────────────
  const geoQuery = `${productData.location || ""} ${productData.city}, India`.trim();
  const geo      = await geocode(geoQuery);
  if (geo) productData.geometry = geo;

  const product = new Product(productData);
  product.owner = req.user._id;
  await product.save();

  req.flash("success", "Listing created successfully! 🛋️");
  res.redirect(`/products/${product._id}`);
};

// ── GET /products/:id ─────────────────────────────────────────────────────────
const showProduct = async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate({ path: "reviews", populate: { path: "author", select: "username avatar" } })
    .populate("owner", "username avatar email phone");

  if (!product) {
    req.flash("error", "Listing not found.");
    return res.redirect("/products");
  }

  res.render("products/show", {
    title:       `${product.title} — Home Harmony`,
    product,
    mapboxToken: process.env.MAPBOX_TOKEN,
    razorpayKey: process.env.RAZORPAY_KEY_ID,
  });
};

// ── GET /products/:id/edit ────────────────────────────────────────────────────
const renderEditForm = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    req.flash("error", "Listing not found.");
    return res.redirect("/products");
  }
  res.render("products/edit", { title: `Edit — ${product.title}`, product });
};

// ── PUT /products/:id ─────────────────────────────────────────────────────────
const updateProduct = async (req, res) => {
  const { id }      = req.params;
  const product     = await Product.findById(id);
  const productData = req.body.product;

  // ── Append new uploaded images ─────────────────
  if (req.files?.length) {
    const newImages = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    product.images.push(...newImages);
  }

  // ── Delete selected images from Cloudinary ─────
  if (req.body.deleteImages?.length) {
    for (const filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await product.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }

  // ── Re-geocode if city changed ─────────────────
  if (productData.city && productData.city !== product.city) {
    const geoQuery = `${productData.location || ""} ${productData.city}, India`.trim();
    const geo      = await geocode(geoQuery);
    if (geo) productData.geometry = geo;
  }

  Object.assign(product, productData);
  await product.save();

  req.flash("success", "Listing updated successfully! ✅");
  res.redirect(`/products/${id}`);
};

// ── DELETE /products/:id ──────────────────────────────────────────────────────
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    // Delete all images from Cloudinary
    for (const img of product.images) {
      if (img.filename !== "placeholder") {
        await cloudinary.uploader.destroy(img.filename);
      }
    }
    await Product.findByIdAndDelete(req.params.id);
  }
  req.flash("success", "Listing deleted.");
  res.redirect("/products");
};

module.exports = {
  index, renderNewForm, createProduct,
  showProduct, renderEditForm, updateProduct, deleteProduct,
};