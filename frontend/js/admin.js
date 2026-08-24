/* =========================================================
   ELEMENTS
========================================================= */

const loginSection =
    document.getElementById("loginSection");

const dashboardSection =
    document.getElementById("dashboardSection");

const loginForm =
    document.getElementById("loginForm");

const adminTokenInput =
    document.getElementById("adminToken");

const loginMessage =
    document.getElementById("loginMessage");

const productForm =
    document.getElementById("productForm");

const productMessage =
    document.getElementById("productMessage");

const categorySelect =
    document.getElementById("category");

const productsContainer =
    document.getElementById("productsContainer");

const imageInput =
    document.getElementById("image");

const imagePreview =
    document.getElementById("imagePreview");

const productIdInput =
    document.getElementById("productId");

const formTitle =
    document.getElementById("formTitle");

const cancelBtn =
    document.getElementById("cancelBtn");

const refreshBtn =
    document.getElementById("refreshBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const toggleToken =
    document.getElementById("toggleToken");


/* =========================================================
   CATEGORY ELEMENTS
========================================================= */

const categoryForm =
    document.getElementById("categoryForm");

const categoryNameInput =
    document.getElementById("categoryName");

const categoryDescriptionInput =
    document.getElementById("categoryDescription");

const categoryMessage =
    document.getElementById("categoryMessage");

const addCategoryBtn =
    document.getElementById("addCategoryBtn");

const adminCategoryList =
    document.getElementById("adminCategoryList");

const hideCategoriesBtn =
    document.getElementById("hideCategoriesBtn");

const categoryManagement =
    document.getElementById("categoryManagement");

const addMoreCategoriesBtn =
    document.getElementById("addMoreCategoriesBtn");

const openCategoryFormBtn =
    document.getElementById("openCategoryFormBtn");

const cancelCategoryBtn =
    document.getElementById("cancelCategoryBtn");

const categoryFormWrapper =
    document.getElementById("categoryFormWrapper");


/* =========================================================
   ADMIN TOKEN
========================================================= */

let adminToken =
    localStorage.getItem("adminToken");


/* =========================================================
   INITIAL PAGE
========================================================= */

if (adminToken) {

    showDashboard();

} else {

    if (loginSection) {

        loginSection.classList.remove(
            "hidden"
        );

    }


    if (dashboardSection) {

        dashboardSection.classList.add(
            "hidden"
        );

    }


    if (logoutBtn) {

        logoutBtn.style.display =
            "none";

    }

}


/* =========================================================
   LOGIN
========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const token =
                adminTokenInput.value.trim();


            if (!token) {

                loginMessage.textContent =
                    "Please enter your admin token.";

                return;

            }


            try {

                loginMessage.textContent =
                    "Checking token...";


                const response =
                    await fetch(
                        "/api/admin/products",
                        {
                            method: "GET",

                            headers: {
                                "x-admin-token":
                                    token
                            }
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    loginMessage.textContent =
                        data.message ||
                        "Invalid admin token.";

                    return;

                }


                localStorage.setItem(
                    "adminToken",
                    token
                );


                adminToken =
                    token;


                loginMessage.textContent =
                    "";


                await showDashboard();


            } catch (error) {

                console.error(
                    "LOGIN ERROR:",
                    error
                );


                loginMessage.textContent =
                    "Unable to connect to server.";

            }

        }
    );

}


/* =========================================================
   SHOW DASHBOARD
========================================================= */

async function showDashboard() {

    if (loginSection) {

        loginSection.classList.add(
            "hidden"
        );

    }


    if (dashboardSection) {

        dashboardSection.classList.remove(
            "hidden"
        );

    }


    if (logoutBtn) {

        logoutBtn.style.display =
            "block";

    }


    await loadCategories();

    await loadProducts();

}


/* =========================================================
   LOAD CATEGORIES
========================================================= */

async function loadCategories() {

    if (!categorySelect) {
        return;
    }


    try {

        categorySelect.innerHTML = `
            <option value="">
                Loading categories...
            </option>
        `;


        const response =
            await fetch(
                "/api/products/categories"
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Failed to load categories."
            );

        }


        categorySelect.innerHTML = `
            <option value="">
                Select Category
            </option>
        `;


        if (
            !data.categories ||
            data.categories.length === 0
        ) {

            categorySelect.innerHTML = `
                <option value="">
                    No categories available
                </option>
            `;

            return;

        }


        data.categories.forEach(
            function (category) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    category.id;


                option.textContent =
                    category.name;


                categorySelect.appendChild(
                    option
                );

            }
        );


    } catch (error) {

        console.error(
            "CATEGORY ERROR:",
            error
        );


        categorySelect.innerHTML = `
            <option value="">
                Failed to load categories
            </option>
        `;

    }

}


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

    if (!productsContainer) {
        return;
    }


    try {

        productsContainer.innerHTML =
            "<p>Loading products...</p>";


        const response =
            await fetch(
                "/api/admin/products",
                {
                    method: "GET",

                    headers: {
                        "x-admin-token":
                            adminToken
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load products."
            );

        }


        displayProducts(
            data.products
        );


    } catch (error) {

        console.error(
            "PRODUCT LOAD ERROR:",
            error
        );


        productsContainer.innerHTML = `
            <p>
                ${escapeHTML(error.message)}
            </p>
        `;

    }

}


/* =========================================================
   DISPLAY PRODUCTS
========================================================= */

function displayProducts(products) {

    if (
        !products ||
        products.length === 0
    ) {

        productsContainer.innerHTML =
            "<p>No products found.</p>";

        return;

    }


    productsContainer.innerHTML =
        "";


    products.forEach(
        function (product) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "product-card";


            card.innerHTML = `

                <div class="product-card-content">

                    <h3>
                        ${escapeHTML(
                            product.name
                        )}
                    </h3>


                    <p>
                        ${escapeHTML(
                            product.description || ""
                        )}
                    </p>


                    <p>
                        <strong>Price:</strong>
                        Rs.
                        ${Number(
                            product.price
                        ).toFixed(2)}
                    </p>


                    <p>
                        <strong>Category:</strong>
                        ${escapeHTML(
                            product.category_name || ""
                        )}
                    </p>


                    <p>
                        <strong>Stock:</strong>
                        ${Number(
                            product.stock || 0
                        )}
                    </p>


                    <p>
                        <strong>Available:</strong>
                        ${
                            Number(
                                product.is_available
                            ) === 1
                                ? "Yes"
                                : "No"
                        }
                    </p>


                    <div class="product-actions">

                        <button
                            type="button"
                            class="edit-btn"
                            onclick="editProduct(${product.id})"
                        >
                            Edit
                        </button>


                        <button
                            type="button"
                            class="delete-btn"
                            onclick="deleteProduct(${product.id})"
                        >
                            Delete
                        </button>

                    </div>

                </div>

            `;


            productsContainer.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   ADD / UPDATE PRODUCT
========================================================= */

if (productForm) {

    productForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const productId =
                productIdInput.value;


            const name =
                document.getElementById(
                    "name"
                ).value.trim();


            const description =
                document.getElementById(
                    "description"
                ).value.trim();


            const category_id =
                categorySelect.value;


            const price =
                document.getElementById(
                    "price"
                ).value;


            const stock =
                document.getElementById(
                    "stock"
                ).value;


            /* -------------------------
               VALIDATION
            ------------------------- */

            if (!name) {

                productMessage.textContent =
                    "Product name is required.";

                return;

            }


            if (!category_id) {

                productMessage.textContent =
                    "Please select a category.";

                return;

            }


            if (
                !price ||
                Number(price) <= 0
            ) {

                productMessage.textContent =
                    "Price must be greater than 0.";

                return;

            }


            if (
                stock === "" ||
                Number(stock) < 0
            ) {

                productMessage.textContent =
                    "Stock cannot be negative.";

                return;

            }


            /* -------------------------
               PRODUCT DATA
            ------------------------- */

            const productData = {

                name: name,

                description:
                    description || null,

                category_id:
                    Number(category_id),

                price:
                    Number(price),

                stock:
                    Number(stock)

            };


            try {

                productMessage.textContent =
                    productId
                        ? "Updating product..."
                        : "Adding product...";


                const url =
                    productId
                        ? `/api/admin/products/${productId}`
                        : "/api/admin/products";


                const method =
                    productId
                        ? "PUT"
                        : "POST";


                const response =
                    await fetch(
                        url,
                        {
                            method: method,

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "x-admin-token":
                                    adminToken

                            },

                            body:
                                JSON.stringify(
                                    productData
                                )

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to save product."
                    );

                }


                productMessage.textContent =
                    data.message ||
                    "Product saved successfully.";


                resetForm();


                await loadProducts();


            } catch (error) {

                console.error(
                    "SAVE PRODUCT ERROR:",
                    error
                );


                productMessage.textContent =
                    error.message;

            }

        }
    );

}


/* =========================================================
   EDIT PRODUCT
========================================================= */

async function editProduct(id) {

    try {

        const response =
            await fetch(
                `/api/admin/products/${id}`,
                {
                    method: "GET",

                    headers: {
                        "x-admin-token":
                            adminToken
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load product."
            );

        }


        const product =
            data.product;


        productIdInput.value =
            product.id;


        document.getElementById(
            "name"
        ).value =
            product.name;


        document.getElementById(
            "description"
        ).value =
            product.description || "";


        categorySelect.value =
            product.category_id;


        document.getElementById(
            "price"
        ).value =
            product.price;


        document.getElementById(
            "stock"
        ).value =
            product.stock;


        formTitle.textContent =
            "Edit Product";


        imagePreview.innerHTML =
            "";


        /*
         * This scroll is ONLY for editing a product.
         * It does not affect category buttons.
         */

        productForm.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


    } catch (error) {

        console.error(
            "EDIT PRODUCT ERROR:",
            error
        );


        alert(
            error.message
        );

    }

}


/* =========================================================
   DELETE PRODUCT
========================================================= */

async function deleteProduct(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this product?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/admin/products/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        "x-admin-token":
                            adminToken
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to delete product."
            );

        }


        alert(
            data.message ||
            "Product deleted successfully."
        );


        await loadProducts();


    } catch (error) {

        console.error(
            "DELETE PRODUCT ERROR:",
            error
        );


        alert(
            error.message
        );

    }

}


/* =========================================================
   IMAGE PREVIEW
========================================================= */

if (imageInput) {

    imageInput.addEventListener(
        "change",
        function () {

            const file =
                imageInput.files[0];


            if (!file) {

                imagePreview.innerHTML =
                    "";

                return;

            }


            const allowedTypes = [

                "image/jpeg",
                "image/png",
                "image/webp",
                "image/gif"

            ];


            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                alert(
                    "Only JPG, PNG, WEBP and GIF images are allowed."
                );


                imageInput.value =
                    "";


                imagePreview.innerHTML =
                    "";


                return;

            }


            if (
                file.size >
                5 * 1024 * 1024
            ) {

                alert(
                    "Image must be smaller than 5 MB."
                );


                imageInput.value =
                    "";


                imagePreview.innerHTML =
                    "";


                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    imagePreview.innerHTML = `

                        <img
                            src="${event.target.result}"
                            alt="Image Preview"
                        >

                    `;

                };


            reader.readAsDataURL(file);

        }
    );

}


/* =========================================================
   CANCEL / RESET PRODUCT
========================================================= */

if (cancelBtn) {

    cancelBtn.addEventListener(
        "click",
        function () {

            resetForm();

        }
    );

}


function resetForm() {

    if (productForm) {

        productForm.reset();

    }


    if (productIdInput) {

        productIdInput.value =
            "";

    }


    if (formTitle) {

        formTitle.textContent =
            "Add Product";

    }


    if (imagePreview) {

        imagePreview.innerHTML =
            "";

    }


    if (productMessage) {

        productMessage.textContent =
            "";

    }

}


/* =========================================================
   REFRESH PRODUCTS
========================================================= */

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        function () {

            loadProducts();

        }
    );

}


/* =========================================================
   LOGOUT
========================================================= */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "adminToken"
            );


            adminToken =
                null;


            if (dashboardSection) {

                dashboardSection.classList.add(
                    "hidden"
                );

            }


            if (loginSection) {

                loginSection.classList.remove(
                    "hidden"
                );

            }


            logoutBtn.style.display =
                "none";


            if (adminTokenInput) {

                adminTokenInput.value =
                    "";

            }


            resetForm();


            /*
             * Close category management
             */

            if (categoryManagement) {

                categoryManagement.classList.add(
                    "hidden"
                );

            }

        }
    );

}


/* =========================================================
   SHOW / HIDE ADMIN TOKEN
========================================================= */

if (toggleToken) {

    toggleToken.addEventListener(
        "click",
        function () {

            if (
                adminTokenInput.type ===
                "password"
            ) {

                adminTokenInput.type =
                    "text";


                toggleToken.textContent =
                    "🙈";


                toggleToken.setAttribute(
                    "aria-label",
                    "Hide token"
                );

            } else {

                adminTokenInput.type =
                    "password";


                toggleToken.textContent =
                    "👁";


                toggleToken.setAttribute(
                    "aria-label",
                    "Show token"
                );

            }

        }
    );

}


/* =========================================================
   OPEN CATEGORY MANAGEMENT
========================================================= */

if (addMoreCategoriesBtn) {

    addMoreCategoriesBtn.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();


            if (!categoryManagement) {
                return;
            }


            /*
             * Open category management.
             *
             * IMPORTANT:
             * There is NO scrollIntoView() here.
             *
             * Therefore the page will not jump.
             */

            categoryManagement.classList.remove(
                "hidden"
            );


            /*
             * Load latest categories.
             */

            await loadAdminCategories();

        }
    );

}


/* =========================================================
   CLOSE CATEGORY MANAGEMENT
========================================================= */

if (hideCategoriesBtn) {

    hideCategoriesBtn.addEventListener(
        "click",
        function () {

            if (!categoryManagement) {
                return;
            }


            categoryManagement.classList.add(
                "hidden"
            );


            /*
             * Also close the add-category form.
             */

            closeCategoryForm();

        }
    );

}


/* =========================================================
   OPEN ADD CATEGORY FORM
========================================================= */

if (openCategoryFormBtn) {

    openCategoryFormBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            /*
             * Show form inside the
             * category scroll area.
             */

            if (categoryFormWrapper) {

                categoryFormWrapper.classList.remove(
                    "hidden"
                );

            }


            /*
             * Hide Add Category button.
             */

            openCategoryFormBtn.classList.add(
                "hidden"
            );


            /*
             * Focus input.
             *
             * preventScroll prevents the browser
             * from moving the whole page.
             */

            if (categoryNameInput) {

                setTimeout(
                    function () {

                        categoryNameInput.focus({
                            preventScroll: true
                        });

                    },
                    50
                );

            }

        }
    );

}


/* =========================================================
   CLOSE ADD CATEGORY FORM
========================================================= */

if (cancelCategoryBtn) {

    cancelCategoryBtn.addEventListener(
        "click",
        function () {

            closeCategoryForm();

        }
    );

}


function closeCategoryForm() {

    if (categoryFormWrapper) {

        categoryFormWrapper.classList.add(
            "hidden"
        );

    }


    if (openCategoryFormBtn) {

        openCategoryFormBtn.classList.remove(
            "hidden"
        );

    }


    if (categoryForm) {

        categoryForm.reset();

    }


    if (categoryMessage) {

        categoryMessage.textContent =
            "";

    }

}


/* =========================================================
   LOAD ADMIN CATEGORIES
========================================================= */

async function loadAdminCategories() {

    if (!adminCategoryList) {
        return;
    }


    try {

        adminCategoryList.innerHTML = `
            <div class="loading-message">
                Loading categories...
            </div>
        `;


        const response =
            await fetch(
                "/api/products/categories"
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Failed to load categories."
            );

        }


        displayAdminCategories(
            data.categories
        );


    } catch (error) {

        console.error(
            "CATEGORY LOAD ERROR:",
            error
        );


        adminCategoryList.innerHTML = `
            <p>
                ${escapeHTML(
                    error.message
                )}
            </p>
        `;

    }

}


/* =========================================================
   DISPLAY ADMIN CATEGORIES
========================================================= */

function displayAdminCategories(
    categories
) {

    if (
        !categories ||
        categories.length === 0
    ) {

        adminCategoryList.innerHTML = `
            <p>
                No categories found.
            </p>
        `;

        return;

    }


    adminCategoryList.innerHTML =
        "";


    categories.forEach(
        function (category) {

            const card =
                document.createElement(
                    "div"
                );


            /*
             * This class can be styled
             * by admin.css.
             */

            card.className =
                "admin-category-card";


            card.innerHTML = `

                <div class="category-info">

                    <h4>
                        ${escapeHTML(
                            category.name
                        )}
                    </h4>


                    <p>
                        ${escapeHTML(
                            category.description ||
                            "No description"
                        )}
                    </p>

                </div>


                <button
                    type="button"
                    class="delete-category-btn"
                    data-id="${category.id}"
                >
                    Delete
                </button>

            `;


            adminCategoryList.appendChild(
                card
            );

        }
    );


    /*
     * Add delete events.
     */

    const deleteButtons =
        adminCategoryList.querySelectorAll(
            ".delete-category-btn"
        );


    deleteButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const categoryId =
                        button.dataset.id;


                    deleteCategory(
                        categoryId
                    );

                }
            );

        }
    );

}


/* =========================================================
   ADD CATEGORY
========================================================= */

if (categoryForm) {

    categoryForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                categoryNameInput.value.trim();


            const description =
                categoryDescriptionInput.value.trim();


            if (!name) {

                categoryMessage.textContent =
                    "Please enter a category name.";

                categoryNameInput.focus();

                return;

            }


            try {

                categoryMessage.textContent =
                    "Adding category...";


                addCategoryBtn.disabled =
                    true;


                const response =
                    await fetch(
                        "/api/admin/categories",
                        {
                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "x-admin-token":
                                    adminToken

                            },

                            body:
                                JSON.stringify({

                                    name:
                                        name,

                                    description:
                                        description ||
                                        null

                                })

                        }
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Failed to add category."
                    );

                }


                categoryMessage.textContent =
                    data.message ||
                    "Category added successfully.";


                /*
                 * Clear form.
                 */

                categoryNameInput.value =
                    "";

                categoryDescriptionInput.value =
                    "";


                /*
                 * Refresh category list.
                 */

                await loadAdminCategories();


                /*
                 * Refresh product category dropdown.
                 */

                await loadCategories();


                /*
                 * Keep the form open.
                 *
                 * This allows the admin to
                 * immediately add another category.
                 */

                categoryNameInput.focus({
                    preventScroll: true
                });


            } catch (error) {

                console.error(
                    "ADD CATEGORY ERROR:",
                    error
                );


                categoryMessage.textContent =
                    error.message;


            } finally {

                addCategoryBtn.disabled =
                    false;

            }

        }
    );

}


/* =========================================================
   DELETE CATEGORY
========================================================= */

async function deleteCategory(
    categoryId
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this category?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/admin/categories/${categoryId}`,
                {
                    method: "DELETE",

                    headers: {
                        "x-admin-token":
                            adminToken
                    }
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Failed to delete category."
            );

        }


        categoryMessage.textContent =
            data.message ||
            "Category deleted successfully.";


        /*
         * Reload category list.
         */

        await loadAdminCategories();


        /*
         * Reload product dropdown.
         */

        await loadCategories();


    } catch (error) {

        console.error(
            "DELETE CATEGORY ERROR:",
            error
        );


        categoryMessage.textContent =
            error.message;

    }

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}