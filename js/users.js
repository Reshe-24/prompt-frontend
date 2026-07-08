// ============================================
// users.js - User Management page logic
// ============================================

// Global cache for users
var usersList = [];

document.addEventListener("DOMContentLoaded", function () {
    // 1. Force authentication check
    requireLogin();

    // 2. Set up user profile header
    var currentUser = getUser();
    var userInfoDisplay = document.getElementById("user-info-display");
    userInfoDisplay.textContent = currentUser.username + " (" + currentUser.role + ")";

    // 3. Setup logout button
    document.getElementById("btn-logout").addEventListener("click", function () {
        logout();
    });

    // 4. Load initial users list
    fetchAndRenderUsers();

    // ============================================
    // Alert Display Functions
    // ============================================
    function showError(message) {
        var errDiv = document.getElementById("users-error");
        errDiv.textContent = message;
        errDiv.style.display = "block";
        setTimeout(clearAlerts, 5000);
    }

    function showSuccess(message) {
        var succDiv = document.getElementById("users-success");
        succDiv.textContent = message;
        succDiv.style.display = "block";
        setTimeout(clearAlerts, 5000);
    }

    function clearAlerts() {
        document.getElementById("users-error").style.display = "none";
        document.getElementById("users-success").style.display = "none";
    }

    // ============================================
    // Modal controls
    // ============================================
    function openModal(modalId) {
        document.getElementById(modalId).style.display = "flex";
    }

    function closeModal(modalId) {
        document.getElementById(modalId).style.display = "none";
    }

    document.getElementById("close-user-modal").addEventListener("click", () => closeModal("user-modal"));

    // Add User Button Click
    document.getElementById("btn-add-user").addEventListener("click", function () {
        document.getElementById("user-form").reset();
        document.getElementById("user-id").value = "";
        
        // Setup password field for new user
        document.getElementById("user-password").required = true;
        document.getElementById("password-hint").style.display = "none";
        
        document.getElementById("user-modal-title").textContent = "Add New User";
        openModal("user-modal");
    });

    // ============================================
    // Fetch and Render Users
    // ============================================
    async function fetchAndRenderUsers() {
        clearAlerts();
        try {
            var users = await getUsers();
            usersList = users; // Cache users list

            var tbody = document.getElementById("users-table-body");
            tbody.innerHTML = "";

            if (users.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No users found.</td></tr>`;
                return;
            }

            users.forEach(function (user) {
                var row = document.createElement("tr");

                // Format creation date
                var dateStr = "N/A";
                if (user.createdAt) {
                    try {
                        var dateObj = new Date(user.createdAt);
                        dateStr = dateObj.toLocaleString();
                    } catch (e) {
                        dateStr = user.createdAt;
                    }
                }

                row.innerHTML = `
                    <td>${user.id}</td>
                    <td><strong>${user.username || ""}</strong></td>
                    <td>${user.email || ""}</td>
                    <td><span style="font-weight:600;padding:2px 8px;background:#f3f4f6;border-radius:10px;font-size:12px;">${user.role || ""}</span></td>
                    <td>${dateStr}</td>
                    <td>
                        <button class="btn-sm btn-edit btn-edit-user" data-id="${user.id}">Edit</button>
                        <button class="btn-sm btn-delete btn-delete-user" data-id="${user.id}">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            // Action button listeners
            document.querySelectorAll(".btn-edit-user").forEach(btn => {
                btn.addEventListener("click", async function () {
                    var id = btn.getAttribute("data-id");
                    var user = usersList.find(u => u.id == id);
                    if (!user) {
                        // fallback to API
                        user = await getUserById(id);
                    }

                    document.getElementById("user-id").value = user.id;
                    document.getElementById("user-username").value = user.username;
                    document.getElementById("user-email").value = user.email;
                    
                    // Setup password field for update
                    var pwdInput = document.getElementById("user-password");
                    pwdInput.required = false;
                    pwdInput.value = "";
                    document.getElementById("password-hint").style.display = "block";

                    document.getElementById("user-role").value = user.role;
                    document.getElementById("user-modal-title").textContent = "Edit User";
                    openModal("user-modal");
                });
            });

            document.querySelectorAll(".btn-delete-user").forEach(btn => {
                btn.addEventListener("click", async function () {
                    var id = btn.getAttribute("data-id");
                    if (confirm("Are you sure you want to delete user #" + id + "?")) {
                        try {
                            await deleteUser(id);
                            showSuccess("User deleted successfully!");
                            fetchAndRenderUsers();
                        } catch (err) {
                            showError("Delete failed: " + err.message);
                        }
                    }
                });
            });

        } catch (error) {
            showError("Failed to fetch users: " + error.message);
        }
    }

    // ============================================
    // Create/Update Submit Event
    // ============================================
    document.getElementById("user-form").addEventListener("submit", async function (e) {
        e.preventDefault();
        var id = document.getElementById("user-id").value;
        var username = document.getElementById("user-username").value.trim();
        var email = document.getElementById("user-email").value.trim();
        var password = document.getElementById("user-password").value;
        var role = document.getElementById("user-role").value;

        // If editing a user, locate their current data
        var existingUser = null;
        if (id) {
            existingUser = usersList.find(u => u.id == id);
        }

        // Determine password value
        var passwordVal = password;
        if (id && !password) {
            // Keep existing password
            passwordVal = existingUser ? existingUser.passwordHash : "";
        }

        var payload = {
            username: username,
            email: email,
            passwordHash: passwordVal,
            role: role
        };

        if (id) {
            payload.id = parseInt(id);
            // keep original createdAt if caching
            if (existingUser && existingUser.createdAt) {
                payload.createdAt = existingUser.createdAt;
            }
        }

        try {
            if (id) {
                await updateUser(id, payload);
                showSuccess("User updated successfully!");
            } else {
                await createUser(payload);
                showSuccess("User created successfully!");
            }
            closeModal("user-modal");
            fetchAndRenderUsers();
        } catch (err) {
            alert("Save failed: " + err.message);
        }
    });

});
