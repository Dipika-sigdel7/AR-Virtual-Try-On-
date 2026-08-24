// =========================================================
// PRODUCTS PAGE
// DYNAMIC CATEGORIES + PRODUCTS
// =========================================================


// =========================================================
// CATEGORY CONTAINER
// =========================================================

const categoriesContainer =
    document.getElementById("categories-container");


// =========================================================
// LOAD PRODUCTS
// =========================================================

async function loadProducts() {

    try {

        categoriesContainer.innerHTML = `
            <div class="loading-products">
                Loading products...
            </div>
        `;


        // -------------------------------------------------
        // GET PRODUCTS FROM BACKEND
        // -------------------------------------------------

        const response =
            await fetch("/api/products");


        const data =
            await response.json();


        console.log("Products API:", data);


        if (!data.success) {

            categoriesContainer.innerHTML = `
                <div class="products-message">
                    Failed to load products.
                </div>
            `;

            return;
        }


        // -------------------------------------------------
        // PRODUCTS
        // -------------------------------------------------

        const productsList =
            data.products || [];


        // -------------------------------------------------
        // NO PRODUCTS AT ALL
        // -------------------------------------------------

        if (productsList.length === 0) {

            categoriesContainer.innerHTML = `
                <div class="products-message">
                    No products available.
                </div>
            `;

            return;
        }


        // -------------------------------------------------
        // GROUP PRODUCTS BY CATEGORY
        // -------------------------------------------------

        const categories = {};


        productsList.forEach(product => {

            const categoryName =
                product.category_name ||
                product.category ||
                "Uncategorized";


            if (!categories[categoryName]) {

                categories[categoryName] = [];

            }


            categories[categoryName].push(product);

        });


        // -------------------------------------------------
        // DISPLAY CATEGORIES
        // -------------------------------------------------

        categoriesContainer.innerHTML = "";


        Object.keys(categories).forEach(
            categoryName => {

                const products =
                    categories[categoryName];


                const categorySection =
                    document.createElement("section");


                categorySection.className =
                    "category-section";


                // =================================================
                // CATEGORY HEADER
                // =================================================

                categorySection.innerHTML = `

                    <div class="category-heading">

                        <div>

                            <p class="section-label">
                                CATEGORY
                            </p>

                            <h2>
                                ${escapeHTML(categoryName)}
                            </h2>

                        </div>

                    </div>

                `;


                // =================================================
                // PRODUCT GRID
                // =================================================

                const productGrid =
                    document.createElement("div");


                productGrid.className =
                    "product-grid";


                // -------------------------------------------------
                // CATEGORY HAS NO PRODUCTS
                // -------------------------------------------------

                if (products.length === 0) {

                    productGrid.innerHTML = `

                        <div class="no-category-products">

                            <div class="no-products-icon">
                                🛍️
                            </div>

                            <h3>
                                No products in this category.
                            </h3>

                            <p>
                                Products added by the admin
                                will appear here.
                            </p>

                        </div>

                    `;

                }


                // -------------------------------------------------
                // CREATE PRODUCT CARDS
                // -------------------------------------------------

                products.forEach(product => {

                    productGrid.appendChild(
                        createProductCard(product)
                    );

                });


                categorySection.appendChild(
                    productGrid
                );


                categoriesContainer.appendChild(
                    categorySection
                );

            }
        );


        // -------------------------------------------------
        // CONNECT ADD TO CART BUTTONS
        // -------------------------------------------------

        connectCartButtons();

    }

    catch (error) {

        console.error(
            "Failed to load products:",
            error
        );


        categoriesContainer.innerHTML = `

            <div class="products-message">

                Unable to load products.

            </div>

        `;

    }

}


// =========================================================
// CREATE PRODUCT CARD
// =========================================================

function createProductCard(product) {

    const card =
        document.createElement("div");


    card.className =
        "product-card";


    card.setAttribute(
        "data-product",
        product.id
    );


    // -------------------------------------------------
    // IMAGE
    // -------------------------------------------------

    let imageHTML = "🛍️";


    if (product.image) {

        imageHTML = `

            <img
                src="${escapeAttribute(product.image)}"
                alt="${escapeAttribute(product.name)}"
            >

        `;

    }


    // -------------------------------------------------
    // STOCK
    // -------------------------------------------------

    const stock =
        Number(product.stock || 0);


    const outOfStock =
        stock <= 0;


    // -------------------------------------------------
    // CARD
    // -------------------------------------------------

    card.innerHTML = `

        <div class="product-image">

            <span class="product-emoji">

                ${imageHTML}

            </span>

            <span class="ar-badge">
                AR
            </span>

        </div>


        <div class="product-info">

            <p class="category">

                ${escapeHTML(
                    product.category_name ||
                    product.category ||
                    "Uncategorized"
                )}

            </p>


            <h3>

                ${escapeHTML(
                    product.name
                )}

            </h3>


            <p class="product-description">

                ${escapeHTML(
                    product.description || ""
                )}

            </p>


            <div class="product-bottom">

                <strong>

                    $${Number(
                        product.price
                    ).toFixed(2)}

                </strong>


                ${
                    outOfStock

                    ?

                    `
                    <button
                        class="add-btn out-of-stock"
                        type="button"
                        disabled
                    >
                        Out of Stock
                    </button>
                    `

                    :

                    `
                    <button
                        class="add-btn"
                        data-product-action="cart"
                        type="button"
                    >
                        Add to Cart
                    </button>
                    `
                }

            </div>

        </div>

    `;


    return card;

}


// =========================================================
// CONNECT CART BUTTONS
// SAME SYSTEM AS HOME PAGE
// =========================================================

function connectCartButtons() {

    const addButtons =
        document.querySelectorAll(
            "[data-product-action='cart']"
        );


    addButtons.forEach(button => {

        button.addEventListener(
            "click",
            function(event) {

                event.stopPropagation();


                const card =
                    this.closest(".product-card");


                if (!card) {
                    return;
                }


                const productId =
                    card.getAttribute(
                        "data-product"
                    );


                if (!productId) {
                    return;
                }


                // -------------------------------------------------
                // FIND PRODUCT
                // -------------------------------------------------

                const product =
                    window.productsById?.[productId];


                if (!product) {

                    console.error(
                        "Product not found:",
                        productId
                    );

                    return;

                }


                // -------------------------------------------------
                // EXISTING CART ITEM
                // -------------------------------------------------

                const existingItem =
                    window.cart.find(
                        item =>
                            String(item.id) ===
                            String(product.id)
                    );


                if (existingItem) {

                    existingItem.quantity += 1;

                }

                else {

                    window.cart.push({

                        ...product,

                        quantity: 1

                    });

                }


                // -------------------------------------------------
                // UPDATE CART
                // -------------------------------------------------

                if (
                    typeof window.updateCart ===
                    "function"
                ) {

                    window.updateCart();

                }


                // -------------------------------------------------
                // BUTTON FEEDBACK
                // -------------------------------------------------

                const originalText =
                    this.textContent;


                this.textContent =
                    "Added ✓";


                this.classList.add(
                    "added"
                );


                this.disabled = true;


                setTimeout(() => {

                    this.textContent =
                        originalText;

                    this.classList.remove(
                        "added"
                    );

                    this.disabled = false;

                }, 1200);

            }
        );

    });

}


// =========================================================
// HTML ESCAPE
// =========================================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


function escapeAttribute(value) {

    return String(
        value ?? ""
    )
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

}


// =========================================================
// LOAD PRODUCTS
// =========================================================

loadProducts();