// =========================================================
// AR ECOMMERCE
// MAIN APP JAVASCRIPT
// =========================================================


// =========================================================
// PRODUCT DATA
// =========================================================

let products = {};


// =========================================================
// CART
// =========================================================

let cart = [];


// =========================================================
// LOAD CART FROM LOCAL STORAGE
// =========================================================

try {

    const savedCart =
        localStorage.getItem("ar_ecommerce_cart");

    if (savedCart) {

        cart = JSON.parse(savedCart);

        if (!Array.isArray(cart)) {
            cart = [];
        }

    }

} catch (error) {

    console.error(
        "Failed to load cart:",
        error
    );

    cart = [];

}


// =========================================================
// ELEMENTS
// =========================================================

const productModal =
    document.querySelector("#product-modal");

const modalClose =
    document.querySelector("#modal-close");

const modalProductImage =
    document.querySelector("#modal-product-image");

const modalProductName =
    document.querySelector("#modal-product-name");

const modalProductCategory =
    document.querySelector("#modal-product-category");

const modalProductPrice =
    document.querySelector("#modal-product-price");

const modalRating =
    document.querySelector("#modal-rating");


// =========================================================
// CART ELEMENTS
// =========================================================

const cartButton =
    document.querySelector("#cart-btn");

const cartCount =
    document.querySelector("#cart-count");

const cartModal =
    document.querySelector("#cart-modal");

const cartClose =
    document.querySelector("#cart-close");

const cartItems =
    document.querySelector("#cart-items");

const cartTotal =
    document.querySelector("#cart-total");

const checkoutButton =
    document.querySelector("#checkout-btn");


// =========================================================
// SAVE CART
// =========================================================

function saveCart() {

    try {

        localStorage.setItem(
            "ar_ecommerce_cart",
            JSON.stringify(cart)
        );

    } catch (error) {

        console.error(
            "Failed to save cart:",
            error
        );

    }

}


// =========================================================
// LOAD PRODUCTS FROM BACKEND
// =========================================================

async function loadProducts() {

    try {

        const response =
            await fetch("/api/products");

        const data =
            await response.json();

        console.log(
            "PRODUCT API RESPONSE:",
            data
        );


        // -----------------------------------------
        // CHECK RESPONSE
        // -----------------------------------------

        if (!response.ok) {

            console.error(
                "Products API error:",
                data
            );

            return;

        }


        // -----------------------------------------
        // SUPPORT DIFFERENT API FORMATS
        // -----------------------------------------

        let productList = [];


        if (Array.isArray(data)) {

            productList = data;

        }

        else if (
            data.products &&
            Array.isArray(data.products)
        ) {

            productList =
                data.products;

        }

        else if (
            data.data &&
            Array.isArray(data.data)
        ) {

            productList =
                data.data;

        }


        // -----------------------------------------
        // CONVERT ARRAY TO PRODUCT OBJECT
        // -----------------------------------------

        products = {};


        productList.forEach(
            (product) => {

                const id =
                    product.id;


                if (!id) {
                    return;
                }


                products[String(id)] = {

                    id:
                        Number(product.id),

                    name:
                        product.name ||
                        product.product_name ||
                        "Unnamed Product",

                    category:
                        product.category_name ||
                        product.category ||
                        "Uncategorized",

                    price:
                        Number(
                            product.price || 0
                        ),

                    image:
                        product.image ||
                        product.image_url ||
                        product.emoji ||
                        "🛍️",

                    description:
                        product.description ||
                        "",

                    rating:
                        product.rating ||
                        "No rating"

                };

            }
        );


        console.log(
            "PRODUCTS LOADED:",
            products
        );


        // -----------------------------------------
        // RENDER PRODUCTS
        // -----------------------------------------

        renderProducts(
            productList
        );


        // -----------------------------------------
        // INITIALIZE CART BUTTONS
        // -----------------------------------------

        initializeCartButtons();


        // -----------------------------------------
        // UPDATE CART
        // -----------------------------------------

        updateCart();

    }

    catch (error) {

        console.error(
            "Failed to load products:",
            error
        );

    }

}


// =========================================================
// RENDER PRODUCTS
// =========================================================

function renderProducts(productList) {

    const grids =
        document.querySelectorAll(
            ".product-grid"
        );


    if (!grids.length) {
        return;
    }


    grids.forEach(
        (grid) => {

            // -------------------------------------
            // DO NOT REPLACE ADMIN PRODUCT LISTS
            // -------------------------------------

            if (
                grid.closest(
                    ".admin-section"
                )
            ) {

                return;

            }


            grid.innerHTML = "";


            // -------------------------------------
            // NO PRODUCTS
            // -------------------------------------

            if (
                !productList ||
                productList.length === 0
            ) {

                grid.innerHTML = `
                    <div class="no-products">
                        <h3>No products available</h3>

                        <p>
                            There are currently no products
                            available.
                        </p>
                    </div>
                `;

                return;

            }


            // -------------------------------------
            // CREATE PRODUCT CARDS
            // -------------------------------------

            productList.forEach(
                (product, index) => {

                    const id =
                        Number(product.id);


                    const name =
                        product.name ||
                        product.product_name ||
                        "Unnamed Product";


                    const category =
                        product.category_name ||
                        product.category ||
                        "Uncategorized";


                    const price =
                        Number(
                            product.price || 0
                        );


                    const image =
                        product.image ||
                        product.image_url ||
                        product.emoji ||
                        "🛍️";


                    const description =
                        product.description ||
                        "No description available.";


                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "product-card";


                    card.setAttribute(
                        "data-product",
                        String(id)
                    );


                    card.style.animationDelay =
                        `${index * 0.1}s`;


                    card.innerHTML = `

                        <div class="product-image">

                            <span class="product-emoji">
                                ${escapeHtml(image)}
                            </span>

                            <span class="ar-badge">
                                AR
                            </span>

                        </div>


                        <div class="product-info">

                            <p class="category">
                                ${escapeHtml(category)}
                            </p>


                            <h3>
                                ${escapeHtml(name)}
                            </h3>


                            <p class="product-description">
                                ${escapeHtml(description)}
                            </p>


                            <div class="product-bottom">

                                <strong>
                                    $${price.toFixed(2)}
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


                    grid.appendChild(
                        card
                    );

                }
            );


            initializeProductCards();

            initializeCartButtons();

        }
    );

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHtml(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


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


// =========================================================
// PRODUCT CARDS
// =========================================================

function initializeProductCards() {

    const productCards =
        document.querySelectorAll(
            ".product-card"
        );


    productCards.forEach(
        (card) => {

            // Prevent duplicate event listeners
            if (
                card.dataset.modalInitialized === "true"
            ) {

                return;

            }


            card.dataset.modalInitialized =
                "true";


            card.addEventListener(
                "click",
                (event) => {

                    // ---------------------------------
                    // DO NOT OPEN MODAL FOR CART BUTTON
                    // ---------------------------------

                    if (
                        event.target.closest(
                            "[data-product-action='cart']"
                        )
                    ) {

                        return;

                    }


                    // ---------------------------------
                    // PRODUCT ID
                    // ---------------------------------

                    const productId =
                        card.getAttribute(
                            "data-product"
                        );


                    if (!productId) {
                        return;
                    }


                    // ---------------------------------
                    // PRODUCT
                    // ---------------------------------

                    const product =
                        products[
                            String(productId)
                        ];


                    if (!product) {

                        console.error(
                            "Product not found:",
                            productId
                        );

                        return;

                    }


                    // ---------------------------------
                    // IMAGE
                    // ---------------------------------

                    if (modalProductImage) {

                        modalProductImage.textContent =
                            product.image;

                    }


                    // ---------------------------------
                    // NAME
                    // ---------------------------------

                    if (modalProductName) {

                        modalProductName.textContent =
                            product.name;

                    }


                    // ---------------------------------
                    // CATEGORY
                    // ---------------------------------

                    if (modalProductCategory) {

                        modalProductCategory.textContent =
                            product.category;

                    }


                    // ---------------------------------
                    // PRICE
                    // ---------------------------------

                    if (modalProductPrice) {

                        modalProductPrice.textContent =
                            `$${Number(
                                product.price
                            ).toFixed(2)}`;

                    }


                    // ---------------------------------
                    // RATING
                    // ---------------------------------

                    if (modalRating) {

                        modalRating.textContent =
                            product.rating;

                    }


                    // ---------------------------------
                    // OPEN MODAL
                    // ---------------------------------

                    if (productModal) {

                        productModal.classList.add(
                            "active"
                        );

                        document.body.style.overflow =
                            "hidden";

                    }

                }
            );

        }
    );

}


// =========================================================
// INITIALIZE ADD TO CART BUTTONS
// =========================================================

function initializeCartButtons() {

    const addButtons =
        document.querySelectorAll(
            "[data-product-action='cart']"
        );


    addButtons.forEach(
        (button) => {

            // Prevent duplicate listeners
            if (
                button.dataset.cartInitialized === "true"
            ) {

                return;

            }


            button.dataset.cartInitialized =
                "true";


            button.addEventListener(
                "click",
                (event) => {

                    event.preventDefault();

                    event.stopPropagation();


                    // ---------------------------------
                    // PRODUCT CARD
                    // ---------------------------------

                    const card =
                        button.closest(
                            ".product-card"
                        );


                    if (!card) {

                        console.error(
                            "Product card not found."
                        );

                        return;

                    }


                    // ---------------------------------
                    // PRODUCT ID
                    // ---------------------------------

                    const productId =
                        card.getAttribute(
                            "data-product"
                        );


                    if (!productId) {

                        console.error(
                            "Product ID missing."
                        );

                        return;

                    }


                    // ---------------------------------
                    // GET PRODUCT
                    // ---------------------------------

                    const product =
                        products[
                            String(productId)
                        ];


                    if (!product) {

                        console.error(
                            "Product not found:",
                            productId
                        );

                        return;

                    }


                    // ---------------------------------
                    // CHECK EXISTING PRODUCT
                    // ---------------------------------

                    const existingItem =
                        cart.find(
                            item =>
                                Number(item.id) ===
                                Number(product.id)
                        );


                    // ---------------------------------
                    // INCREASE QUANTITY
                    // ---------------------------------

                    if (existingItem) {

                        existingItem.quantity += 1;

                    }

                    // ---------------------------------
                    // ADD NEW PRODUCT
                    // ---------------------------------

                    else {

                        cart.push({

                            ...product,

                            quantity: 1

                        });

                    }


                    // ---------------------------------
                    // SAVE CART
                    // ---------------------------------

                    saveCart();


                    // ---------------------------------
                    // UPDATE CART
                    // ---------------------------------

                    updateCart();


                    // ---------------------------------
                    // BUTTON FEEDBACK
                    // ---------------------------------

                    showAddedFeedback(
                        button
                    );

                }
            );

        }
    );

}


// =========================================================
// ADD TO CART BUTTON FEEDBACK
// =========================================================

function showAddedFeedback(button) {

    if (!button) {
        return;
    }


    const originalText =
        button.textContent;


    button.textContent =
        "Added ✓";


    button.classList.add(
        "added"
    );


    button.disabled =
        true;


    setTimeout(
        () => {

            button.textContent =
                originalText;

            button.classList.remove(
                "added"
            );

            button.disabled =
                false;

        },
        1200
    );

}


// =========================================================
// UPDATE CART
// =========================================================

function updateCart() {

    // -----------------------------------------
    // SAVE
    // -----------------------------------------

    saveCart();


    // -----------------------------------------
    // TOTAL QUANTITY
    // -----------------------------------------

    const totalQuantity =
        cart.reduce(
            (sum, product) => {

                return (
                    sum +
                    Number(
                        product.quantity || 0
                    )
                );

            },
            0
        );


    // -----------------------------------------
    // NAVBAR COUNT
    // -----------------------------------------

    if (cartCount) {

        cartCount.textContent =
            totalQuantity;

    }


    // -----------------------------------------
    // EMPTY CART
    // -----------------------------------------

    if (cart.length === 0) {

        if (cartItems) {

            cartItems.innerHTML = `

                <div class="cart-empty">

                    <div
                        style="
                            font-size: 55px;
                            margin-bottom: 15px;
                        "
                    >
                        🛒
                    </div>

                    <p>
                        Your cart is empty.
                    </p>

                </div>

            `;

        }


        if (cartTotal) {

            cartTotal.textContent =
                "$0.00";

        }


        return;

    }


    // -----------------------------------------
    // CALCULATE TOTAL
    // -----------------------------------------

    const total =
        cart.reduce(
            (sum, product) => {

                return (
                    sum +
                    (
                        Number(
                            product.price || 0
                        ) *
                        Number(
                            product.quantity || 0
                        )
                    )
                );

            },
            0
        );


    // -----------------------------------------
    // SHOW TOTAL
    // -----------------------------------------

    if (cartTotal) {

        cartTotal.textContent =
            `$${total.toFixed(2)}`;

    }


    // -----------------------------------------
    // CART ITEMS
    // -----------------------------------------

    if (!cartItems) {
        return;
    }


    cartItems.innerHTML = "";


    cart.forEach(
        (product, index) => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "cart-item";


            item.innerHTML = `

                <div class="cart-item-image">
                    ${escapeHtml(
                        product.image ||
                        "🛍️"
                    )}
                </div>


                <div class="cart-item-info">

                    <h4>
                        ${escapeHtml(
                            product.name
                        )}
                    </h4>


                    <p>
                        ${escapeHtml(
                            product.category ||
                            "Uncategorized"
                        )}
                    </p>


                    <p>

                        $${Number(
                            product.price || 0
                        ).toFixed(2)}

                        ×

                        ${Number(
                            product.quantity || 0
                        )}

                    </p>

                </div>


                <button
                    class="remove-cart-item"
                    data-index="${index}"
                    type="button"
                >
                    Remove
                </button>

            `;


            cartItems.appendChild(
                item
            );

        }
    );


    // -----------------------------------------
    // REMOVE BUTTONS
    // -----------------------------------------

    const removeButtons =
        cartItems.querySelectorAll(
            ".remove-cart-item"
        );


    removeButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const index =
                        Number(
                            button.getAttribute(
                                "data-index"
                            )
                        );


                    if (
                        Number.isInteger(index)
                    ) {

                        cart.splice(
                            index,
                            1
                        );

                    }


                    saveCart();

                    updateCart();

                }
            );

        }
    );

}


// =========================================================
// OPEN PRODUCT MODAL
// =========================================================

function closeProductModal() {

    if (productModal) {

        productModal.classList.remove(
            "active"
        );

    }

    document.body.style.overflow =
        "";

}


if (modalClose) {

    modalClose.addEventListener(
        "click",
        closeProductModal
    );

}


if (productModal) {

    productModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                productModal
            ) {

                closeProductModal();

            }

        }
    );

}


// =========================================================
// OPEN CART
// =========================================================

if (cartButton) {

    cartButton.addEventListener(
        "click",
        () => {

            updateCart();


            if (cartModal) {

                cartModal.classList.add(
                    "active"
                );

                document.body.style.overflow =
                    "hidden";

            }

        }
    );

}


// =========================================================
// CLOSE CART
// =========================================================

function closeCartModal() {

    if (cartModal) {

        cartModal.classList.remove(
            "active"
        );

    }


    document.body.style.overflow =
        "";

}


if (cartClose) {

    cartClose.addEventListener(
        "click",
        closeCartModal
    );

}


// =========================================================
// CLICK OUTSIDE CART
// =========================================================

if (cartModal) {

    cartModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                cartModal
            ) {

                closeCartModal();

            }

        }
    );

}


// =========================================================
// ESCAPE KEY
// =========================================================

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key ===
            "Escape"
        ) {

            closeProductModal();

            closeCartModal();

        }

    }
);


// =========================================================
// EXPLORE PRODUCTS
// =========================================================

const exploreProducts =
    document.querySelector(
        "#explore-products"
    );


if (exploreProducts) {

    exploreProducts.addEventListener(
        "click",
        () => {

            const productsSection =
                document.querySelector(
                    "#products"
                );


            if (productsSection) {

                productsSection.scrollIntoView({
                    behavior: "smooth"
                });

            }

        }
    );

}


// =========================================================
// TRY AR
// =========================================================

const tryArButton =
    document.querySelector(
        "#try-ar-btn"
    );


if (tryArButton) {

    tryArButton.addEventListener(
        "click",
        () => {

            const productsSection =
                document.querySelector(
                    "#products"
                );


            if (productsSection) {

                productsSection.scrollIntoView({
                    behavior: "smooth"
                });

            }

        }
    );

}


// =========================================================
// VIEW ALL
// =========================================================

const viewAllButton =
    document.querySelector(
        "#view-all"
    );


if (viewAllButton) {

    viewAllButton.addEventListener(
        "click",
        () => {

            window.location.href =
                "/products";

        }
    );

}


// =========================================================
// CHECKOUT
// =========================================================

if (checkoutButton) {

    checkoutButton.addEventListener(
        "click",
        async () => {

            // -------------------------------------
            // CHECK EMPTY CART
            // -------------------------------------

            if (cart.length === 0) {

                alert(
                    "Your cart is empty."
                );

                return;

            }


            // -------------------------------------
            // USER ID
            // -------------------------------------

            const userId =
                localStorage.getItem(
                    "user_id"
                );


            if (!userId) {

                alert(
                    "Please login before checkout."
                );

                return;

            }


            // -------------------------------------
            // SHIPPING ADDRESS
            // -------------------------------------

            const shippingAddress =
                prompt(
                    "Enter your shipping address:"
                );


            if (!shippingAddress) {

                alert(
                    "Shipping address is required."
                );

                return;

            }


            // -------------------------------------
            // PREPARE ITEMS
            // -------------------------------------

            const items =
                cart.map(
                    (product) => {

                        return {

                            product_id:
                                Number(
                                    product.id
                                ),

                            quantity:
                                Number(
                                    product.quantity
                                )

                        };

                    }
                );


            try {

                // ---------------------------------
                // CHECKOUT REQUEST
                // ---------------------------------

                const response =
                    await fetch(
                        "/api/products/checkout",
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    user_id:
                                        Number(
                                            userId
                                        ),

                                    shipping_address:
                                        shippingAddress,

                                    items:
                                        items

                                })

                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "CHECKOUT RESPONSE:",
                    data
                );


                // ---------------------------------
                // ERROR
                // ---------------------------------

                if (
                    !response.ok ||
                    !data.success
                ) {

                    alert(
                        data.message ||
                        "Checkout failed."
                    );

                    return;

                }


                // ---------------------------------
                // SUCCESS
                // ---------------------------------

                alert(
                    "Order placed successfully!\n\n" +
                    "Order ID: " +
                    data.order_id +
                    "\n" +
                    "Total: $" +
                    Number(
                        data.total_amount
                    ).toFixed(2)
                );


                // ---------------------------------
                // CLEAR CART
                // ---------------------------------

                cart = [];


                saveCart();


                updateCart();


                closeCartModal();

            }

            catch (error) {

                console.error(
                    "CHECKOUT ERROR:",
                    error
                );


                alert(
                    "Unable to connect to the server."
                );

            }

        }
    );

}


// =========================================================
// NAVIGATION ACTIVE LINK
// =========================================================

const navLinks =
    document.querySelectorAll(
        ".navbar nav a"
    );


navLinks.forEach(
    (link) => {

        link.addEventListener(
            "click",
            () => {

                navLinks.forEach(
                    (item) => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                link.classList.add(
                    "active"
                );

            }
        );

    }
);


// =========================================================
// INITIALIZE
// =========================================================

async function initializeApp() {

    // Load products from database
    await loadProducts();

    // Initialize existing cards
    initializeProductCards();

    // Initialize cart buttons
    initializeCartButtons();

    // Update cart
    updateCart();

}


// =========================================================
// START APP
// =========================================================

initializeApp();