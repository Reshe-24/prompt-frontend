// ============================================
// login.js - Authentication handler for login page
// ============================================

document.addEventListener("DOMContentLoaded", function () {
    // If the user is already logged in, redirect them to the dashboard
    if (isLoggedIn()) {
        window.location.href = "dashboard.html";
        return;
    }

    var loginForm = document.getElementById("login-form");
    var emailInput = document.getElementById("email");
    var passwordInput = document.getElementById("password");
    var errorAlert = document.getElementById("error-alert");
    var btnSubmit = document.getElementById("btn-submit");

    // Handle form submission
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Clear previous error message and disable submit button
        errorAlert.style.display = "none";
        errorAlert.textContent = "";
        btnSubmit.disabled = true;
        btnSubmit.textContent = "Signing In...";

        var email = emailInput.value.trim();
        var password = passwordInput.value;

        try {
            // Call the login API endpoint from api.js
            var response = await loginUser(email, password);

            // Save the session data using auth.js
            saveUserSession(response);

            // Redirect to dashboard page on success
            window.location.href = "dashboard.html";

        } catch (error) {
            // Display error alert
            errorAlert.textContent = error.message || "Invalid email or password.";
            errorAlert.style.display = "block";
            
            // Re-enable the submit button
            btnSubmit.disabled = false;
            btnSubmit.textContent = "Sign In";
        }
    });
});
