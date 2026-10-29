const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { once } = require("node:events");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const TEST_DATABASE_NAME = "farmtech_test";
const TEST_MONGO_URI =
  process.env.FARMTECH_TEST_MONGO_URI ||
  `mongodb://127.0.0.1:27017/${TEST_DATABASE_NAME}`;
const TEST_HOST = "::1";
const configuredTestPort = process.env.FARMTECH_TEST_PORT;
const TEST_PORT =
  configuredTestPort === undefined || configuredTestPort === ""
    ? 0
    : Number(configuredTestPort);
const runId = `${Date.now()}-${crypto.randomBytes(5).toString("hex")}`;
const createdUserEmails = new Set();
const createdProductIds = new Set();
const createdProductTitles = new Set();
const createdOrderIds = new Set();
const testJwtSecret = crypto.randomBytes(32).toString("hex");

const getDatabaseName = (uri) => {
  try {
    return decodeURIComponent(new URL(uri).pathname.split("/").filter(Boolean)[0] || "");
  } catch {
    throw new Error("FARMTECH_TEST_MONGO_URI must be a valid MongoDB connection URI.");
  }
};

if (getDatabaseName(TEST_MONGO_URI) !== TEST_DATABASE_NAME) {
  throw new Error(
    `Backend tests only run against the dedicated "${TEST_DATABASE_NAME}" database.`
  );
}

if (!Number.isInteger(TEST_PORT) || TEST_PORT < 0 || TEST_PORT > 65535) {
  throw new Error("FARMTECH_TEST_PORT must be an integer between 0 and 65535.");
}

process.env.MONGO_URI = TEST_MONGO_URI;
process.env.JWT_SECRET = testJwtSecret;

const app = require("../server");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

let server;
let baseUrl;

const startTestServer = async () => {
  await mongoose.connect(TEST_MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  assert.equal(
    mongoose.connection.name,
    TEST_DATABASE_NAME,
    "Connected database must be the dedicated backend test database."
  );

  server = app.listen(TEST_PORT, TEST_HOST);
  try {
    await once(server, "listening");
  } catch (error) {
    server = undefined;
    throw new Error(
      `Could not start the backend test server on [${TEST_HOST}]:` +
        `${TEST_PORT || "an available port"}: ${error.message}`,
      { cause: error }
    );
  }

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("The backend test server did not report a TCP address.");
  }
  baseUrl = `http://[${TEST_HOST}]:${address.port}/api`;
};

const stopTestServer = async () => {
  if (server?.listening) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
      server.closeAllConnections();
    });
  }

  if (mongoose.connection.readyState === 1) {
    const users = await User.find({ email: { $in: [...createdUserEmails] } })
      .select("_id")
      .lean();
    const userIds = users.map((user) => user._id);
    const products = await Product.find({
      $or: [
        { _id: { $in: [...createdProductIds] } },
        { seller: { $in: userIds }, title: { $in: [...createdProductTitles] } }
      ]
    })
      .select("_id")
      .lean();
    const productIds = products.map((product) => product._id);

    await Order.deleteMany({
      $or: [
        { _id: { $in: [...createdOrderIds] } },
        { buyer: { $in: userIds } },
        { seller: { $in: userIds } },
        { product: { $in: productIds } }
      ]
    });
    await Product.deleteMany({ _id: { $in: productIds } });
    await User.deleteMany({ _id: { $in: userIds } });
    await mongoose.disconnect();
  }
};

const apiRequest = async (path, { method = "GET", token, body } = {}) => {
  const headers = {};
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const data = await response.json();
  return { status: response.status, data };
};

const registerUser = async ({ name, role = "FARMER" } = {}) => {
  const email = `backend-test-${runId}-${crypto.randomBytes(4).toString("hex")}@example.invalid`;
  createdUserEmails.add(email);
  const response = await apiRequest("/auth/register", {
    method: "POST",
    body: {
      name: name || `Test User ${runId}`,
      email,
      password: "FarmTech-Test-Password-2026",
      role
    }
  });

  assert.equal(response.status, 201, response.data.message);
  return { email, token: response.data.token, user: response.data.user };
};

const createListing = async (seller, overrides = {}) => {
  const title = `Test listing ${runId}-${crypto.randomBytes(4).toString("hex")}`;
  createdProductTitles.add(title);
  const response = await apiRequest("/products", {
    method: "POST",
    token: seller.token,
    body: {
      title,
      description: "A test product description with enough detail.",
      category: "Tools",
      type: "SALE",
      price: 25,
      quantity: 5,
      unit: "item",
      location: "Test farm",
      ...overrides
    }
  });

  assert.equal(response.status, 201, response.data.message);
  createdProductIds.add(response.data.product._id);
  return response.data.product;
};

const rememberOrder = (response) => {
  if (response.data.order?._id) {
    createdOrderIds.add(response.data.order._id);
  }
  return response;
};

const expiredToken = () =>
  jwt.sign({ id: new mongoose.Types.ObjectId().toString() }, testJwtSecret, {
    expiresIn: -1
  });

module.exports = {
  apiRequest,
  createListing,
  expiredToken,
  registerUser,
  rememberOrder,
  startTestServer,
  stopTestServer
};
