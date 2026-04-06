// controllers/productController.js

const Product = require("../models/Product");
const { cloudinary } = require("../utils/cloudinary");
const { geocode } = require("../utils/mapbox");
const ExpressError = require("../utils/ExpressError");

// ── Subcategory map ────────────────────────────────────────────────────────────
const SUBCATEGORIES = {
  furniture: ["beds", "sofas", "chairs", "tables"],
  appliance: ["AC", "washing machine", "refrigerator", "microwave", "TV"],
  electronics: ["laptop", "monitor", "speaker"],
};

// ── Category rules per type ───────────────────────────────────────────────────
const CATEGORY_BY_TYPE = {
  rent: ["furniture", "appliance", "electronics"],
  buy: ["furniture"],
  sell: ["furniture", "appliance", "decor", "electronics", "other"],
};

// ── GET /products ─────────────────────────────────────────────────────────────
const index = async (req, res) => {
  const {
    category, subcategory, type, city, search,
    minPrice, maxPrice, condition, inStock, sort,
    page = 1,
  } = req.query;

  const limit = 15;
  const currentPage = parseInt(page) || 1;
  const filter = {};

  // ── Type ──────────────────────────────────────────────────────────────────
  if (type) filter.type = type;

  // ── Category (restricted by type) ────────────────────────────────────────
  if (category) {
    const allowed = type ? CATEGORY_BY_TYPE[type] : null;
    if (!allowed || allowed.includes(category)) {
      filter.category = category;
    }
  }

  // ── Subcategory ───────────────────────────────────────────────────────────
  if (subcategory) filter.subcategory = subcategory;

  // ── City ──────────────────────────────────────────────────────────────────
  if (city) filter.city = new RegExp(city.trim(), "i");

  // ── Search title ──────────────────────────────────────────────────────────
  if (search) filter.title = new RegExp(search.trim(), "i");

  // ── Condition ─────────────────────────────────────────────────────────────
  if (condition) filter.condition = condition;

  // ── Stock filter for rent/buy ─────────────────────────────────────────────
  if (type === "rent" || type === "buy") {
    filter.availableStock = { $gt: 0 };
  } else if (inStock === "true") {
    // Generic in-stock toggle (for sell → isAvailable)
    filter.isAvailable = true;
  }

  // ── Price range ───────────────────────────────────────────────────────────
  const priceField = type === "rent" ? "rentPerMonth" : "price";
  if (minPrice || maxPrice) {
    filter[priceField] = {};
    if (minPrice) filter[priceField].$gte = Number(minPrice);
    if (maxPrice) filter[priceField].$lte = Number(maxPrice);
  }

  // ── Sort ──────────────────────────────────────────────────────────────────
  let sortQuery = { createdAt: -1 };
  if (sort === "price_asc") sortQuery = { [priceField]: 1 };
  if (sort === "price_desc") sortQuery = { [priceField]: -1 };
  if (sort === "newest") sortQuery = { createdAt: -1 };

  const totalProducts = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate("owner", "username avatar")
    .sort(sortQuery)
    .skip((currentPage - 1) * limit)
    .limit(limit);

  const totalPages = Math.ceil(totalProducts / limit);

  // Active filter tags for UI
  const activeFilters = [];
  if (type) activeFilters.push({ key: "type", label: type });
  if (category) activeFilters.push({ key: "category", label: category });
  if (subcategory) activeFilters.push({ key: "subcategory", label: subcategory });
  if (city) activeFilters.push({ key: "city", label: city });
  if (condition) activeFilters.push({ key: "condition", label: condition });
  if (inStock === "true") activeFilters.push({ key: "inStock", label: "In Stock" });
  if (minPrice) activeFilters.push({ key: "minPrice", label: `Min ₹${minPrice}` });
  if (maxPrice) activeFilters.push({ key: "maxPrice", label: `Max ₹${maxPrice}` });

  res.render("products/index", {
    title: "Browse Listings — Home Harmony",
    products,
    filters: req.query,
    activeFilters,
    subcategories: SUBCATEGORIES,
    categoryByType: CATEGORY_BY_TYPE,
    mapboxToken: process.env.MAPBOX_TOKEN,
    currentPage,
    totalPages,
    totalProducts,
  });
};

// ── GET /products/new ─────────────────────────────────────────────────────────
const renderNewForm = (req, res) => {
  res.render("products/new", {
    title: "New Listing — Home Harmony",
    subcategories: SUBCATEGORIES,
    categoryByType: CATEGORY_BY_TYPE,
  });
};

// ── POST /products ────────────────────────────────────────────────────────────
const createProduct = async (req, res) => {
  const productData = req.body.product;
  const isAdmin = req.user.role === "admin";

  // ── Type-based ownership rules ─────────────────────────────────────────────
  if (productData.type === "rent" || productData.type === "buy") {
    if (!isAdmin) {
      req.flash("error", "Only admins can create rent or buy listings.");
      return res.redirect("/products");
    }
    productData.ownerType = "platform";
    productData.owner = null;

    // Stock required for platform products
    const stock = parseInt(productData.stock);
    if (!stock || stock < 1) {
      req.flash("error", "Stock quantity is required for rent/buy listings.");
      return res.redirect("/products/new");
    }
    productData.stock = stock;
    productData.availableStock = stock;
    productData.isAvailable = true;
  } else {
    // sell → user-owned
    productData.ownerType = "user";
    productData.owner = req.user._id;
    productData.isAvailable = true;
    productData.stock = undefined;
    productData.availableStock = undefined;
  }

  // ── Images ─────────────────────────────────────────────────────────────────
  productData.images = req.files?.length
    ? req.files.map((f) => ({ url: f.path, filename: f.filename }))
    : [{ url: "https://placehold.co/800x600?text=Home+Harmony", filename: "placeholder" }];

  // ── Geocode ────────────────────────────────────────────────────────────────
  const geoQuery = `${productData.location || ""} ${productData.city}, India`.trim();
  const geo = await geocode(geoQuery);
  if (geo) productData.geometry = geo;

  const product = new Product(productData);
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
    title: `${product.title} — Home Harmony`,
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
  res.render("products/edit", {
    title: `Edit — ${product.title}`,
    product,
    subcategories: SUBCATEGORIES,
  });
};

// ── PUT /products/:id ─────────────────────────────────────────────────────────
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    req.flash("error", "Listing not found.");
    return res.redirect("/products");
  }

  const productData = req.body.product;

  // ── Stock sync for platform products ──────────────────────────────────────
  if (product.ownerType === "platform" && productData.stock !== undefined) {
    const newStock = parseInt(productData.stock);
    if (!isNaN(newStock) && newStock >= 0) {
      productData.stock = newStock;
      productData.availableStock = newStock;
      productData.isAvailable = newStock > 0;
    }
    delete productData.stock; // handled above
  }

  // ── Append new images ──────────────────────────────────────────────────────
  if (req.files?.length) {
    product.images.push(...req.files.map((f) => ({ url: f.path, filename: f.filename })));
  }

  // ── Delete marked images ───────────────────────────────────────────────────
  if (req.body.deleteImages?.length) {
    for (const filename of req.body.deleteImages) {
      if (filename !== "placeholder") await cloudinary.uploader.destroy(filename);
    }
    await product.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
  }

  // ── Re-geocode if city changed ─────────────────────────────────────────────
  if (productData.city && productData.city !== product.city) {
    const geoQuery = `${productData.location || ""} ${productData.city}, India`.trim();
    const geo = await geocode(geoQuery);
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
    for (const img of product.images || []) {
      if (img.filename !== "placeholder") {
        try { await cloudinary.uploader.destroy(img.filename); } catch (e) { /* ignore */ }
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
