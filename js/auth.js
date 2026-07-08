// ============================================
// auth.js - JWT token and session management
// ============================================

/**
 * Save user session data to localStorage after login or register
 * @param {object} data - The response from login/register API
 */
function saveUserSession(data) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("userId", data.id);
  localStorage.setItem("username", data.username);
  localStorage.setItem("role", data.role);
}

/**
 * Get the JWT token from localStorage
 * @returns {string|null} - The stored token or null
 */
function getToken() {
  return localStorage.getItem("token");
}

/**
 * Get the current logged-in user info
 * @returns {object} - User object with id, username, and role
 */
function getUser() {
  return {
    id: localStorage.getItem("userId"),
    username: localStorage.getItem("username"),
    role: localStorage.getItem("role"),
  };
}

/**
 * Check if a user is currently logged in
 * @returns {boolean}
 */
function isLoggedIn() {
  return getToken() !== null;
}

/**
 * Log out the user - clears all stored data and redirects to login
 */
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  window.location.href = "index.html";
}

/**
 * Redirect to login page if user is not authenticated
 * Call this at the top of every protected page
 */
function requireLogin() {
  if (!isLoggedIn()) {
    window.location.href = "index.html";
  }
}

/**
 * Check if the logged-in user has a specific role
 * @param {string} role - Role to check (e.g., "TEAM_LEAD")
 * @returns {boolean}
 */
function hasRole(role) {
  var user = getUser();
  return user.role === role;
}
