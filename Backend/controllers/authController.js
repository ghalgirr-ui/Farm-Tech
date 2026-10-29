const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateToken } = require("../utils/token");

const formatUser = (user) => {
  if (!user) return null;

  const userObject = user.toObject ? user.toObject() : { ...user };
  delete userObject.password;
  return userObject;
};

const registerUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, preferredLanguage, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long."
      });
    }

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!validEmail) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address."
      });
    }

    const assignedRole = role || "FARMER";
    if (!["FARMER", "CUSTOMER"].includes(assignedRole)) {
      return res.status(400).json({
        success: false,
        message: "Please choose a valid account type."
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : "",
      password: hashedPassword,
      role: assignedRole,
      preferredLanguage: preferredLanguage || "English"
    });

    const safeUser = formatUser(newUser);
    const token = generateToken({ id: newUser._id, role: newUser.role });

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const token = generateToken({ id: user._id, role: user.role });

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      user: formatUser(user)
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res) => {
  return res.json({
    success: true,
    user: formatUser(req.user)
  });
};

const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      "name",
      "phone",
      "location",
      "preferredLanguage",
      "landSize",
      "soilType",
      "waterAvailability",
      "currentCrop"
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (!updates.name || updates.name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name is required and must be at least 2 characters long."
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.json({
      success: true,
      message: "Profile updated successfully.",
      user: formatUser(updatedUser)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile
};
