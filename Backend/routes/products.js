const express = require("express");
const { authenticate } = require("../middleware/auth");
const {
  getProducts,
  getProductById,
  getMyListings,
  createProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct
} = require("../controllers/productController");

const router = express.Router();

router.get("/mine", authenticate, getMyListings);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", authenticate, createProduct);
router.patch("/:id/status", authenticate, updateProductStatus);
router.put("/:id", authenticate, updateProduct);
router.delete("/:id", authenticate, deleteProduct);

module.exports = router;
