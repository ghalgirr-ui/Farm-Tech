const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const env = {
  PORT: Number(process.env.PORT) || 5000,
  MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/farmtech",
  JWT_SECRET: process.env.JWT_SECRET || "development-secret-change-me"
};

module.exports = env;
