// controllers/productController.js

const Product = require("../models/Product");

// ── GET /products ─────────────────────────────
const index = async (req, res) => {
  const { category, type, city, search } = req.query;

  // Build a dynamic filter object from query params
  const filter = {};
  if (category) filter.category = category;
  if (type)     filter.type     = type;
  if (city)     filter.city     = new RegExp(city, "i");
  if (search)   filter.title    = new RegExp(search, "i");

  const products = await Product.find(filter)
    .populate("owner", "username avatar")
    .sort({ createdAt: -1 });

  res.render("products/index", {
    title:    "Browse Listings — Home Harmony",
    products,
    filters:  req.query,
  });
};

// ── GET /products/new ─────────────────────────
const renderNewForm = (req, res) => {
  res.render("products/new", { title: "New Listing — Home Harmony" });
};

// ── POST /products ────────────────────────────
const createProduct = async (req, res) => {
  const productData = req.body.product;

  // Placeholder images until Cloudinary/Multer is wired up in Phase 4
  productData.images = [
    {
      url:      "https://placehold.co/800x600?text=Home+Harmony",
      filename: "placeholder",
    },
  ];

  const product  = new Product(productData);
  product.owner  = req.user._id;
  await product.save();

  req.flash("success", "Listing created successfully! 🛋️");
  res.redirect(`/products/${product._id}`);
};

// ── GET /products/:id ─────────────────────────
const showProduct = async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate({
      path:     "reviews",
      populate: { path: "author", select: "username avatar" },
    })
    .populate("owner", "username avatar email");

  if (!product) {
    req.flash("error", "Listing not found.");
    return res.redirect("/products");
  }

  res.render("products/show", {
    title: `${product.title} — Home Harmony`,
    product,
  });
};

// ── GET /products/:id/edit ────────────────────
const renderEditForm = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    req.flash("error", "Listing not found.");
    return res.redirect("/products");
  }
  res.render("products/edit", {
    title: `Edit — ${product.title}`,
    product,
  });
};

// ── PUT /products/:id ─────────────────────────
const updateProduct = async (req, res) => {
  const { id } = req.params;
  await Product.findByIdAndUpdate(
    id,
    { ...req.body.product },
    { runValidators: true, new: true }
  );
  req.flash("success", "Listing updated successfully! ✅");
  res.redirect(`/products/${id}`);
};

// ── DELETE /products/:id ──────────────────────
// Mongoose post('findOneAndDelete') middleware handles cascade-deleting reviews
const deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  req.flash("success", "Listing deleted.");
  res.redirect("/products");
};

module.exports = {
  index,
  renderNewForm,
  createProduct,
  showProduct,
  renderEditForm,
  updateProduct,
  deleteProduct,
};