// =========================================================
// PRODUCTS PAGE
// =========================================================


// =========================================================
// VARIABLES
// =========================================================

const categoryProductsContainer =
    document.getElementById("category-products");

const productModal =
    document.getElementById("product-modal");

const modalClose =
    document.getElementById("modal-close");

const modalImage =
    document.getElementById("modal-image");

const modalCategory =
    document.getElementById("modal-category");

const modalName =
    document.getElementById("modal-name");

const modalPrice =
    document.getElementById("modal-price");

const modalDescription =
    document.getElementById("modal-description");

const modalStock =
    document.getElementById("modal-stock");

const modalAddCart =
    document.getElementById("modal-add-cart");


// Currently opened product
let selectedProduct = null;


// =========================================================
// LOAD PRODUCTS
// =========================================================

async function loadProducts() {

    try {

        const response =
            await fetch("/api/products");

        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message ||
                "Failed to load products."
            );

        }


        const products =
            data.products || [];


        if (products.length === 0) {

            categoryProductsContainer.innerHTML = `

                <div class="no-products">

                    <h2>
                        No Products Available
                    </h2>

                    <p>
                        Products added by the administrator
                        will appear here.
                    </p>

                </div>

            `;

            return;

        }


        displayProductsByCategory(products);


    } catch (error) {

        console.error(
            "Products loading error:",
            error
        );


        categoryProductsContainer.innerHTML = `

            <div class="products-error">

                <h2>
                    Unable to load products
                </h2>

                <p>
                    Please try again later.
                </p>

            </div>

        `;

    }

}


// =========================================================
// GROUP PRODUCTS BY CATEGORY
// =========================================================

function groupProductsByCategory(products) {

    const grouped = {};


    products.forEach(product => {

        const category =
            product.category_name ||
            "Other";


        if (!grouped[category]) {

            grouped[category] = [];

        }


        grouped[category].push(product);

    });


    return grouped;

}


// =========================================================
// DISPLAY PRODUCTS BY CATEGORY
// =========================================================

function displayProductsByCategory(products) {

    const groupedProducts =
        groupProductsByCategory(products);


    categoryProductsContainer.innerHTML = "";


    Object.keys(groupedProducts)
        .forEach(categoryName => {


            const products =
                groupedProducts[categoryName];


            // =============================================
            // CATEGORY SECTION
            // =============================================

            const categorySection =
                document.createElement("section");


            categorySection.className =
                "product-category-section";


            // =============================================
            // CATEGORY HEADER
            // =============================================

            const categoryHeader =
                document.createElement("div");


            categoryHeader.className =
                "category-header";


            categoryHeader.innerHTML = `

                <div>

                    <p class="section-label">
                        CATEGORY
                    </p>

                    <h2>
                        ${escapeHTML(categoryName)}
                    </h2>

                </div>

                <span class="category-count">
                    ${products.length}
                    ${products.length === 1
                        ? "Product"
                        : "Products"}
                </span>

            `;


            categorySection.appendChild(
                categoryHeader
            );


            // =============================================
            // PRODUCT GRID
            // =============================================

            const productGrid =
                document.createElement("div");


            productGrid.className =
                "product-grid";


            products.forEach(
                (product, index) => {

                    const card =
                        createProductCard(
                            product,
                            index
                        );


                    productGrid.appendChild(card);

                }
            );


            categorySection.appendChild(
                productGrid
            );


            categoryProductsContainer.appendChild(
                categorySection
            );

        });

}


// =========================================================
// CREATE PRODUCT CARD
// =========================================================

function createProductCard(product, index) {

    const card =
        document.createElement("article");


    card.className =
        "product-card";


    card.dataset.productId =
        product.id;


    const image =
        product.image ||
        product.image_url ||
        "";


    const imageHTML = image

        ? `
            <img
                src="${escapeAttribute(image)}"
                alt="${escapeAttribute(product.name)}"
            >
          `

        : `
            <div class="product-placeholder">
                🛍️
            </div>
          `;


    card.innerHTML = `

        <div class="product-image">

            ${imageHTML}

            <span class="ar-badge">
                AR
            </span>

        </div>


        <div class="product-info">

            <p class="category">
                ${escapeHTML(
                    product.category_name ||
                    "Other"
                )}
            </p>


            <h3>
                ${escapeHTML(product.name)}
            </h3>


            <p class="product-description">

                ${escapeHTML(
                    product.description ||
                    "No description available."
                )}

            </p>


            <div class="product-bottom">

                <strong>
                    $${Number(product.price).toFixed(2)}
                </strong>


                <button
                    class="add-btn"
                    data-product-action="cart"
                    type="button"
                >
                    Add to Cart
                </button>

            </div>

        </div>

    `;


    // =====================================================
    // ADD TO CART
    // =====================================================

    const addButton =
        card.querySelector(
            "[data-product-action='cart']"
        );


    addButton.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();


            addProductToCart(
                product,
                this
            );

        }
    );


    // =====================================================
    // OPEN PRODUCT DETAILS
    // =====================================================

    card.addEventListener(
        "click",
        function() {

            openProductDetails(product);

        }
    );


    return card;

}


// =========================================================
// ADD PRODUCT TO CART
// =========================================================

function addProductToCart(product, button) {

    // Make sure cart exists
    if (!window.cart) {

        window.cart = [];

    }


    // Product object for cart
    const cartProduct = {

        id: product.id,

        name: product.name,

        price: Number(product.price),

        description:
            product.description || "",

        image:
            product.image ||
            product.image_url ||
            "",

        category:
            product.category_name ||
            "Other"

    };


    // Check existing product
    const existingItem =
        window.cart.find(
            item =>
                String(item.id) ===
                String(cartProduct.id)
        );


    if (existingItem) {

        existingItem.quantity += 1;

    } else {

        window.cart.push({

            ...cartProduct,

            quantity: 1

        });

    }


    // Save cart
    localStorage.setItem(
        "ar_ecommerce_cart",
        JSON.stringify(window.cart)
    );


    // Update common cart
    if (
        typeof updateCart ===
        "function"
    ) {

        updateCart();

    }


    // Update cart count
    updateProductsCartCount();


    // Button feedback
    if (button) {

        const originalText =
            button.textContent;


        button.textContent =
            "Added ✓";


        button.classList.add(
            "added"
        );


        button.disabled = true;


        setTimeout(() => {

            button.textContent =
                originalText;

            button.classList.remove(
                "added"
            );

            button.disabled = false;

        }, 1200);

    }

}


// =========================================================
// UPDATE CART COUNT
// =========================================================

function updateProductsCartCount() {

    const cartCount =
        document.getElementById(
            "cart-count"
        );


    if (!cartCount) {

        return;

    }


    const savedCart =
        localStorage.getItem(
            "ar_ecommerce_cart"
        );


    if (!savedCart) {

        cartCount.textContent =
            "0";

        return;

    }


    try {

        const savedItems =
            JSON.parse(savedCart);


        const count =
            savedItems.reduce(
                (total, item) =>
                    total +
                    Number(item.quantity || 0),
                0
            );


        cartCount.textContent =
            count;


    } catch (error) {

        cartCount.textContent =
            "0";

    }

}


// =========================================================
// PRODUCT DETAILS MODAL
// =========================================================

function openProductDetails(product) {

    selectedProduct =
        product;


    const image =
        product.image ||
        product.image_url ||
        "";


    if (image) {

        modalImage.src =
            image;

        modalImage.style.display =
            "block";

    } else {

        modalImage.style.display =
            "none";

    }


    modalCategory.textContent =
        product.category_name ||
        "Other";


    modalName.textContent =
        product.name;


    modalPrice.textContent =
        `$${Number(product.price).toFixed(2)}`;


    modalDescription.textContent =
        product.description ||
        "No description available.";


    const stock =
        Number(product.stock || 0);


    if (stock > 0) {

        modalStock.textContent =
            `In Stock: ${stock}`;


        modalStock.className =
            "modal-stock in-stock";


        modalAddCart.disabled =
            false;

    } else {

        modalStock.textContent =
            "Out of Stock";


        modalStock.className =
            "modal-stock out-of-stock";


        modalAddCart.disabled =
            true;

    }


    productModal.classList.add(
        "active"
    );

}


// =========================================================
// MODAL ADD TO CART
// =========================================================

if (modalAddCart) {

    modalAddCart.addEventListener(
        "click",
        function() {

            if (!selectedProduct) {

                return;

            }


            addProductToCart(
                selectedProduct,
                this
            );

        }
    );

}


// =========================================================
// CLOSE PRODUCT MODAL
// =========================================================

if (modalClose) {

    modalClose.addEventListener(
        "click",
        function() {

            productModal.classList.remove(
                "active"
            );

        }
    );

}


// Close clicking background

if (productModal) {

    productModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                productModal
            ) {

                productModal.classList.remove(
                    "active"
                );

            }

        }
    );

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function escapeAttribute(value) {

    return escapeHTML(value);

}


// =========================================================
// INITIAL LOAD
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadProducts();

        updateProductsCartCount();

    }
);