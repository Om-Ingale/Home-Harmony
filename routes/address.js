const express    = require("express");
const router     = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn } = require("../middleware");
const addressController = require("../controllers/addressController");

router.route("/")
  .get(isLoggedIn, catchAsync(addressController.index))
  .post(isLoggedIn, catchAsync(addressController.createAddress));

router.get("/:id/edit", isLoggedIn, catchAsync(addressController.renderEditForm));

router.route("/:id")
  .put(isLoggedIn, catchAsync(addressController.updateAddress))
  .delete(isLoggedIn, catchAsync(addressController.deleteAddress));

router.post("/:id/set-default", isLoggedIn, catchAsync(addressController.setDefault));

module.exports = router;