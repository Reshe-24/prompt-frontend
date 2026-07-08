// ============================================
// api.js - All API calls for the application
// ============================================

// Base URL of the Spring Boot backend
const BASE_URL = "https://prompt-backend-tsle.onrender.com";

/**
 * Makes an API request to the backend
 * @param {string} url - The API endpoint (e.g., "/api/auth/login")
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object|null} body - Request body for POST/PUT requests
 * @param {boolean} useAuth - Whether to include the JWT token
 * @returns {Promise} - The parsed response data
 */
async function apiRequest(url, method = "GET", body = null, useAuth = true) {
  // Set up request headers
  var headers = {
    "Content-Type": "application/json",
  };

  // Add JWT token if authentication is needed
  if (useAuth) {
    var token = getToken();
    if (token) {
      headers["Authorization"] = "Bearer " + token;
    }
  }

  // Build the fetch options
  var options = {
    method: method,
    headers: headers,
  };

  // Add body for POST and PUT requests
  if (body !== null) {
    options.body = JSON.stringify(body);
  }

  // Make the fetch request
  var response = await fetch(BASE_URL + url, options);

  // Read the response as text first
  var text = await response.text();

  // If the response is not OK, throw an error
  if (!response.ok) {
    var errorMessage = "Something went wrong";
    try {
      var errorData = JSON.parse(text);
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }

  // Parse and return JSON if there is content
  if (text) {
    try {
      return JSON.parse(text);
    } catch (e) {
      return text; // Return as plain text if not JSON
    }
  }
  return null;
}

// ========================
// Auth API Functions
// ========================

// Login user with email and password
function loginUser(email, password) {
  return apiRequest(
    "/api/auth/login",
    "POST",
    {
      email: email,
      passwordHash: password,
    },
    false,
  );
}

// Register a new user
function registerUser(username, email, password, role) {
  var body = {
    username: username,
    email: email,
    passwordHash: password,
    role: role,
  };

  return apiRequest("/api/auth/register", "POST", body, false);
}

// ========================
// User API Functions
// ========================

// Get all users
function getUsers() {
  return apiRequest("/api/users", "GET");
}

// Get a single user by ID
function getUserById(id) {
  return apiRequest("/api/users/" + id, "GET");
}

// Create a new user
function createUser(userData) {
  return apiRequest("/api/users", "POST", userData);
}

// Update an existing user
function updateUser(id, userData) {
  return apiRequest("/api/users/" + id, "PUT", userData);
}

// Delete a user
function deleteUser(id) {
  return apiRequest("/api/users/" + id, "DELETE");
}

// ========================
// Category API Functions
// ========================

// Get all categories
function getCategories() {
  return apiRequest("/api/categories", "GET");
}

// Get a single category by ID
function getCategoryById(id) {
  return apiRequest("/api/categories/" + id, "GET");
}

// Create a new category (TEAM_LEAD only)
function createCategory(categoryData) {
  return apiRequest("/api/categories/create", "POST", categoryData);
}

// Update a category (TEAM_LEAD only)
function updateCategory(id, categoryData) {
  return apiRequest("/api/categories/" + id, "PUT", categoryData);
}

// Delete a category (TEAM_LEAD only)
function deleteCategory(id) {
  return apiRequest("/api/categories/" + id, "DELETE");
}

// ========================
// Template API Functions
// ========================

// Get all templates
function getTemplates() {
  return apiRequest("/api/templates", "GET");
}

// Get a single template by ID
function getTemplateById(id) {
  return apiRequest("/api/templates/" + id, "GET");
}

// Create a new template
function createTemplate(templateData) {
  return apiRequest("/api/templates", "POST", templateData);
}

// Update a template
function updateTemplate(id, templateData) {
  return apiRequest("/api/templates/" + id, "PUT", templateData);
}

// Delete a template (TEAM_LEAD only)
function deleteTemplate(id) {
  return apiRequest("/api/templates/" + id, "DELETE");
}

// ========================
// Collection API Functions
// ========================

// Get all collections
function getCollections() {
  return apiRequest("/api/collections", "GET");
}

// Get a single collection by ID
function getCollectionById(id) {
  return apiRequest("/api/collections/" + id, "GET");
}

// Create a new collection
function createCollection(collectionData) {
  return apiRequest("/api/collections", "POST", collectionData);
}

// Delete a collection
function deleteCollection(id) {
  return apiRequest("/api/collections/" + id, "DELETE");
}

// ========================
// Version API Functions
// ========================

// Get all versions
function getVersions() {
  return apiRequest("/api/versions", "GET");
}

// Get a single version by ID
function getVersionById(id) {
  return apiRequest("/api/versions/" + id, "GET");
}

// Create a new version (TEAM_LEAD only)
function createVersion(versionData) {
  return apiRequest("/api/versions", "POST", versionData);
}

// Update a version (TEAM_LEAD only)
function updateVersion(id, versionData) {
  return apiRequest("/api/versions/" + id, "PUT", versionData);
}

// Delete a version (TEAM_LEAD only)
function deleteVersion(id) {
  return apiRequest("/api/versions/" + id, "DELETE");
}
