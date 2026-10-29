const express = require("express");
const { authenticate } = require("../middleware/auth");
const { createOrder, getOrders } = require("../controllers/orderController");

const router = express.Router();

router.get("/", authenticate, getOrders);
router.post("/", authenticate, createOrder);

module.exports = router;
