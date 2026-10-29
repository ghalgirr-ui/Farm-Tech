const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ["FARMER", "CUSTOMER", "ADMIN"],
      default: "FARMER"
    },
    preferredLanguage: {
      type: String,
      enum: ["English", "Hindi", "Marathi"],
      default: "English"
    },
    location: {
      type: String,
      trim: true,
      default: ""
    },
    landSize: {
      type: String,
      trim: true,
      default: ""
    },
    soilType: {
      type: String,
      trim: true,
      default: ""
    },
    waterAvailability: {
      type: String,
      trim: true,
      default: ""
    },
    currentCrop: {
      type: String,
      trim: true,
      default: ""
    }
  },
  { timestamps: true }
);

userSchema.methods.toSafeObject = function toSafeObject() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model("User", userSchema);
