// routes/products.js

const express    = require("express");
const router     = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isOwner } = require("../middleware");
const productController       = require("../controllers/productController");

// ── Index + Create ────────────────────────────
router
  .route("/")
  .get(catchAsync(productController.index))
  .post(isLoggedIn, catchAsync(productController.createProduct));

// ── New listing form ──────────────────────────
router.get("/new", isLoggedIn, productController.renderNewForm);

// ── Show + Update + Delete ────────────────────
router
  .route("/:id")
  .get(catchAsync(productController.showProduct))
  .put(isLoggedIn, isOwner, catchAsync(productController.updateProduct))
  .delete(isLoggedIn, isOwner, catchAsync(productController.deleteProduct));

// ── Edit form ─────────────────────────────────
router.get("/:id/edit", isLoggedIn, isOwner, catchAsync(productController.renderEditForm));

module.exports = router;