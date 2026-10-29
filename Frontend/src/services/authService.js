const API_BASE_URL = "http://localhost:5000/api";

const getHeaders = (token, includeJson = true) => {
  const headers = {};

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

async function registerUser(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed.");
  }

  return data;
}

async function loginUser(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed.");
  }

  return data;
}

async function getCurrentUser(token) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getHeaders(token, false)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load your profile.");
  }

  return data;
}

async function updateProfile(token, payload) {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Profile update failed.");
  }

  return data;
}

export { registerUser, loginUser, getCurrentUser, updateProfile };
