// =========================================================
// AR ECOMMERCE
// HOME PAGE APP.JS
// DATABASE PRODUCTS + DATABASE CART + USER SESSION
// =========================================================


// =========================================================
// GLOBAL VARIABLES
// =========================================================

window.currentUser = null;

window.cart = [];

window.productsById = {};

let userLoggedIn = false;


// =========================================================
// ELEMENTS
// =========================================================

const navActions =
    document.getElementById("nav-actions");

const cartModal =
    document.getElementById("cart-modal");

const cartClose =
    document.getElementById("cart-close");

const cartItems =
    document.getElementById("cart-items");

const cartTotal =
    document.getElementById("cart-total");

const checkoutButton =
    document.getElementById("checkout-btn");

const homeProductsContainer =
    document.getElementById(
        "home-products-container"
    );


// =========================================================
// CHECK USER LOGIN
// =========================================================

async function checkUserLogin() {

    try {

        const response =
            await fetch(
                "/api/users/me",
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store"
                }
            );


        const data =
            await response.json();


        if (
            response.ok &&
            data.success === true &&
            data.loggedIn === true &&
            data.user
        ) {

            userLoggedIn = true;

            window.currentUser =
                data.user;


            // IMPORTANT:
            // Login button remains visible
            // even after the user logs in.

            showLoggedInUser();


            // Load user's database cart.

            await loadCart();

        }

        else {

            userLoggedIn = false;

            window.currentUser = null;

            window.cart = [];

            showLoggedOutUser();

            updateCart();

        }

    }

    catch (error) {

        console.error(
            "Login check error:",
            error
        );


        userLoggedIn = false;

        window.currentUser = null;

        window.cart = [];

        showLoggedOutUser();

        updateCart();

    }

}


// =========================================================
// SHOW LOGGED IN USER
// =========================================================
// IMPORTANT:
//
// We DO NOT show Profile or Logout here.
//
// The Login button remains visible even
// when the user is already logged in.
//
// =========================================================

function showLoggedInUser() {

    if (!navActions) {

        return;

    }


    navActions.innerHTML = `

        <a
            href="/login"
            class="login-btn"
        >
            Login
        </a>


        <button
            class="cart-btn"
            id="cart-btn"
            type="button"
        >

            🛒

            <span>
                Cart
            </span>

            <b id="cart-count">
                0
            </b>

        </button>

    `;


    // Get the new cart button after
    // replacing navActions.

    window.cartButton =
        document.getElementById(
            "cart-btn"
        );


    window.cartCount =
        document.getElementById(
            "cart-count"
        );


    connectCartButton();

    updateCart();

}


// =========================================================
// SHOW LOGGED OUT USER
// =========================================================

function showLoggedOutUser() {

    if (!navActions) {

        return;

    }


    navActions.innerHTML = `

        <a
            href="/login"
            class="login-btn"
        >
            Login
        </a>


        <button
            class="cart-btn"
            id="cart-btn"
            type="button"
        >

            🛒

            <span>
                Cart
            </span>

            <b id="cart-count">
                0
            </b>

        </button>

    `;


    window.cartButton =
        document.getElementById(
            "cart-btn"
        );


    window.cartCount =
        document.getElementById(
            "cart-count"
        );


    connectCartButton();

    updateCart();

}


// =========================================================
// CONNECT CART BUTTON
// =========================================================

function connectCartButton() {

    const button =
        document.getElementById(
            "cart-btn"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        openCart
    );

}


// =========================================================
// LOAD PRODUCTS FROM DATABASE
// =========================================================

async function loadHomeProducts() {

    if (!homeProductsContainer) {

        return;

    }


    homeProductsContainer.innerHTML = `

        <div class="loading-products">

            Loading products...

        </div>

    `;


    try {

        const response =
            await fetch(
                "/api/products",
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        const data =
            await response.json();


        console.log(
            "Home Products API:",
            data
        );


        if (
            !response.ok ||
            data.success !== true
        ) {

            showNoProducts();

            return;

        }


        const products =
            Array.isArray(data.products)
                ? data.products
                : [];


        if (
            products.length === 0
        ) {

            showNoProducts();

            return;

        }


        // =================================================
        // SAVE PRODUCTS BY ID
        // =================================================

        window.productsById = {};


        products.forEach(
            product => {

                window.productsById[
                    String(product.id)
                ] = product;

            }
        );


        // =================================================
        // DISPLAY PRODUCTS
        // =================================================

        homeProductsContainer.innerHTML = "";


        products.forEach(
            product => {

                const card =
                    createHomeProductCard(
                        product
                    );


                homeProductsContainer.appendChild(
                    card
                );

            }
        );


        // =================================================
        // CONNECT ADD TO CART BUTTONS
        // =================================================

        connectHomeCartButtons();

    }

    catch (error) {

        console.error(
            "HOME PRODUCT ERROR:",
            error
        );


        showNoProducts();

    }

}


// =========================================================
// CREATE HOME PRODUCT CARD
// =========================================================

function createHomeProductCard(product) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "product-card";


    card.dataset.product =
        product.id;


    // =====================================================
    // IMAGE
    // =====================================================

    let imageHTML =
        "🛍️";


    if (product.image) {

        imageHTML = `

            <img
                src="${escapeAttribute(
                    product.image
                )}"
                alt="${escapeAttribute(
                    product.name
                )}"
            >

        `;

    }


    // =====================================================
    // STOCK
    // =====================================================

    const stock =
        Number(
            product.stock || 0
        );


    const outOfStock =
        stock <= 0;


    // =====================================================
    // CARD HTML
    // =====================================================

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


            ${
                product.description
                ?
                `

                <p class="product-description">

                    ${escapeHTML(
                        product.description
                    )}

                </p>

                `
                :
                ""
            }


            <div class="product-bottom">

                <strong>

                    $${Number(
                        product.price || 0
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
                        data-product-id="${product.id}"
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
// NO PRODUCTS
// =========================================================

function showNoProducts() {

    if (!homeProductsContainer) {

        return;

    }


    homeProductsContainer.innerHTML = `

        <div class="products-message">

            <div class="no-products-icon">

                🛍️

            </div>


            <h3>

                No products available.

            </h3>


            <p>

                Products added by the admin
                will appear here.

            </p>

        </div>

    `;

}


// =========================================================
// CONNECT HOME ADD TO CART BUTTONS
// =========================================================

function connectHomeCartButtons() {

    const buttons =
        document.querySelectorAll(
            "#home-products-container [data-product-action='cart']"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                async event => {

                    event.preventDefault();

                    event.stopPropagation();


                    if (button.disabled) {

                        return;

                    }


                    // =========================================
                    // CHECK LOGIN
                    // =========================================

                    if (!userLoggedIn) {

                        sessionStorage.setItem(
                            "loginRedirect",
                            window.location.pathname
                        );


                        alert(
                            "Please login to add products to your cart."
                        );


                        window.location.href =
                            "/login";


                        return;

                    }


                    // =========================================
                    // GET PRODUCT ID
                    // =========================================

                    const productId =
                        button.dataset.productId;


                    // =========================================
                    // GET PRODUCT
                    // =========================================

                    const product =
                        window.productsById[
                            String(productId)
                        ];


                    if (!product) {

                        console.error(
                            "Product not found:",
                            productId
                        );

                        return;

                    }


                    // =========================================
                    // DISABLE BUTTON
                    // =========================================

                    button.disabled =
                        true;


                    const originalText =
                        button.textContent.trim();


                    button.textContent =
                        "Adding...";


                    // =========================================
                    // ADD TO DATABASE CART
                    // =========================================

                    const result =
                        await addToCart(
                            product
                        );


                    // =========================================
                    // FAILED
                    // =========================================

                    if (result === false) {

                        button.disabled =
                            false;

                        button.textContent =
                            originalText;

                        return;

                    }


                    // =========================================
                    // SUCCESS
                    // =========================================

                    button.textContent =
                        "Added ✓";


                    button.classList.add(
                        "added"
                    );


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
                        1000
                    );

                }
            );

        }
    );

}


// =========================================================
// ADD TO CART
// =========================================================

async function addToCart(product) {

    if (!userLoggedIn) {

        alert(
            "Please login first."
        );


        window.location.href =
            "/login";


        return false;

    }


    try {

        const response =
            await fetch(
                "/api/cart/add",
                {
                    method: "POST",

                    credentials: "include",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            product_id:
                                product.id,

                            quantity:
                                1

                        })

                }
            );


        const data =
            await response.json();


        if (
            response.status === 401
        ) {

            userLoggedIn = false;

            window.currentUser = null;

            window.cart = [];

            updateCart();

            alert(
                "Please login first."
            );


            window.location.href =
                "/login";


            return false;

        }


        if (
            response.ok &&
            data.success === true
        ) {

            // Reload database cart.

            await loadCart();


            return true;

        }


        alert(
            data.message ||
            "Failed to add product."
        );


        return false;

    }

    catch (error) {

        console.error(
            "Add to cart error:",
            error
        );


        alert(
            "Unable to add product to cart."
        );


        return false;

    }

}


window.addToCart =
    addToCart;


// =========================================================
// LOAD CART FROM DATABASE
// =========================================================

async function loadCart() {

    if (!userLoggedIn) {

        window.cart = [];

        updateCart();

        return;

    }


    try {

        const response =
            await fetch(
                "/api/cart",
                {
                    method: "GET",

                    credentials: "include",

                    cache: "no-store"
                }
            );


        const data =
            await response.json();


        if (
            response.ok &&
            data.success === true
        ) {

            window.cart =
                data.items.map(
                    item => ({

                        cart_item_id:
                            item.cart_item_id,

                        id:
                            item.product_id,

                        product_id:
                            item.product_id,

                        name:
                            item.name,

                        description:
                            item.description,

                        price:
                            Number(
                                item.price
                            ),

                        stock:
                            item.stock,

                        rating:
                            item.rating,

                        category_name:
                            item.category_name,

                        quantity:
                            Number(
                                item.quantity
                            )

                    })
                );


            updateCart();

        }

        else {

            window.cart = [];

            updateCart();

        }

    }

    catch (error) {

        console.error(
            "Load cart error:",
            error
        );


        window.cart = [];

        updateCart();

    }

}


// =========================================================
// UPDATE CART UI
// =========================================================

function updateCart() {

    const totalQuantity =
        window.cart.reduce(
            (
                total,
                item
            ) => {

                return (
                    total +
                    Number(
                        item.quantity || 0
                    )
                );

            },
            0
        );


    const countElement =
        document.getElementById(
            "cart-count"
        );


    if (countElement) {

        countElement.textContent =
            totalQuantity;

    }


    if (!cartItems) {

        return;

    }


    if (
        window.cart.length === 0
    ) {

        cartItems.innerHTML = `

            <p class="empty-cart">

                Your cart is empty.

            </p>

        `;


        if (cartTotal) {

            cartTotal.textContent =
                "$0.00";

        }


        return;

    }


    // =====================================================
    // TOTAL
    // =====================================================

    const total =
        window.cart.reduce(
            (
                sum,
                item
            ) => {

                return (
                    sum +
                    (
                        Number(
                            item.price || 0
                        ) *
                        Number(
                            item.quantity || 0
                        )
                    )
                );

            },
            0
        );


    if (cartTotal) {

        cartTotal.textContent =
            `$${total.toFixed(2)}`;

    }


    // =====================================================
    // CART ITEMS
    // =====================================================

    cartItems.innerHTML = "";


    window.cart.forEach(
        product => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "cart-item";


            item.innerHTML = `

                <div class="cart-item-info">

                    <div class="cart-item-image">

                        🛍️

                    </div>


                    <div class="cart-item-details">

                        <div class="cart-item-name">

                            ${escapeHTML(
                                product.name
                            )}

                        </div>


                        <div class="cart-item-category">

                            ${escapeHTML(
                                product.category_name ||
                                "Uncategorized"
                            )}

                        </div>


                        <div class="cart-item-price">

                            $${Number(
                                product.price || 0
                            ).toFixed(2)}

                            ×

                            ${Number(
                                product.quantity || 0
                            )}

                        </div>

                    </div>

                </div>


                <button
                    type="button"
                    class="remove-cart-item"
                    data-cart-id="${product.cart_item_id}"
                >

                    Remove

                </button>

            `;


            cartItems.appendChild(
                item
            );

        }
    );

}


// =========================================================
// REMOVE CART ITEM
// =========================================================

if (cartItems) {

    cartItems.addEventListener(
        "click",
        async event => {

            const button =
                event.target.closest(
                    ".remove-cart-item"
                );


            if (!button) {

                return;

            }


            const cartItemId =
                button.dataset.cartId;


            if (!cartItemId) {

                return;

            }


            try {

                const response =
                    await fetch(
                        `/api/cart/${cartItemId}`,
                        {
                            method: "DELETE",

                            credentials:
                                "include"
                        }
                    );


                const data =
                    await response.json();


                if (
                    response.ok &&
                    data.success === true
                ) {

                    await loadCart();

                }

                else {

                    alert(
                        data.message ||
                        "Failed to remove product."
                    );

                }

            }

            catch (error) {

                console.error(
                    "Remove cart error:",
                    error
                );


                alert(
                    "Unable to remove product."
                );

            }

        }
    );

}


// =========================================================
// OPEN CART
// =========================================================

async function openCart() {

    if (!userLoggedIn) {

        alert(
            "Please login to view your cart."
        );


        window.location.href =
            "/login";


        return;

    }


    await loadCart();


    if (cartModal) {

        cartModal.classList.add(
            "active"
        );

    }


    document.body.style.overflow =
        "hidden";

}


// =========================================================
// CLOSE CART
// =========================================================

function closeCart() {

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
        closeCart
    );

}


window.closeCart =
    closeCart;


// =========================================================
// LOGOUT
// =========================================================
// This function is kept because you can use it
// from the Profile page.
//
// It is NOT displayed in the navbar.
// =========================================================

async function logoutUser() {

    try {

        const response =
            await fetch(
                "/api/users/logout",
                {
                    method: "POST",

                    credentials: "include"
                }
            );


        const data =
            await response.json();


        if (
            response.ok &&
            data.success === true
        ) {

            userLoggedIn = false;

            window.currentUser =
                null;


            // Do NOT delete cart from database.

            window.cart = [];

            updateCart();

            showLoggedOutUser();


            window.location.href =
                "/";

            return;

        }


        alert(
            data.message ||
            "Logout failed."
        );

    }

    catch (error) {

        console.error(
            "Logout error:",
            error
        );


        alert(
            "Unable to logout."
        );

    }

}


window.logoutUser =
    logoutUser;


// =========================================================
// EXPLORE PRODUCTS
// =========================================================

const exploreButton =
    document.getElementById(
        "explore-products"
    );


if (exploreButton) {

    exploreButton.addEventListener(
        "click",
        () => {

            window.location.href =
                "/products";

        }
    );

}


// =========================================================
// VIEW ALL
// =========================================================

const viewAllButton =
    document.getElementById(
        "view-all"
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
// HTML ESCAPE
// =========================================================

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}


// =========================================================
// ATTRIBUTE ESCAPE
// =========================================================

function escapeAttribute(value) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    );

}


// =========================================================
// ESCAPE KEY
// =========================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeCart();

        }

    }
);


// =========================================================
// INITIALIZE
// =========================================================

async function initializeHomePage() {

    // Load products immediately.

    await loadHomeProducts();


    // Check user session.

    await checkUserLogin();

}


// =========================================================
// START
// =========================================================

initializeHomePage();