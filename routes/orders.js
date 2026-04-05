const express    = require("express");
const router     = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn } = require("../middleware");
const orderController = require("../controllers/orderController");

router.get("/checkout/:productId", isLoggedIn, catchAsync(orderController.renderCheckout));
router.get("/my-orders",           isLoggedIn, catchAsync(orderController.myOrders));
router.get("/:id/receipt",         isLoggedIn, catchAsync(orderController.downloadReceipt));
router.get("/:id",                 isLoggedIn, catchAsync(orderController.showOrder));

module.exports = router;