
// =========================================================
// AR E-COMMERCE
// PRODUCTS PAGE
// DATABASE PRODUCTS + SHARED DATABASE CART
// PRODUCT DETAILS NAVIGATION
// =========================================================


// =========================================================
// GLOBAL USER
// =========================================================

window.currentUser = null;
let userLoggedIn = false;


// =========================================================
// GLOBAL CART
// =========================================================

window.cart = [];


// =========================================================
// PRODUCTS
// =========================================================

window.productsById = {};


// =========================================================
// DOM ELEMENT
// =========================================================

let categoriesContainer = null;


// =========================================================
// INITIAL DOM SETUP
// =========================================================

function getElements() {

    categoriesContainer =
        document.getElementById("categories-container");

}


// =========================================================
// CHECK CURRENT USER
// =========================================================

async function checkUserLogin() {

    try {

        const response = await fetch(
            "/api/users/me",
            {
                method: "GET",
                credentials: "include",
                cache: "no-store"
            }
        );


        if (!response.ok) {

            userLoggedIn = false;
            window.currentUser = null;
            window.cart = [];

            updateCart();

            return false;

        }


        const data =
            await response.json();


        if (
            data.success === true &&
            data.loggedIn === true &&
            data.user
        ) {

            userLoggedIn = true;

            window.currentUser =
                data.user;


            // Load cart separately.
            await loadCart();


            return true;

        }


        userLoggedIn = false;

        window.currentUser = null;

        window.cart = [];


        updateCart();


        return false;

    }

    catch (error) {

        console.error(
            "SESSION CHECK ERROR:",
            error
        );


        userLoggedIn = false;

        window.currentUser = null;

        window.cart = [];


        updateCart();


        return false;

    }

}


// =========================================================
// LOAD CART
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


        if (!response.ok) {

            console.error(
                "CART API ERROR:",
                response.status
            );


            window.cart = [];

            updateCart();

            return;

        }


        const data =
            await response.json();


        if (
            data.success === true &&
            Array.isArray(data.items)
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

                        image:
                            item.image || null,

                        price:
                            Number(
                                item.price || 0
                            ),

                        stock:
                            Number(
                                item.stock || 0
                            ),

                        rating:
                            Number(
                                item.rating || 0
                            ),

                        category_name:
                            item.category_name ||
                            "Uncategorized",

                        quantity:
                            Number(
                                item.quantity || 0
                            )

                    })
                );

        }

        else {

            window.cart = [];

        }


        updateCart();

    }

    catch (error) {

        console.error(
            "LOAD CART ERROR:",
            error
        );


        window.cart = [];

        updateCart();

    }

}


// =========================================================
// ADD TO CART
// =========================================================

async function addToCart(product) {

    if (!userLoggedIn) {

        sessionStorage.setItem(
            "loginRedirect",
            window.location.href
        );


        alert(
            "Please login before adding products to the cart."
        );


        window.location.href =
            "/login";


        return false;

    }


    if (
        !product ||
        !product.id
    ) {

        console.error(
            "Invalid product:",
            product
        );


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
                                Number(product.id),

                            quantity: 1
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
            !response.ok ||
            data.success !== true
        ) {

            alert(
                data.message ||
                "Failed to add product."
            );


            return false;

        }


        await loadCart();


        return true;

    }

    catch (error) {

        console.error(
            "ADD TO CART ERROR:",
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
// LOAD PRODUCTS
// =========================================================

async function loadProducts() {

    getElements();


    if (!categoriesContainer) {

        console.error(
            "ERROR: #categories-container was not found."
        );


        return;

    }


    console.log(
        "Loading products from /api/products..."
    );


    categoriesContainer.innerHTML = `

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

                    headers: {
                        "Accept":
                            "application/json"
                    },

                    cache: "no-store"
                }
            );


        console.log(
            "Products API status:",
            response.status
        );


        // =================================================
        // READ RESPONSE
        // =================================================

        const data =
            await response.json();


        console.log(
            "Products API response:",
            data
        );


        // =================================================
        // API ERROR
        // =================================================

        if (
            !response.ok ||
            data.success !== true
        ) {

            console.error(
                "Products API returned an error:",
                data
            );


            showProductsError(
                data.message ||
                "Failed to load products."
            );


            return;

        }


        // =================================================
        // PRODUCTS
        // =================================================

        const products =
            Array.isArray(data.products)
                ? data.products
                : [];


        console.log(
            "Products received:",
            products.length
        );


        // =================================================
        // NO PRODUCTS
        // =================================================

        if (
            products.length === 0
        ) {

            categoriesContainer.innerHTML = `

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
        // GROUP PRODUCTS BY CATEGORY
        // =================================================

        const categories = {};


        products.forEach(
            product => {

                const categoryName =
                    product.category_name ||
                    product.category ||
                    "Uncategorized";


                if (
                    !categories[categoryName]
                ) {

                    categories[categoryName] = [];

                }


                categories[categoryName].push(
                    product
                );

            }
        );


        // =================================================
        // CLEAR CONTAINER
        // =================================================

        categoriesContainer.innerHTML = "";


        // =================================================
        // CREATE CATEGORY SECTIONS
        // =================================================

        Object.entries(categories)
            .forEach(
                (
                    [
                        categoryName,
                        categoryProducts
                    ]
                ) => {

                    const section =
                        document.createElement(
                            "section"
                        );


                    section.className =
                        "category-section";


                    section.innerHTML = `

                        <div class="category-heading">

                            <div>

                                <h2>
                                    ${escapeHTML(
                                        categoryName
                                    )}
                                </h2>

                            </div>

                        </div>

                    `;


                    // =================================================
                    // PRODUCT GRID
                    // =================================================

                    const grid =
                        document.createElement(
                            "div"
                        );


                    grid.className =
                        "product-grid";


                    categoryProducts.forEach(
                        product => {

                            const card =
                                createProductCard(
                                    product
                                );


                            grid.appendChild(
                                card
                            );

                        }
                    );


                    section.appendChild(
                        grid
                    );


                    categoriesContainer.appendChild(
                        section
                    );

                }
            );


        // =================================================
        // CONNECT BUTTONS
        // =================================================

        connectCartButtons();


        console.log(
            "Products successfully rendered:",
            products.length
        );

    }

    catch (error) {

        console.error(
            "PRODUCT LOAD ERROR:",
            error
        );


        showProductsError(
            "Unable to connect to the products server."
        );

    }

}


// =========================================================
// SHOW PRODUCTS ERROR
// =========================================================

function showProductsError(message) {

    if (!categoriesContainer) {

        return;

    }


    categoriesContainer.innerHTML = `

        <div class="products-message">

            <h3>
                Unable to load products.
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    `;

}


// =========================================================
// CREATE PRODUCT CARD
// =========================================================

function createProductCard(product) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "product-card";


    card.dataset.product =
        product.id;


    // =================================================
    // IMAGE
    // =================================================

    let imageHTML = `

        <span class="product-placeholder">
            🛍️
        </span>

    `;


    if (
        product.image
    ) {

        imageHTML = `

            <img
                src="${escapeAttribute(
                    product.image
                )}"
                alt="${escapeAttribute(
                    product.name ||
                    "Product"
                )}"
                loading="lazy"
                onerror="
                    this.style.display='none';
                    this.parentElement.innerHTML='🛍️';
                "
            >

        `;

    }


    // =================================================
    // STOCK
    // =================================================

    const stock =
        Number(
            product.stock || 0
        );


    const outOfStock =
        stock <= 0;


    // =================================================
    // CATEGORY
    // =================================================

    const category =
        product.category_name ||
        product.category ||
        "Uncategorized";


    // =================================================
    // CARD HTML
    // =================================================

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
                    category
                )}

            </p>


            <h3>

                ${escapeHTML(
                    product.name ||
                    "Product"
                )}

            </h3>


            <p class="product-description">

                ${escapeHTML(
                    product.description ||
                    ""
                )}

            </p>


            <div class="product-bottom">

                <strong>

                    Rs.
                    ${Number(
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
                            type="button"
                        >
                            Add to Cart
                        </button>

                    `
                }

            </div>

        </div>

    `;


    // =================================================
    // OPEN PRODUCT DETAILS
    // =================================================

    card.addEventListener(
        "click",
        event => {

            // Do not open details for Add to Cart.
            if (
                event.target.closest(
                    "[data-product-action='cart']"
                )
            ) {

                return;

            }


            const productId =
                card.dataset.product;


            if (!productId) {

                console.error(
                    "Product ID missing."
                );


                return;

            }


            window.location.href =
                `/product_details.html?id=${encodeURIComponent(
                    productId
                )}`;

        }
    );


    return card;

}


// =========================================================
// CONNECT ADD TO CART BUTTONS
// =========================================================

function connectCartButtons() {

    const buttons =
        document.querySelectorAll(
            "[data-product-action='cart']"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                async event => {

                    event.preventDefault();

                    event.stopPropagation();


                    if (
                        button.disabled
                    ) {

                        return;

                    }


                    const card =
                        button.closest(
                            ".product-card"
                        );


                    if (!card) {

                        return;

                    }


                    const productId =
                        card.dataset.product;


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


                    // =================================================
                    // CHECK LOGIN ONLY WHEN ADDING TO CART
                    // =================================================

                    const loggedIn =
                        await checkUserLogin();


                    if (!loggedIn) {

                        sessionStorage.setItem(
                            "loginRedirect",
                            window.location.href
                        );


                        alert(
                            "Please login to add products to your cart."
                        );


                        window.location.href =
                            "/login";


                        return;

                    }


                    button.disabled =
                        true;


                    const oldText =
                        button.textContent;


                    button.textContent =
                        "Adding...";


                    const success =
                        await addToCart(
                            product
                        );


                    if (success) {

                        button.textContent =
                            "Added ✓";


                        button.classList.add(
                            "added"
                        );


                        setTimeout(
                            () => {

                                button.textContent =
                                    oldText;

                                button.classList.remove(
                                    "added"
                                );

                                button.disabled =
                                    false;

                            },
                            1000
                        );

                    }

                    else {

                        button.textContent =
                            oldText;

                        button.disabled =
                            false;

                    }

                }
            );

        }
    );

}


// =========================================================
// UPDATE CART
// =========================================================

function updateCart() {

    const cartCount =
        document.getElementById(
            "cart-count"
        );


    const cartItems =
        document.getElementById(
            "cart-items"
        );


    const cartTotal =
        document.getElementById(
            "cart-total"
        );


    const quantity =
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


    if (cartCount) {

        cartCount.textContent =
            quantity;

    }


    // =================================================
    // EMPTY CART
    // =================================================

    if (
        window.cart.length === 0
    ) {

        if (cartItems) {

            cartItems.innerHTML = `

                <p class="empty-cart">
                    Your cart is empty.
                </p>

            `;

        }


        if (cartTotal) {

            cartTotal.textContent =
                "Rs. 0.00";

        }


        return;

    }


    let total = 0;


    if (cartItems) {

        cartItems.innerHTML = "";

    }


    window.cart.forEach(
        product => {

            total +=
                Number(
                    product.price || 0
                ) *
                Number(
                    product.quantity || 0
                );


            if (!cartItems) {

                return;

            }


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "cart-item";


            item.innerHTML = `

                <div class="cart-item-info">

                    <div class="cart-item-image">

                        ${
                            product.image

                            ?

                            `

                            <img
                                src="${escapeAttribute(
                                    product.image
                                )}"
                                alt="${escapeAttribute(
                                    product.name
                                )}"
                            >

                            `

                            :

                            "🛍️"
                        }

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

                            Rs.
                            ${Number(
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
                    data-cart-id="${escapeAttribute(
                        product.cart_item_id
                    )}"
                >

                    Remove

                </button>

            `;


            cartItems.appendChild(
                item
            );

        }
    );


    if (cartTotal) {

        cartTotal.textContent =
            `Rs. ${total.toFixed(2)}`;

    }

}


// =========================================================
// REMOVE CART ITEM
// =========================================================

document.addEventListener(
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
                    `/api/cart/${encodeURIComponent(
                        cartItemId
                    )}`,
                    {
                        method: "DELETE",
                        credentials: "include"
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
                "REMOVE CART ERROR:",
                error
            );


            alert(
                "Unable to remove product."
            );

        }

    }
);


// =========================================================
// CART MODAL
// =========================================================

function initializeCart() {

    const cartButton =
        document.getElementById(
            "cart-btn"
        );


    const cartModal =
        document.getElementById(
            "cart-modal"
        );


    const cartClose =
        document.getElementById(
            "cart-close"
        );


    // =================================================
    // OPEN CART
    // =================================================

    if (cartButton) {

        cartButton.addEventListener(
            "click",
            async () => {

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
        );

    }


    // =================================================
    // CLOSE CART
    // =================================================

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


    // =================================================
    // ESCAPE
    // =================================================

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

}


// =========================================================
// HELPERS
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
// INITIALIZE PRODUCTS PAGE
// =========================================================

async function initializeProductsPage() {

    console.log(
        "================================="
    );

    console.log(
        "AR E-COMMERCE PRODUCTS PAGE"
    );

    console.log(
        "Initializing..."
    );

    console.log(
        "================================="
    );


    // Get DOM first.
    getElements();


    // Initialize cart UI.
    initializeCart();


    // =================================================
    // IMPORTANT:
    //
    // LOAD PRODUCTS FIRST.
    //
    // Products must NOT depend on
    // login/session/cart.
    // =================================================

    await loadProducts();


    // =================================================
    // Check login AFTER products load.
    // =================================================

    await checkUserLogin();


    console.log(
        "Products page initialized."
    );

}


// =========================================================
// START
// =========================================================

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeProductsPage
    );

}

else {

    initializeProductsPage();

}
