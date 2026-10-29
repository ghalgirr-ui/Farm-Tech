const Product = require("../models/Product");
const Order = require("../models/Order");

const PRODUCT_LIMIT = 12;
const PRODUCT_CATEGORIES = [
  "Seeds",
  "Fertilizers",
  "Pesticides",
  "Tools",
  "Machinery",
  "Equipment",
  "Crops",
  "Vegetables",
  "Fruits",
  "Grains",
  "Other"
];
const LISTING_TYPES = ["SALE", "RENT", "BID"];
const EDITABLE_PRODUCT_FIELDS = new Set([
  "title",
  "description",
  "category",
  "type",
  "price",
  "quantity",
  "unit",
  "location",
  "images"
]);

const createProductError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const buildProductQuery = (filters = {}) => {
  const { category, type, search, location } = filters;
  const query = { status: "ACTIVE" };

  if (category && category !== "All") {
    query.category = category;
  }

  if (type && type !== "All") {
    query.type = type;
  }

  if (location && location.trim()) {
    query.location = { $regex: location.trim(), $options: "i" };
  }

  if (search && search.trim()) {
    const keyword = search.trim();
    query.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
      { category: { $regex: keyword, $options: "i" } }
    ];
  }

  return query;
};

const listProducts = async (filters = {}, page = 1, limit = PRODUCT_LIMIT) => {
  const query = buildProductQuery(filters);
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Number(limit) || PRODUCT_LIMIT);

  const totalProducts = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate("seller", "name location role")
    .sort({ createdAt: -1 })
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit)
    .lean();

  return {
    products,
    pagination: {
      page: safePage,
      limit: safeLimit,
      totalProducts,
      totalPages: Math.max(1, Math.ceil(totalProducts / safeLimit))
    }
  };
};

const listSellerProducts = async (sellerId) => {
  const listings = await Product.find({ seller: sellerId })
    .sort({ createdAt: -1 })
    .lean();
  const summary = listings.reduce(
    (counts, listing) => {
      counts.total += 1;
      if (listing.status === "ACTIVE" && listing.quantity > 0) {
        counts.available += 1;
      } else {
        counts.unavailable += 1;
      }
      if (listing.status === "SOLD") {
        counts.sold += 1;
      }
      return counts;
    },
    { total: 0, available: 0, unavailable: 0, sold: 0 }
  );

  return { listings, summary };
};

const getProductById = async (productId) => {
  return Product.findById(productId).populate("seller", "name location role").lean();
};

const createProduct = async (productData, sellerId) => {
  return Product.create({
    ...productData,
    seller: sellerId,
    status: productData.status || "ACTIVE",
    type: productData.type || "SALE"
  });
};

const updateProduct = async (productId, sellerId, updates) => {
  if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
    throw createProductError("Provide listing fields to update.", 400);
  }

  const fields = Object.keys(updates);
  if (fields.length === 0 || fields.some((field) => !EDITABLE_PRODUCT_FIELDS.has(field))) {
    throw createProductError("One or more listing fields cannot be updated.", 400);
  }

  const validatedUpdates = { ...updates };

  for (const field of ["title", "description", "unit", "location"]) {
    if (validatedUpdates[field] !== undefined) {
      if (typeof validatedUpdates[field] !== "string" || !validatedUpdates[field].trim()) {
        throw createProductError(`${field} must be a non-empty string.`, 400);
      }
      validatedUpdates[field] = validatedUpdates[field].trim();
    }
  }

  if (validatedUpdates.title !== undefined && validatedUpdates.title.length < 2) {
    throw createProductError("Title must be at least 2 characters long.", 400);
  }
  if (validatedUpdates.description !== undefined && validatedUpdates.description.length < 10) {
    throw createProductError("Description must be at least 10 characters long.", 400);
  }
  if (
    validatedUpdates.category !== undefined &&
    !PRODUCT_CATEGORIES.includes(validatedUpdates.category)
  ) {
    throw createProductError("Please choose a valid product category.", 400);
  }
  if (validatedUpdates.type !== undefined && !LISTING_TYPES.includes(validatedUpdates.type)) {
    throw createProductError("Please choose a valid listing type.", 400);
  }
  if (validatedUpdates.price !== undefined) {
    if (
      (typeof validatedUpdates.price !== "number" && typeof validatedUpdates.price !== "string") ||
      validatedUpdates.price === ""
    ) {
      throw createProductError("Price must be a positive number.", 400);
    }

    const price = Number(validatedUpdates.price);
    if (!Number.isFinite(price) || price <= 0) {
      throw createProductError("Price must be a positive number.", 400);
    }
    validatedUpdates.price = price;
  }
  if (validatedUpdates.quantity !== undefined) {
    if (
      (typeof validatedUpdates.quantity !== "number" &&
        typeof validatedUpdates.quantity !== "string") ||
      validatedUpdates.quantity === ""
    ) {
      throw createProductError("Quantity must be a non-negative whole number.", 400);
    }

    const quantity = Number(validatedUpdates.quantity);
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw createProductError("Quantity must be a non-negative whole number.", 400);
    }
    validatedUpdates.quantity = quantity;
  }
  if (
    validatedUpdates.images !== undefined &&
    (!Array.isArray(validatedUpdates.images) ||
      validatedUpdates.images.some((image) => typeof image !== "string"))
  ) {
    throw createProductError("Images must be provided as a list of image URLs.", 400);
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw createProductError("Product not found.", 404);
  }

  if (product.seller.toString() !== sellerId.toString()) {
    throw createProductError("You are not allowed to update this product.", 403);
  }

  const changes = { ...validatedUpdates };
  if (changes.quantity === 0 && product.status === "ACTIVE") {
    changes.status = "SOLD";
  }
  const updatedProduct = await Product.findOneAndUpdate(
    { _id: productId, seller: sellerId },
    { $set: changes },
    { new: true, runValidators: true }
  );

  if (!updatedProduct) {
    throw createProductError("Product not found.", 404);
  }

  return updatedProduct.populate("seller", "name location role");
};

const updateProductStatus = async (productId, sellerId, status) => {
  if (!["ACTIVE", "CLOSED", "SOLD"].includes(status)) {
    throw createProductError("Choose Active, Unavailable or Sold for this listing.", 400);
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw createProductError("Product not found.", 404);
  }

  if (product.seller.toString() !== sellerId.toString()) {
    throw createProductError("You are not allowed to update this product.", 403);
  }

  if (status === "ACTIVE" && product.quantity <= 0) {
    throw createProductError("A listing with no stock cannot be made available.", 400);
  }

  const filter = { _id: productId, seller: sellerId };
  if (status === "ACTIVE") {
    filter.quantity = { $gt: 0 };
  }

  const updatedProduct = await Product.findOneAndUpdate(
    filter,
    { $set: { status } },
    { new: true, runValidators: true }
  );

  if (!updatedProduct) {
    throw createProductError("Listing changed before availability could be updated.", 409);
  }

  return updatedProduct.populate("seller", "name location role");
};

const deleteProduct = async (productId, sellerId) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw createProductError("Product not found.", 404);
  }

  if (product.seller.toString() !== sellerId.toString()) {
    throw createProductError("You are not allowed to delete this product.", 403);
  }

  if (await Order.exists({ product: productId })) {
    throw createProductError(
      "This listing has order history and cannot be deleted. Mark it unavailable instead.",
      409
    );
  }

  await product.deleteOne();
  return true;
};

module.exports = {
  listProducts,
  listSellerProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct
};
