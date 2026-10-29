const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10
    },
    category: {
      type: String,
      required: true,
      enum: [
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
      ]
    },
    type: {
      type: String,
      enum: ["SALE", "RENT", "BID"],
      default: "SALE"
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 1
    },
    unit: {
      type: String,
      required: true,
      trim: true,
      default: "kg"
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    images: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ["ACTIVE", "SOLD", "RENTED", "CLOSED"],
      default: "ACTIVE"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
