// ============================================
// register.js - Authentication handler for sign-up
// ============================================

document.addEventListener("DOMContentLoaded", function () {
    // If the user is already logged in, redirect them to the dashboard
    if (isLoggedIn()) {
        window.location.href = "dashboard.html";
        return;
    }

    var registerForm = document.getElementById("register-form");
    var emailInput = document.getElementById("email");
    var passwordInput = document.getElementById("password");
    var confirmPasswordInput = document.getElementById("confirm-password");
    var roleSelect = document.getElementById("role");
    var errorAlert = document.getElementById("error-alert");
    var successAlert = document.getElementById("success-alert");
    var btnSubmit = document.getElementById("btn-submit");

    // Handle form submission
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Clear alerts
        errorAlert.style.display = "none";
        errorAlert.textContent = "";
        successAlert.style.display = "none";
        successAlert.textContent = "";

        var email = emailInput.value.trim();
        var password = passwordInput.value;
        var confirmPassword = confirmPasswordInput.value;
        var role = roleSelect.value;

        // Simple validation
        if (password !== confirmPassword) {
            errorAlert.textContent = "Passwords do not match!";
            errorAlert.style.display = "block";
            return;
        }

        if (password.length < 4) {
            errorAlert.textContent = "Password must be at least 4 characters long.";
            errorAlert.style.display = "block";
            return;
        }

        // Disable button while registering
        btnSubmit.disabled = true;
        btnSubmit.textContent = "Creating Account...";

        try {
            // Call the register API from api.js
            var response = await registerUser(email, password, role);

            successAlert.textContent = "Registration successful! Redirecting...";
            successAlert.style.display = "block";

            // Save the session data using auth.js
            saveUserSession(response);

            // Redirect to dashboard after a short delay
            setTimeout(function () {
                window.location.href = "dashboard.html";
            }, 1000);

        } catch (error) {
            errorAlert.textContent = error.message || "Registration failed. Try a different email.";
            errorAlert.style.display = "block";
            
            // Re-enable submission
            btnSubmit.disabled = false;
            btnSubmit.textContent = "Sign Up";
        }
    });
});
