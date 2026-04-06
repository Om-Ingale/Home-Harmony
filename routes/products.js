// routes/products.js

const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isOwner, isAdmin } = require("../middleware");
const { upload } = require("../utils/cloudinary");
const productController = require("../controllers/productController");

router
  .route("/")
  .get(catchAsync(productController.index))
  .post(
    isLoggedIn,
    upload.array("product[images]", 6),
    catchAsync(productController.createProduct)
  );

router.get("/new", isLoggedIn, productController.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(productController.showProduct))
  .put(
    isLoggedIn,
    isOwner,
    upload.array("product[images]", 6),
    catchAsync(productController.updateProduct)
  )
  .delete(isLoggedIn, isOwner, catchAsync(productController.deleteProduct));

router.get("/:id/edit", isLoggedIn, isOwner, catchAsync(productController.renderEditForm));

module.exports = router;
