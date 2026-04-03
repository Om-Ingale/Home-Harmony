// routes/admin.js

const express    = require("express");
const router     = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAdmin } = require("../middleware");
const adminController         = require("../controllers/adminController");

router.use(isLoggedIn, isAdmin);   // all admin routes require login + admin role

router.get("/",          catchAsync(adminController.dashboard));
router.get("/users",     catchAsync(adminController.listUsers));
router.get("/products",  catchAsync(adminController.listProducts));
router.get("/reviews",   catchAsync(adminController.listReviews));

router.delete("/users/:id",    catchAsync(adminController.deleteUser));
router.delete("/products/:id", catchAsync(adminController.deleteProduct));
router.delete("/reviews/:id",  catchAsync(adminController.deleteReview));

router.post("/users/:id/toggle-role", catchAsync(adminController.toggleRole));

module.exports = router;