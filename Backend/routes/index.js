const express = require("express");
const healthRoutes = require("./health");
const authRoutes = require("./auth");
const productsRoutes = require("./products");
const ordersRoutes = require("./orders");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/products", productsRoutes);
router.use("/orders", ordersRoutes);

module.exports = router;
