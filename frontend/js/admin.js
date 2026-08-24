const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");

const loginForm = document.getElementById("loginForm");
const adminTokenInput = document.getElementById("adminToken");
const loginMessage = document.getElementById("loginMessage");

const productForm = document.getElementById("productForm");
const productMessage = document.getElementById("productMessage");

const categorySelect = document.getElementById("category");
const productsContainer = document.getElementById("productsContainer");

const imageInput = document.getElementById("image");
const imagePreview = document.getElementById("imagePreview");

const productIdInput = document.getElementById("productId");
const formTitle = document.getElementById("formTitle");

const cancelBtn = document.getElementById("cancelBtn");
const refreshBtn = document.getElementById("refreshBtn");
const logoutBtn = document.getElementById("logoutBtn");


/* =========================================
   ADMIN TOKEN
========================================= */

let adminToken = localStorage.getItem("adminToken");


/* =========================================
   INITIAL PAGE
========================================= */

if (adminToken) {
    showDashboard();
}


/* =========================================
   LOGIN
========================================= */

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const token = adminTokenInput.value.trim();

    if (!token) {
        loginMessage.textContent = "Please enter your admin token.";
        return;
    }

    try {

        loginMessage.textContent = "Checking token...";

        const response = await fetch("/api/admin/products", {
            method: "GET",
            headers: {
                "x-admin-token": token
            }
        });

        const data = await response.json();

        if (!response.ok) {

            loginMessage.textContent =
                data.message || "Invalid admin token.";

            return;
        }

        localStorage.setItem("adminToken", token);

        adminToken = token;

        loginMessage.textContent = "";

        showDashboard();

    } catch (error) {

        console.error("LOGIN ERROR:", error);

        loginMessage.textContent =
            "Unable to connect to server.";
    }

});


/* =========================================
   SHOW DASHBOARD
========================================= */

async function showDashboard() {

    loginSection.classList.add("hidden");

    dashboardSection.classList.remove("hidden");

    logoutBtn.style.display = "block";

    await loadCategories();

    await loadProducts();
}


/* =========================================
   LOAD CATEGORIES
========================================= */

async function loadCategories() {

    try {

        const response = await fetch(
            "/api/products/categories"
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Failed to load categories"
            );
        }

        categorySelect.innerHTML = `
            <option value="">
                Select Category
            </option>
        `;

        data.categories.forEach(function (category) {

            const option =
                document.createElement("option");

            option.value = category.id;
            option.textContent = category.name;

            categorySelect.appendChild(option);

        });

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


/* =========================================
   LOAD PRODUCTS
========================================= */

async function loadProducts() {

    try {

        productsContainer.innerHTML =
            "<p>Loading products...</p>";

        const response = await fetch(
            "/api/admin/products",
            {
                headers: {
                    "x-admin-token": adminToken
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load products"
            );
        }

        displayProducts(data.products);

    } catch (error) {

        console.error(
            "PRODUCT LOAD ERROR:",
            error
        );

        productsContainer.innerHTML =
            `<p>${escapeHTML(error.message)}</p>`;
    }
}


/* =========================================
   DISPLAY PRODUCTS
========================================= */

function displayProducts(products) {

    if (!products || products.length === 0) {

        productsContainer.innerHTML =
            "<p>No products found.</p>";

        return;
    }

    productsContainer.innerHTML = "";

    products.forEach(function (product) {

        const card =
            document.createElement("div");

        card.className = "product-card";

        card.innerHTML = `

            <div class="product-card-content">

                <h3>
                    ${escapeHTML(product.name)}
                </h3>

                <p>
                    ${escapeHTML(
                        product.description || ""
                    )}
                </p>

                <p>
                    <strong>Price:</strong>
                    Rs. ${Number(product.price).toFixed(2)}
                </p>

                <p>
                    <strong>Category:</strong>
                    ${escapeHTML(
                        product.category_name || ""
                    )}
                </p>

                <p>
                    <strong>Stock:</strong>
                    ${product.stock}
                </p>

                <p>
                    <strong>Available:</strong>
                    ${
                        Number(product.is_available) === 1
                            ? "Yes"
                            : "No"
                    }
                </p>

                <div class="product-actions">

                    <button
                        class="edit-btn"
                        onclick="editProduct(${product.id})"
                    >
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteProduct(${product.id})"
                    >
                        Delete
                    </button>

                </div>

            </div>
        `;

        productsContainer.appendChild(card);

    });
}


/* =========================================
   ADD / UPDATE PRODUCT
========================================= */

productForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const productId =
            productIdInput.value;

        const name =
            document.getElementById("name")
                .value.trim();

        const description =
            document.getElementById("description")
                .value.trim();

        const category_id =
            categorySelect.value;

        const price =
            document.getElementById("price")
                .value;

        const stock =
            document.getElementById("stock")
                .value;


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

        if (!price || Number(price) <= 0) {

            productMessage.textContent =
                "Price must be greater than 0.";

            return;
        }

        if (Number(stock) < 0) {

            productMessage.textContent =
                "Stock cannot be negative.";

            return;
        }


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


            const url = productId
                ? `/api/admin/products/${productId}`
                : "/api/admin/products";


            const method = productId
                ? "PUT"
                : "POST";


            const response = await fetch(
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
                        JSON.stringify(productData)
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to save product"
                );
            }


            productMessage.textContent =
                data.message;


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


/* =========================================
   EDIT PRODUCT
========================================= */

async function editProduct(id) {

    try {

        const response = await fetch(
            `/api/admin/products/${id}`,
            {
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
                "Failed to load product"
            );
        }


        const product =
            data.product;


        productIdInput.value =
            product.id;

        document.getElementById("name").value =
            product.name;

        document.getElementById("description").value =
            product.description || "";

        categorySelect.value =
            product.category_id;

        document.getElementById("price").value =
            product.price;

        document.getElementById("stock").value =
            product.stock;


        formTitle.textContent =
            "Edit Product";


        imagePreview.innerHTML = "";


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


    } catch (error) {

        console.error(
            "EDIT PRODUCT ERROR:",
            error
        );

        alert(error.message);
    }
}


/* =========================================
   DELETE PRODUCT
========================================= */

async function deleteProduct(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this product?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
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
                "Failed to delete product"
            );
        }


        alert(data.message);

        await loadProducts();


    } catch (error) {

        console.error(
            "DELETE PRODUCT ERROR:",
            error
        );

        alert(error.message);
    }
}


/* =========================================
   IMAGE PREVIEW ONLY
========================================= */

imageInput.addEventListener(
    "change",
    function () {

        const file =
            imageInput.files[0];


        if (!file) {

            imagePreview.innerHTML = "";

            return;
        }


        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ];


        if (!allowedTypes.includes(file.type)) {

            alert(
                "Only JPG, PNG, WEBP and GIF images are allowed."
            );

            imageInput.value = "";

            imagePreview.innerHTML = "";

            return;
        }


        if (file.size > 5 * 1024 * 1024) {

            alert(
                "Image must be smaller than 5 MB."
            );

            imageInput.value = "";

            imagePreview.innerHTML = "";

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


/* =========================================
   CANCEL / RESET
========================================= */

cancelBtn.addEventListener(
    "click",
    function () {

        resetForm();

    }
);


function resetForm() {

    productForm.reset();

    productIdInput.value = "";

    formTitle.textContent =
        "Add Product";

    imagePreview.innerHTML = "";

    productMessage.textContent = "";

}


/* =========================================
   REFRESH
========================================= */

refreshBtn.addEventListener(
    "click",
    function () {

        loadProducts();

    }
);


/* =========================================
   LOGOUT
========================================= */

logoutBtn.addEventListener(
    "click",
    function () {

        localStorage.removeItem(
            "adminToken"
        );

        adminToken = null;

        dashboardSection.classList.add(
            "hidden"
        );

        loginSection.classList.remove(
            "hidden"
        );

        adminTokenInput.value = "";

        resetForm();

    }
);


/* =========================================
   HTML ESCAPE
========================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}