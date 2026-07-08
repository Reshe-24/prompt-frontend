// ============================================
// dashboard.js - Content switcher & CRUD logic
// ============================================

// Global cache for dropdown selections
var categoriesList = [];
var templatesList = [];

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

    // 4. Role-based UI updates
    var isLead = (currentUser.role === "TEAM_LEAD");
    if (!isLead) {
        // Hide elements meant only for Team Leads (Admins)
        var adminElements = document.querySelectorAll(".admin-only");
        adminElements.forEach(function (element) {
            element.style.display = "none";
        });
    }

    // 5. Handle section tabs switching
    var tabButtons = document.querySelectorAll(".tab-btn");
    var tabPanels = document.querySelectorAll(".tab-panel");

    tabButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            // Remove active classes
            tabButtons.forEach(btn => btn.classList.remove("active"));
            tabPanels.forEach(panel => panel.classList.remove("active"));

            // Add active class to clicked button
            button.classList.add("active");

            // Show corresponding panel
            var targetId = button.getAttribute("data-tab");
            var targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.add("active");
                // Fetch the latest data for this tab
                loadTabContent(targetId);
            }
        });
    });

    // Load initial tab (Templates)
    loadTabContent("templates-section");

    // ============================================
    // API Loader Helpers
    // ============================================
    async function loadTabContent(tabId) {
        clearAlerts();
        try {
            if (tabId === "templates-section") {
                await fetchAndRenderTemplates();
            } else if (tabId === "categories-section") {
                await fetchAndRenderCategories();
            } else if (tabId === "collections-section") {
                await fetchAndRenderCollections();
            } else if (tabId === "versions-section") {
                await fetchAndRenderVersions();
            }
        } catch (error) {
            showError("Failed to load content: " + error.message);
        }
    }


    // ============================================
    // Alert Display Functions
    // ============================================
    function showError(message) {
        var errDiv = document.getElementById("dashboard-error");
        errDiv.textContent = message;
        errDiv.style.display = "block";
        setTimeout(clearAlerts, 5000);
    }

    function showSuccess(message) {
        var succDiv = document.getElementById("dashboard-success");
        succDiv.textContent = message;
        succDiv.style.display = "block";
        setTimeout(clearAlerts, 5000);
    }

    function clearAlerts() {
        document.getElementById("dashboard-error").style.display = "none";
        document.getElementById("dashboard-success").style.display = "none";
    }


    // ============================================
    // Modals handling utility
    // ============================================
    function openModal(modalId) {
        document.getElementById(modalId).style.display = "flex";
    }

    function closeModal(modalId) {
        document.getElementById(modalId).style.display = "none";
    }

    // Modal Close buttons
    document.getElementById("close-template-modal").addEventListener("click", () => closeModal("template-modal"));
    document.getElementById("close-category-modal").addEventListener("click", () => closeModal("category-modal"));
    document.getElementById("close-collection-modal").addEventListener("click", () => closeModal("collection-modal"));
    document.getElementById("close-version-modal").addEventListener("click", () => closeModal("version-modal"));

    // Modal Add buttons
    document.getElementById("btn-add-template").addEventListener("click", function () {
        document.getElementById("template-form").reset();
        document.getElementById("template-id").value = "";
        document.getElementById("template-modal-title").textContent = "Add Prompt Template";
        populateCategoryDropdown("template-category");
        openModal("template-modal");
    });

    document.getElementById("btn-add-category").addEventListener("click", function () {
        document.getElementById("category-form").reset();
        document.getElementById("category-id").value = "";
        document.getElementById("category-modal-title").textContent = "Add Category";
        openModal("category-modal");
    });

    document.getElementById("btn-add-collection").addEventListener("click", function () {
        document.getElementById("collection-form").reset();
        document.getElementById("collection-id").value = "";
        document.getElementById("collection-modal-title").textContent = "Add Prompt Collection";
        openModal("collection-modal");
    });

    document.getElementById("btn-add-version").addEventListener("click", function () {
        document.getElementById("version-form").reset();
        document.getElementById("version-id").value = "";
        document.getElementById("version-modal-title").textContent = "Add Prompt Version";
        populateTemplateDropdown("version-template");
        openModal("version-modal");
    });


    // ============================================
    // TEMPLATE CRUD
    // ============================================
    async function fetchAndRenderTemplates() {
        // Cache categories first so we can display names in the table
        categoriesList = await getCategories();
        var templates = await getTemplates();
        templatesList = templates; // Cache templates

        var tbody = document.getElementById("templates-table-body");
        tbody.innerHTML = "";

        if (templates.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No templates found.</td></tr>`;
            return;
        }

        templates.forEach(function (tpl) {
            // Find category name
            var categoryName = "Unknown";
            var categoryObj = categoriesList.find(c => c.id === tpl.categoryId);
            if (categoryObj) {
                categoryName = categoryObj.name;
            }

            var row = document.createElement("tr");

            var actionButtons = `<button class="btn-sm btn-edit btn-edit-template" data-id="${tpl.id}">✏️Edit</button>`;
            if (isLead) {
                actionButtons += `<button class="btn-sm btn-delete btn-delete-template" data-id="${tpl.id}">🗑Delete</button>`;
            }

            row.innerHTML = `
                <td>${tpl.id}</td>
                <td><strong>${tpl.title || ""}</strong></td>
                <td><code style="background:#f1f1f1;padding:2px 4px;border-radius:3px;">${tpl.promptText || ""}</code></td>
                <td><span style="font-weight:600;color:${tpl.status === 'ACTIVE' ? 'var(--success-color)' : 'var(--text-muted)'}">${tpl.status || ""}</span></td>
                <td>${categoryName}</td>
                <td>${tpl.userId || ""}</td>
                <td>${actionButtons}</td>
            `;
            tbody.appendChild(row);
        });

        // Add listeners to actions
        document.querySelectorAll(".btn-edit-template").forEach(btn => {
            btn.addEventListener("click", async function () {
                var id = btn.getAttribute("data-id");
                var tpl = await getTemplateById(id);
                
                document.getElementById("template-id").value = tpl.id;
                document.getElementById("template-title").value = tpl.title;
                document.getElementById("template-text").value = tpl.promptText;
                document.getElementById("template-status").value = tpl.status;
                
                await populateCategoryDropdown("template-category", tpl.categoryId);
                
                document.getElementById("template-modal-title").textContent = "Edit Prompt Template";
                openModal("template-modal");
            });
        });

        document.querySelectorAll(".btn-delete-template").forEach(btn => {
            btn.addEventListener("click", async function () {
                var id = btn.getAttribute("data-id");
                if (confirm("Are you sure you want to delete template #" + id + "?")) {
                    try {
                        await deleteTemplate(id);
                        showSuccess("Template deleted successfully!");
                        fetchAndRenderTemplates();
                    } catch (err) {
                        showError("Delete failed: " + err.message);
                    }
                }
            });
        });
    }

    // Populate Category select element
    async function populateCategoryDropdown(selectId, selectedId = null) {
      var select = document.getElementById(selectId);
      select.innerHTML = '<option value="">-- Select Category --</option>';

      try {
        if (categoriesList.length === 0) {
          categoriesList = await getCategories();
        }

        console.log("Categories:", categoriesList);

        categoriesList.forEach(function (cat) {
          var option = document.createElement("option");
          option.value = cat.id;
          option.textContent = cat.name;

          if (selectedId && cat.id == selectedId) {
            option.selected = true;
          }

          select.appendChild(option);
        });
      } catch (err) {
        console.error("Failed to load categories:", err);
        alert("Failed to load categories: " + err.message);
      }
    }

    // Submit Template form
    document.getElementById("template-form").addEventListener("submit", async function (e) {
        e.preventDefault();
        var id = document.getElementById("template-id").value;
        var title = document.getElementById("template-title").value;
        var promptText = document.getElementById("template-text").value;
        var status = document.getElementById("template-status").value;
        var categoryId = document.getElementById("template-category").value;

        if (!categoryId) {
            alert("Please select a category");
            return;
        }

        var payload = {
            title: title,
            promptText: promptText,
            status: status,
            userId: parseInt(currentUser.id),
            categoryId: parseInt(categoryId)
        };

        try {
            if (id) {
                await updateTemplate(id, payload);
                showSuccess("Template updated successfully!");
            } else {
                await createTemplate(payload);
                showSuccess("Template created successfully!");
            }
            closeModal("template-modal");
            fetchAndRenderTemplates();
        } catch (err) {
            alert("Save failed: " + err.message);
        }
    });


    // ============================================
    // CATEGORY CRUD
    // ============================================
    async function fetchAndRenderCategories() {
        var categories = await getCategories();
        categoriesList = categories; // Cache categories

        var tbody = document.getElementById("categories-table-body");
        tbody.innerHTML = "";

        if (categories.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No categories found.</td></tr>`;
            return;
        }

        categories.forEach(function (cat) {
            var row = document.createElement("tr");

            var actionButtons = "";
            if (isLead) {
                actionButtons = `
                    <td>
                        <button class="btn-sm btn-edit btn-edit-category" data-id="${cat.id}">Edit</button>
                        <button class="btn-sm btn-delete btn-delete-category" data-id="${cat.id}">Delete</button>
                    </td>
                `;
            } else {
                actionButtons = ``;
            }

            row.innerHTML = `
                <td>${cat.id}</td>
                <td><strong>${cat.name || ""}</strong></td>
                <td>${cat.description || ""}</td>
                <td><span style="font-weight:600;padding:2px 8px;background:#f3f4f6;border-radius:10px;">${cat.templateCount || 0}</span></td>
                ${actionButtons}
            `;
            tbody.appendChild(row);
        });

        // Event listeners for edits and deletes
        document.querySelectorAll(".btn-edit-category").forEach(btn => {
            btn.addEventListener("click", async function () {
                var id = btn.getAttribute("data-id");
                var cat = await getCategoryById(id);
                
                document.getElementById("category-id").value = cat.id;
                document.getElementById("category-name").value = cat.name;
                document.getElementById("category-description").value = cat.description || "";
                document.getElementById("category-count").value = cat.templateCount || 0;
                
                document.getElementById("category-modal-title").textContent = "Edit Category";
                openModal("category-modal");
            });
        });

        document.querySelectorAll(".btn-delete-category").forEach(btn => {
            btn.addEventListener("click", async function () {
                var id = btn.getAttribute("data-id");
                if (confirm("Are you sure you want to delete category #" + id + "?")) {
                    try {
                        await deleteCategory(id);
                        showSuccess("Category deleted successfully!");
                        fetchAndRenderCategories();
                    } catch (err) {
                        showError("Delete failed: " + err.message);
                    }
                }
            });
        });
    }

    // Submit Category form
    document.getElementById("category-form").addEventListener("submit", async function (e) {
        e.preventDefault();
        var id = document.getElementById("category-id").value;
        var name = document.getElementById("category-name").value;
        var description = document.getElementById("category-description").value;
        var templateCount = document.getElementById("category-count").value;

        var payload = {
            name: name,
            description: description,
            templateCount: parseInt(templateCount) || 0
        };

        try {
            if (id) {
                await updateCategory(id, payload);
                showSuccess("Category updated successfully!");
            } else {
                await createCategory(payload);
                showSuccess("Category created successfully!");
            }
            closeModal("category-modal");
            fetchAndRenderCategories();
        } catch (err) {
            alert("Save failed: " + err.message);
        }
    });


    // ============================================
    // COLLECTION CRUD
    // ============================================
    async function fetchAndRenderCollections() {
        var collections = await getCollections();
        var tbody = document.getElementById("collections-table-body");
        tbody.innerHTML = "";

        if (collections.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No collections found.</td></tr>`;
            return;
        }

        collections.forEach(function (col) {
            var row = document.createElement("tr");
            
            // Delete is allowed for anyone who is authenticated, as per backend rules
            var actionButtons = `<button class="btn-sm btn-delete btn-delete-collection" data-id="${col.id}">Delete</button>`;

            row.innerHTML = `
                <td>${col.id}</td>
                <td><strong>${col.collectionName || ""}</strong></td>
                <td>${col.description || ""}</td>
                <td>${col.userId || ""}</td>
                <td>${actionButtons}</td>
            `;
            tbody.appendChild(row);
        });

        document.querySelectorAll(".btn-delete-collection").forEach(btn => {
            btn.addEventListener("click", async function () {
                var id = btn.getAttribute("data-id");
                if (confirm("Are you sure you want to delete collection #" + id + "?")) {
                    try {
                        await deleteCollection(id);
                        showSuccess("Collection deleted successfully!");
                        fetchAndRenderCollections();
                    } catch (err) {
                        showError("Delete failed: " + err.message);
                    }
                }
            });
        });
    }

    // Submit Collection form
    document.getElementById("collection-form").addEventListener("submit", async function (e) {
        e.preventDefault();
        var id = document.getElementById("collection-id").value;
        var collectionName = document.getElementById("collection-name").value;
        var description = document.getElementById("collection-description").value;

        var payload = {
            collectionName: collectionName,
            description: description,
            userId: parseInt(currentUser.id)
        };

        try {
            await createCollection(payload);
            showSuccess("Collection created successfully!");
            closeModal("collection-modal");
            fetchAndRenderCollections();
        } catch (err) {
            alert("Save failed: " + err.message);
        }
    });


    // ============================================
    // VERSION CRUD
    // ============================================
    async function fetchAndRenderVersions() {
        var versions = await getVersions();
        var tbody = document.getElementById("versions-table-body");
        tbody.innerHTML = "";

        if (versions.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No versions found.</td></tr>`;
            return;
        }

        versions.forEach(function (ver) {
            var row = document.createElement("tr");

            var actionButtons = "";
            if (isLead) {
                actionButtons = `
                    <td>
                        <button class="btn-sm btn-edit btn-edit-version" data-id="${ver.id}">Edit</button>
                        <button class="btn-sm btn-delete btn-delete-version" data-id="${ver.id}">Delete</button>
                    </td>
                `;
            } else {
                actionButtons = ``;
            }

            row.innerHTML = `
                <td>${ver.id}</td>
                <td><strong>${ver.versionName || ""}</strong></td>
                <td><code style="background:#f1f1f1;padding:2px 4px;border-radius:3px;">${ver.promptText || ""}</code></td>
                <td>${ver.templateId || ""}</td>
                ${actionButtons}
            `;
            tbody.appendChild(row);
        });

        // Add listeners to actions
        document.querySelectorAll(".btn-edit-version").forEach(btn => {
            btn.addEventListener("click", async function () {
                var id = btn.getAttribute("data-id");
                var ver = await getVersionById(id);
                
                document.getElementById("version-id").value = ver.id;
                document.getElementById("version-name").value = ver.versionName;
                document.getElementById("version-text").value = ver.promptText;
                
                await populateTemplateDropdown("version-template", ver.templateId);
                
                document.getElementById("version-modal-title").textContent = "Edit Prompt Version";
                openModal("version-modal");
            });
        });

        document.querySelectorAll(".btn-delete-version").forEach(btn => {
            btn.addEventListener("click", async function () {
                var id = btn.getAttribute("data-id");
                if (confirm("Are you sure you want to delete version #" + id + "?")) {
                    try {
                        await deleteVersion(id);
                        showSuccess("Version deleted successfully!");
                        fetchAndRenderVersions();
                    } catch (err) {
                        showError("Delete failed: " + err.message);
                    }
                }
            });
        });
    }

    // Populate template dropdown list
    async function populateTemplateDropdown(selectId, selectedId = null) {
        var select = document.getElementById(selectId);
        select.innerHTML = '<option value="">-- Select Parent Template --</option>';
        if (templatesList.length === 0) {
            templatesList = await getTemplates();
        }
        templatesList.forEach(function (tpl) {
            var option = document.createElement("option");
            option.value = tpl.id;
            option.textContent = tpl.title + " (ID: " + tpl.id + ")";
            if (selectedId && tpl.id == selectedId) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }

    // Submit Version form
    document.getElementById("version-form").addEventListener("submit", async function (e) {
        e.preventDefault();
        var id = document.getElementById("version-id").value;
        var versionName = document.getElementById("version-name").value;
        var promptText = document.getElementById("version-text").value;
        var templateId = document.getElementById("version-template").value;

        if (!templateId) {
            alert("Please select a parent template");
            return;
        }

        var payload = {
            versionName: versionName,
            promptText: promptText,
            templateId: parseInt(templateId)
        };

        try {
            if (id) {
                await updateVersion(id, payload);
                showSuccess("Version updated successfully!");
            } else {
                await createVersion(payload);
                showSuccess("Version created successfully!");
            }
            closeModal("version-modal");
            fetchAndRenderVersions();
        } catch (err) {
            alert("Save failed: " + err.message);
        }
    });

});
