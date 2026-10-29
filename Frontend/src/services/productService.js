const API_BASE_URL = "http://localhost:5000/api";

async function fetchProducts(filters = {}) {
  const query = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== "All") {
      query.append(key, value);
    }
  });

  const response = await fetch(`${API_BASE_URL}/products?${query.toString()}`);

  if (!response.ok) {
    throw new Error("Unable to load marketplace products.");
  }

  const data = await response.json();
  return {
    products: data.products || [],
    pagination: data.pagination || {}
  };
}

async function fetchProduct(productId) {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`);

  if (!response.ok) {
    throw new Error("Unable to load product details.");
  }

  const data = await response.json();
  return data.product;
}

async function createProduct(payload, token) {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to publish your product.");
  }

  return data;
}

async function fetchMyListings(token) {
  const response = await fetch(`${API_BASE_URL}/products/mine`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load your listings.");
  }

  return data;
}

async function updateProduct(productId, payload, token) {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to update your listing.");
  }

  return data;
}

async function updateProductStatus(productId, status, token) {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to update listing availability.");
  }

  return data;
}

async function deleteProduct(productId, token) {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to delete your listing.");
  }

  return data;
}

async function createOrder(productId, quantity, token) {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ productId, quantity })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to place the order.");
  }

  return data;
}

async function fetchOrders(token) {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load your orders.");
  }

  return data.orders || [];
}

export {
  fetchProducts,
  fetchProduct,
  fetchMyListings,
  createProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
  createOrder,
  fetchOrders
};
