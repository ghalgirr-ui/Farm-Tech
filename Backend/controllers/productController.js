const mongoose = require("mongoose");
const productService = require("../services/productService");

const getMyListings = async (req, res, next) => {
  try {
    const result = await productService.listSellerProducts(req.user._id);

    return res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const { category, type, search, location, page, limit } = req.query;
    const result = await productService.listProducts(
      { category, type, search, location },
      page,
      limit
    );

    return res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID."
      });
    }

    const product = await productService.getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found."
      });
    }

    return res.json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { title, description, category, type, price, quantity, unit, location, images } = req.body;

    if (!title || !description || !category || !price || !quantity || !unit || !location) {
      return res.status(400).json({
        success: false,
        message: "Please provide a title, description, category, price, quantity, unit and location."
      });
    }

    const numericPrice = Number(price);
    const numericQuantity = Number(quantity);

    if (
      !Number.isFinite(numericPrice) ||
      !Number.isFinite(numericQuantity) ||
      numericPrice <= 0 ||
      !Number.isInteger(numericQuantity) ||
      numericQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than zero and quantity must be a positive whole number."
      });
    }

    const product = await productService.createProduct(
      {
        title: title.trim(),
        description: description.trim(),
        category,
        type: type || "SALE",
        price: numericPrice,
        quantity: numericQuantity,
        unit: unit.trim(),
        location: location.trim(),
        images: Array.isArray(images) ? images : []
      },
      req.user._id
    );

    return res.status(201).json({
      success: true,
      message: "Product published successfully.",
      product
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID."
      });
    }

    const product = await productService.updateProduct(req.params.id, req.user._id, req.body);

    return res.json({
      success: true,
      message: "Product updated successfully.",
      product
    });
  } catch (error) {
    next(error);
  }
};

const updateProductStatus = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID."
      });
    }

    const product = await productService.updateProductStatus(
      req.params.id,
      req.user._id,
      req.body?.status
    );

    return res.json({
      success: true,
      message: "Listing availability updated.",
      product
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID."
      });
    }

    await productService.deleteProduct(req.params.id, req.user._id);

    return res.json({
      success: true,
      message: "Product deleted successfully."
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyListings,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct
};
