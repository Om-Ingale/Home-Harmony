// routes/profile.js

const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn } = require("../middleware");
const { renderProfileEdit, updateProfile } = require("../controllers/authController");

router.get("/edit", isLoggedIn, renderProfileEdit);
router.put("/", isLoggedIn, catchAsync(updateProfile));

module.exports = router;
