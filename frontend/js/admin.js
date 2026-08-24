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
   INLINE CATEGORY ELEMENTS
========================================================= */

const inlineCategoryForm =
    document.getElementById(
        "inlineCategoryForm"
    );

const inlineCategoryName =
    document.getElementById(
        "inlineCategoryName"
    );

const inlineCategoryDescription =
    document.getElementById(
        "inlineCategoryDescription"
    );

const saveInlineCategoryBtn =
    document.getElementById(
        "saveInlineCategoryBtn"
    );

const cancelInlineCategoryBtn =
    document.getElementById(
        "cancelInlineCategoryBtn"
    );

const closeInlineCategoryBtn =
    document.getElementById(
        "closeInlineCategoryBtn"
    );

const inlineCategoryMessage =
    document.getElementById(
        "inlineCategoryMessage"
    );


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


                /*
                 * Save token
                 */

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

async function loadCategories(
    selectedCategoryId = null
) {

    if (!categorySelect) {
        return;
    }


    try {

        /*
         * Temporary loading option
         */

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


        /*
         * Clear dropdown
         */

        categorySelect.innerHTML = "";


        /*
         * Default option
         */

        const defaultOption =
            document.createElement(
                "option"
            );


        defaultOption.value =
            "";


        defaultOption.textContent =
            "Select Category";


        categorySelect.appendChild(
            defaultOption
        );


        /*
         * Existing categories
         */

        if (
            data.categories &&
            data.categories.length > 0
        ) {

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

        }


        /*
         * IMPORTANT
         *
         * This option is always LAST.
         *
         * Therefore when the admin opens
         * the dropdown they will see:
         *
         * Category 1
         * Category 2
         * Category 3
         * + Add More Categories
         */

        const addCategoryOption =
            document.createElement(
                "option"
            );


        addCategoryOption.value =
            "__add_category__";


        addCategoryOption.textContent =
            "+ Add More Categories";


        addCategoryOption.className =
            "add-category-option";


        categorySelect.appendChild(
            addCategoryOption
        );


        /*
         * Restore selected category
         */

        if (
            selectedCategoryId !== null &&
            selectedCategoryId !== undefined
        ) {

            categorySelect.value =
                String(selectedCategoryId);

        }


    } catch (error) {

        console.error(
            "CATEGORY ERROR:",
            error
        );


        categorySelect.innerHTML = `
            <option value="">
                Failed to load categories
            </option>

            <option value="__add_category__">
                + Add More Categories
            </option>
        `;

    }

}


/* =========================================================
   CATEGORY DROPDOWN
========================================================= */

if (categorySelect) {

    categorySelect.addEventListener(
        "change",
        function () {

            /*
             * Check if the special
             * Add More Categories option
             * was selected.
             */

            if (
                categorySelect.value ===
                "__add_category__"
            ) {

                /*
                 * Return dropdown to normal
                 * selection.
                 */

                categorySelect.value =
                    "";


                /*
                 * Open the form DIRECTLY
                 * below the dropdown.
                 */

                openInlineCategoryForm();

            }

        }
    );

}


/* =========================================================
   OPEN INLINE CATEGORY FORM
========================================================= */

function openInlineCategoryForm() {

    if (!inlineCategoryForm) {
        return;
    }


    /*
     * Show the form.
     *
     * It is physically located directly
     * below the category dropdown in HTML.
     */

    inlineCategoryForm.classList.remove(
        "hidden"
    );


    /*
     * Clear old message.
     */

    if (inlineCategoryMessage) {

        inlineCategoryMessage.textContent =
            "";

    }


    /*
     * Focus category name.
     *
     * preventScroll is intentional.
     *
     * It prevents the page from jumping.
     */

    setTimeout(
        function () {

            if (inlineCategoryName) {

                inlineCategoryName.focus({
                    preventScroll: true
                });

            }

        },
        50
    );

}


/* =========================================================
   CLOSE INLINE CATEGORY FORM
========================================================= */

function closeInlineCategoryForm() {

    if (inlineCategoryForm) {

        inlineCategoryForm.classList.add(
            "hidden"
        );

    }


    if (inlineCategoryName) {

        inlineCategoryName.value =
            "";

    }


    if (inlineCategoryDescription) {

        inlineCategoryDescription.value =
            "";

    }


    if (inlineCategoryMessage) {

        inlineCategoryMessage.textContent =
            "";

    }


    /*
     * Reset dropdown
     */

    if (categorySelect) {

        categorySelect.value =
            "";

    }

}


/* =========================================================
   CANCEL INLINE CATEGORY
========================================================= */

if (cancelInlineCategoryBtn) {

    cancelInlineCategoryBtn.addEventListener(
        "click",
        function () {

            closeInlineCategoryForm();

        }
    );

}


/* =========================================================
   CLOSE INLINE CATEGORY X BUTTON
========================================================= */

if (closeInlineCategoryBtn) {

    closeInlineCategoryBtn.addEventListener(
        "click",
        function () {

            closeInlineCategoryForm();

        }
    );

}


/* =========================================================
   SAVE INLINE CATEGORY
========================================================= */

if (saveInlineCategoryBtn) {

    saveInlineCategoryBtn.addEventListener(
        "click",
        async function () {

            const name =
                inlineCategoryName.value.trim();


            const description =
                inlineCategoryDescription.value.trim();


            /*
             * Validate category name
             */

            if (!name) {

                inlineCategoryMessage.textContent =
                    "Please enter a category name.";

                inlineCategoryName.focus();

                return;

            }


            /*
             * Disable button
             */

            saveInlineCategoryBtn.disabled =
                true;


            inlineCategoryMessage.textContent =
                "Adding category...";


            try {

                /*
                 * Send category to backend
                 */

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


                /*
                 * Check response
                 */

                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Failed to add category."
                    );

                }


                /*
                 * Try to get new category ID
                 */

                const newCategoryId =
                    data.category?.id ||
                    data.category_id ||
                    data.id ||
                    null;


                /*
                 * Success message
                 */

                inlineCategoryMessage.textContent =
                    data.message ||
                    "Category added successfully.";


                /*
                 * Reload categories.
                 *
                 * This makes the new category
                 * immediately available in
                 * the product dropdown.
                 */

                await loadCategories(
                    newCategoryId
                );


                /*
                 * Close form after successful
                 * creation.
                 */

                setTimeout(
                    function () {

                        closeInlineCategoryForm();

                    },
                    500
                );


            } catch (error) {

                console.error(
                    "ADD CATEGORY ERROR:",
                    error
                );


                inlineCategoryMessage.textContent =
                    error.message;

            } finally {

                saveInlineCategoryBtn.disabled =
                    false;

            }

        }
    );

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
                ${escapeHTML(
                    error.message
                )}
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
                            product.price || 0
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


            const nameInput =
                document.getElementById(
                    "name"
                );


            const descriptionInput =
                document.getElementById(
                    "description"
                );


            const priceInput =
                document.getElementById(
                    "price"
                );


            const stockInput =
                document.getElementById(
                    "stock"
                );


            const name =
                nameInput.value.trim();


            const description =
                descriptionInput.value.trim();


            const categoryId =
                categorySelect.value;


            const price =
                priceInput.value;


            const stock =
                stockInput.value;


            /*
             * Validate name
             */

            if (!name) {

                productMessage.textContent =
                    "Product name is required.";

                nameInput.focus();

                return;

            }


            /*
             * Prevent special category option
             * from being submitted.
             */

            if (
                !categoryId ||
                categoryId ===
                "__add_category__"
            ) {

                productMessage.textContent =
                    "Please select a category.";

                categorySelect.focus();

                return;

            }


            /*
             * Validate price
             */

            if (
                !price ||
                Number(price) <= 0
            ) {

                productMessage.textContent =
                    "Price must be greater than 0.";

                priceInput.focus();

                return;

            }


            /*
             * Validate stock
             */

            if (
                stock === "" ||
                Number(stock) < 0
            ) {

                productMessage.textContent =
                    "Stock cannot be negative.";

                stockInput.focus();

                return;

            }


            /*
             * Product data
             */

            const productData = {

                name:
                    name,

                description:
                    description || null,

                category_id:
                    Number(categoryId),

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
                            method:
                                method,

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


        /*
         * Make sure categories are loaded.
         */

        await loadCategories(
            product.category_id
        );


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
         * Product editing can scroll to
         * the product form.
         *
         * This is NOT used for categories.
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


    /*
     * Close inline category form
     * when product form is reset.
     */

    closeInlineCategoryForm();

}


/* =========================================================
   REFRESH PRODUCTS
========================================================= */

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        async function () {

            await loadCategories();

            await loadProducts();

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