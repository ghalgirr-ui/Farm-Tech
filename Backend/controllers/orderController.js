const mongoose = require("mongoose");
const orderService = require("../services/orderService");

const createOrder = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required."
      });
    }

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID."
      });
    }

    const order = await orderService.createOrder({
      productId,
      quantity: quantity === undefined ? 1 : quantity,
      buyerId: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully.",
      order
    });
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await orderService.listOrders(req.user._id);

    return res.json({
      success: true,
      orders
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders
};
