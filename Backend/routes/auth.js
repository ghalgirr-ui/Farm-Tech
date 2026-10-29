const express = require("express");
const { registerUser, loginUser, getCurrentUser, updateProfile } = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authenticate, getCurrentUser);
router.put("/profile", authenticate, updateProfile);

module.exports = router;
