const mongoose = require("mongoose");
const { MONGO_URI } = require("./env");

const connectDatabase = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined. Add it to your backend .env file.");
    }

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });

    console.log("MongoDB connected successfully.");
    return mongoose.connection;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    return null;
  }
};

module.exports = { connectDatabase };
