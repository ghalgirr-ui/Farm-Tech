const Order = require("../models/Order");
const Product = require("../models/Product");

const createOrderError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const createOrder = async ({ productId, quantity, buyerId }) => {
  const safeQuantity = Number(quantity);

  if (!Number.isInteger(safeQuantity) || safeQuantity <= 0) {
    throw createOrderError("Order quantity must be a positive whole number.", 400);
  }

  const product = await Product.findById(productId).select("seller status type quantity price");
  if (!product) {
    throw createOrderError("Product not found.", 404);
  }

  if (product.status !== "ACTIVE") {
    throw createOrderError("This product is no longer available.", 409);
  }

  if (product.type !== "SALE") {
    throw createOrderError("Orders are only available for sale listings.", 409);
  }

  if (product.seller.toString() === buyerId.toString()) {
    throw createOrderError("You cannot buy your own product.", 403);
  }

  if (safeQuantity > product.quantity) {
    throw createOrderError("Requested quantity exceeds available stock.", 409);
  }

  const reservedProduct = await Product.findOneAndUpdate(
    {
      _id: productId,
      status: "ACTIVE",
      quantity: { $gte: safeQuantity }
    },
    { $inc: { quantity: -safeQuantity } },
    { new: true }
  );

  if (!reservedProduct) {
    throw createOrderError("Requested quantity exceeds available stock.", 409);
  }

  if (reservedProduct.quantity === 0) {
    await Product.updateOne(
      { _id: productId, status: "ACTIVE", quantity: 0 },
      { $set: { status: "SOLD" } }
    );
  }

  const totalAmount = product.price * safeQuantity;

  let order;
  try {
    order = await Order.create({
      buyer: buyerId,
      seller: product.seller,
      product: product._id,
      quantity: safeQuantity,
      price: product.price,
      totalAmount,
      status: "PENDING"
    });
  } catch (error) {
    try {
      await Product.updateOne(
        { _id: productId },
        { $inc: { quantity: safeQuantity }, $set: { status: "ACTIVE" } }
      );
    } catch (rollbackError) {
      rollbackError.message = `${error.message}; inventory rollback failed: ${rollbackError.message}`;
      rollbackError.statusCode = 500;
      throw rollbackError;
    }
    throw error;
  }

  return order.populate(["buyer", "seller", "product"]);
};

const listOrders = async (userId) => {
  return Order.find({ $or: [{ buyer: userId }, { seller: userId }] })
    .populate("buyer", "name email")
    .populate("seller", "name email")
    .populate("product", "title category price location")
    .sort({ createdAt: -1 });
};

module.exports = {
  createOrder,
  listOrders
};
