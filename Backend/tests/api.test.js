const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const {
  apiRequest,
  createListing,
  expiredToken,
  registerUser,
  rememberOrder,
  startTestServer,
  stopTestServer
} = require("./helpers");

before(async () => {
  await startTestServer();
});

after(async () => {
  await stopTestServer();
});

test("registration, login, duplicate emails, and safe user responses", async () => {
  const user = await registerUser({ name: "Authentication Test" });
  assert.equal(typeof user.token, "string");
  assert.equal(user.user.name, "Authentication Test");
  assert.equal(Object.hasOwn(user.user, "password"), false);

  const duplicate = await apiRequest("/auth/register", {
    method: "POST",
    body: {
      name: "Duplicate Test",
      email: user.email.toUpperCase(),
      password: "FarmTech-Test-Password-2026"
    }
  });
  assert.equal(duplicate.status, 409);

  const login = await apiRequest("/auth/login", {
    method: "POST",
    body: { email: user.email, password: "FarmTech-Test-Password-2026" }
  });
  assert.equal(login.status, 200);
  assert.equal(Object.hasOwn(login.data.user, "password"), false);

  const invalidCredentials = await apiRequest("/auth/login", {
    method: "POST",
    body: { email: user.email, password: "incorrect-password" }
  });
  assert.equal(invalidCredentials.status, 401);

  const missingFields = await apiRequest("/auth/register", {
    method: "POST",
    body: { email: `incomplete-${Date.now()}@example.invalid` }
  });
  assert.equal(missingFields.status, 400);
});

test("protected routes reject missing, malformed, and expired JWTs", async () => {
  const protectedRequests = [
    ["GET", "/products/mine"],
    ["GET", "/orders"],
    ["POST", "/products"],
    ["POST", "/orders"]
  ];

  for (const [method, path] of protectedRequests) {
    const response = await apiRequest(path, { method });
    assert.equal(response.status, 401, `${method} ${path} should require authentication.`);
  }

  for (const token of ["not-a-jwt", expiredToken()]) {
    const invalidToken = await apiRequest("/products/mine", { token });
    assert.equal(invalidToken.status, 401);
  }
});

test("seller listings validate input, enforce ownership, and protect seller identity", async () => {
  const seller = await registerUser({ name: "Listing Owner" });
  const otherSeller = await registerUser({ name: "Other Listing Owner" });
  const product = await createListing(seller);

  const invalidPrice = await apiRequest("/products", {
    method: "POST",
    token: seller.token,
    body: {
      title: "Invalid Price",
      description: "This product has an invalid price.",
      category: "Tools",
      price: 0,
      quantity: 2,
      unit: "item",
      location: "Test farm"
    }
  });
  assert.equal(invalidPrice.status, 400);

  const fractionalQuantity = await apiRequest("/products", {
    method: "POST",
    token: seller.token,
    body: {
      title: "Fractional Quantity",
      description: "This product has fractional stock.",
      category: "Tools",
      price: 5,
      quantity: 1.5,
      unit: "item",
      location: "Test farm"
    }
  });
  assert.equal(fractionalQuantity.status, 400);

  const invalidUpdate = await apiRequest(`/products/${product._id}`, {
    method: "PUT",
    token: seller.token,
    body: { quantity: -1 }
  });
  assert.equal(invalidUpdate.status, 400);

  const invalidUpdatedPrice = await apiRequest(`/products/${product._id}`, {
    method: "PUT",
    token: seller.token,
    body: { price: 0 }
  });
  assert.equal(invalidUpdatedPrice.status, 400);

  const fractionalUpdatedQuantity = await apiRequest(`/products/${product._id}`, {
    method: "PUT",
    token: seller.token,
    body: { quantity: 1.5 }
  });
  assert.equal(fractionalUpdatedQuantity.status, 400);

  const protectedField = await apiRequest(`/products/${product._id}`, {
    method: "PUT",
    token: seller.token,
    body: { seller: otherSeller.user._id }
  });
  assert.equal(protectedField.status, 400);

  const ownerUpdate = await apiRequest(`/products/${product._id}`, {
    method: "PUT",
    token: seller.token,
    body: { title: "Updated test listing", price: 30 }
  });
  assert.equal(ownerUpdate.status, 200);
  assert.equal(ownerUpdate.data.product.title, "Updated test listing");
  assert.equal(ownerUpdate.data.product.price, 30);

  for (const [method, path, body] of [
    ["PUT", `/products/${product._id}`, { title: "Unauthorized edit" }],
    ["PATCH", `/products/${product._id}/status`, { status: "CLOSED" }],
    ["DELETE", `/products/${product._id}`]
  ]) {
    const response = await apiRequest(path, {
      method,
      token: otherSeller.token,
      body
    });
    assert.equal(response.status, 403, `${method} must enforce seller ownership.`);
  }

  const listingStillExists = await apiRequest(`/products/${product._id}`);
  assert.equal(listingStillExists.status, 200);
  assert.equal(listingStillExists.data.product.title, "Updated test listing");

  const ownerDelete = await apiRequest(`/products/${product._id}`, {
    method: "DELETE",
    token: seller.token
  });
  assert.equal(ownerDelete.status, 200);
  const deletedListing = await apiRequest(`/products/${product._id}`);
  assert.equal(deletedListing.status, 404);
});

test("seller feed is scoped to the token and summarizes available, unavailable, and sold listings", async () => {
  const seller = await registerUser({ name: "Summary Seller" });
  const otherSeller = await registerUser({ name: "Different Summary Seller" });
  const active = await createListing(seller);
  const unavailable = await createListing(seller);
  const sold = await createListing(seller, { quantity: 1 });
  await createListing(otherSeller);

  const closed = await apiRequest(`/products/${unavailable._id}/status`, {
    method: "PATCH",
    token: seller.token,
    body: { status: "CLOSED" }
  });
  assert.equal(closed.status, 200);

  const markSold = await apiRequest(`/products/${sold._id}`, {
    method: "PUT",
    token: seller.token,
    body: { quantity: 0 }
  });
  assert.equal(markSold.status, 200);

  const response = await apiRequest(`/products/mine?seller=${otherSeller.user._id}`, {
    token: seller.token
  });
  assert.equal(response.status, 200);
  assert.equal(response.data.listings.length, 3);
  assert.deepEqual(response.data.summary, {
    total: 3,
    available: 1,
    unavailable: 2,
    sold: 1
  });
  assert.ok(response.data.listings.every((listing) => listing.seller === seller.user._id));
  assert.ok(response.data.listings.some((listing) => listing._id === active._id));
});

test("malformed product IDs are rejected by detail and mutation endpoints", async () => {
  const seller = await registerUser({ name: "Malformed ID Seller" });
  for (const [method, path, body] of [
    ["GET", "/products/not-an-object-id"],
    ["PUT", "/products/not-an-object-id", { title: "Update" }],
    ["PATCH", "/products/not-an-object-id/status", { status: "CLOSED" }],
    ["DELETE", "/products/not-an-object-id"]
  ]) {
    const response = await apiRequest(path, { method, token: seller.token, body });
    assert.equal(response.status, 400, `${method} ${path} should reject malformed IDs.`);
  }
});

test("orders reserve stock, preserve order history, and are visible only to participants", async () => {
  const seller = await registerUser({ name: "Order Seller" });
  const buyer = await registerUser({ name: "Order Buyer", role: "CUSTOMER" });
  const unrelated = await registerUser({ name: "Unrelated User" });
  const product = await createListing(seller, { price: 12, quantity: 4 });

  const purchase = rememberOrder(await apiRequest("/orders", {
    method: "POST",
    token: buyer.token,
    body: { productId: product._id, quantity: 2 }
  }));
  assert.equal(purchase.status, 201);
  assert.equal(purchase.data.order.quantity, 2);
  assert.equal(purchase.data.order.totalAmount, 24);

  const updatedProduct = await apiRequest(`/products/${product._id}`);
  assert.equal(updatedProduct.data.product.quantity, 2);
  assert.equal(updatedProduct.data.product.status, "ACTIVE");

  const buyerOrders = await apiRequest("/orders", { token: buyer.token });
  const sellerOrders = await apiRequest("/orders", { token: seller.token });
  const unrelatedOrders = await apiRequest("/orders", { token: unrelated.token });
  assert.equal(buyerOrders.data.orders.length, 1);
  assert.equal(sellerOrders.data.orders.length, 1);
  assert.equal(unrelatedOrders.data.orders.length, 0);

  const deletion = await apiRequest(`/products/${product._id}`, {
    method: "DELETE",
    token: seller.token
  });
  assert.equal(deletion.status, 409);

  const retainedProduct = await apiRequest(`/products/${product._id}`);
  assert.equal(retainedProduct.status, 200);
  assert.equal(retainedProduct.data.product._id, product._id);
});

test("invalid orders, self-purchases, and unavailable listings do not change inventory", async () => {
  const seller = await registerUser({ name: "Integrity Seller" });
  const buyer = await registerUser({ name: "Integrity Buyer", role: "CUSTOMER" });
  const product = await createListing(seller, { quantity: 2 });
  const soldProduct = await createListing(seller, { quantity: 1 });

  for (const quantity of [0, -1, 1.5, "invalid"]) {
    const response = await apiRequest("/orders", {
      method: "POST",
      token: buyer.token,
      body: { productId: product._id, quantity }
    });
    assert.equal(response.status, 400, `Quantity ${quantity} should be rejected.`);
  }

  const insufficient = rememberOrder(await apiRequest("/orders", {
    method: "POST",
    token: buyer.token,
    body: { productId: product._id, quantity: 3 }
  }));
  assert.equal(insufficient.status, 409);

  const selfPurchase = await apiRequest("/orders", {
    method: "POST",
    token: seller.token,
    body: { productId: product._id, quantity: 1 }
  });
  assert.equal(selfPurchase.status, 403);

  const closeListing = await apiRequest(`/products/${product._id}/status`, {
    method: "PATCH",
    token: seller.token,
    body: { status: "CLOSED" }
  });
  assert.equal(closeListing.status, 200);
  const unavailablePurchase = await apiRequest("/orders", {
    method: "POST",
    token: buyer.token,
    body: { productId: product._id, quantity: 1 }
  });
  assert.equal(unavailablePurchase.status, 409);

  const markSold = await apiRequest(`/products/${soldProduct._id}`, {
    method: "PUT",
    token: seller.token,
    body: { quantity: 0 }
  });
  assert.equal(markSold.status, 200);
  const soldPurchase = await apiRequest("/orders", {
    method: "POST",
    token: buyer.token,
    body: { productId: soldProduct._id, quantity: 1 }
  });
  assert.equal(soldPurchase.status, 409);

  const unchanged = await apiRequest(`/products/${product._id}`);
  const unchangedSold = await apiRequest(`/products/${soldProduct._id}`);
  const orders = await apiRequest("/orders", { token: buyer.token });
  assert.equal(unchanged.data.product.quantity, 2);
  assert.equal(unchanged.data.product.status, "CLOSED");
  assert.equal(unchangedSold.data.product.quantity, 0);
  assert.equal(unchangedSold.data.product.status, "SOLD");
  assert.equal(orders.data.orders.length, 0);
});

test("concurrent buyers cannot oversell the last available unit", async () => {
  const seller = await registerUser({ name: "Race Condition Seller" });
  const buyerOne = await registerUser({ name: "Race Buyer One", role: "CUSTOMER" });
  const buyerTwo = await registerUser({ name: "Race Buyer Two", role: "CUSTOMER" });
  const product = await createListing(seller, { quantity: 1 });

  const responses = await Promise.all([
    apiRequest("/orders", {
      method: "POST",
      token: buyerOne.token,
      body: { productId: product._id, quantity: 1 }
    }),
    apiRequest("/orders", {
      method: "POST",
      token: buyerTwo.token,
      body: { productId: product._id, quantity: 1 }
    })
  ]);
  responses.forEach(rememberOrder);

  assert.deepEqual(
    responses.map((response) => response.status).sort(),
    [201, 409]
  );

  const finalProduct = await apiRequest(`/products/${product._id}`);
  assert.equal(finalProduct.data.product.quantity, 0);
  assert.equal(finalProduct.data.product.status, "SOLD");

  const sellerOrders = await apiRequest("/orders", { token: seller.token });
  assert.equal(sellerOrders.data.orders.length, 1);
  assert.equal(sellerOrders.data.orders[0].quantity, 1);
});
