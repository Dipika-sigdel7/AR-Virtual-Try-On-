// =========================================================
// AR ECOMMERCE
// PRODUCTS PAGE
// DATABASE PRODUCTS + SHARED DATABASE CART
// =========================================================


/* =========================================================
   GLOBAL USER
========================================================= */

window.currentUser = null;

let userLoggedIn = false;


/* =========================================================
   GLOBAL CART
========================================================= */

window.cart = [];


/* =========================================================
   PRODUCTS
========================================================= */

window.productsById = {};


/* =========================================================
   ELEMENTS
========================================================= */

const categoriesContainer =
    document.getElementById(
        "categories-container"
    );


/* =========================================================
   CHECK CURRENT USER
========================================================= */

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


            /*
             * Load this user's
             * database cart.
             */

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
            "Session check error:",
            error
        );


        userLoggedIn = false;

        window.currentUser = null;

        window.cart = [];

        updateCart();

        return false;

    }

}


/* =========================================================
   LOAD USER CART
========================================================= */

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
                Array.isArray(data.items)
                    ? data.items.map(
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
                                    item.price || 0
                                ),

                            stock:
                                Number(
                                    item.stock || 0
                                ),

                            rating:
                                item.rating,

                            category_name:
                                item.category_name,

                            quantity:
                                Number(
                                    item.quantity || 0
                                )

                        })
                    )
                    : [];


            updateCart();

        }

        else {

            console.error(
                data.message ||
                "Failed to load cart."
            );


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


/* =========================================================
   ADD TO CART
   SAME FUNCTION USED BY HOME PAGE
========================================================= */

async function addToCart(product) {

    if (!userLoggedIn) {

        alert(
            "Please login before adding products to the cart."
        );


        sessionStorage.setItem(
            "loginRedirect",
            window.location.pathname
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

                    credentials:
                        "include",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            product_id:
                                Number(
                                    product.id
                                ),

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


        /*
         * IMPORTANT:
         * Reload database cart.
         */

        await loadCart();


        return true;

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


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

    if (!categoriesContainer) {

        return;

    }


    try {

        categoriesContainer.innerHTML = `

            <div class="loading-products">
                Loading products...
            </div>

        `;


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


        if (
            !response.ok ||
            data.success !== true
        ) {

            categoriesContainer.innerHTML = `

                <div class="products-message">

                    No products available.

                </div>

            `;

            return;

        }


        const products =
            Array.isArray(data.products)
                ? data.products
                : [];


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


        /*
         * Store products.
         */

        window.productsById = {};


        products.forEach(
            product => {

                window.productsById[
                    String(product.id)
                ] = product;

            }
        );


        /*
         * Group by category.
         */

        const categories = {};


        products.forEach(
            product => {

                const category =
                    product.category_name ||
                    product.category ||
                    "Uncategorized";


                if (
                    !categories[category]
                ) {

                    categories[category] = [];

                }


                categories[category].push(
                    product
                );

            }
        );


        categoriesContainer.innerHTML =
            "";


        /*
         * Display categories.
         */

        Object.keys(
            categories
        ).forEach(
            categoryName => {

                const section =
                    document.createElement(
                        "section"
                    );


                section.className =
                    "category-section";


                section.innerHTML = `

                    <div class="category-heading">

                        <div>

                            <p class="section-label">
                                CATEGORY
                            </p>

                            <h2>
                                ${escapeHTML(
                                    categoryName
                                )}
                            </h2>

                        </div>

                    </div>

                `;


                const grid =
                    document.createElement(
                        "div"
                    );


                grid.className =
                    "product-grid";


                categories[
                    categoryName
                ].forEach(
                    product => {

                        grid.appendChild(
                            createProductCard(
                                product
                            )
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


        connectCartButtons();

    }

    catch (error) {

        console.error(
            "PRODUCT LOAD ERROR:",
            error
        );


        categoriesContainer.innerHTML = `

            <div class="products-message">

                No products available.

            </div>

        `;

    }

}


/* =========================================================
   CREATE PRODUCT CARD
========================================================= */

function createProductCard(product) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "product-card";


    card.dataset.product =
        product.id;


    let imageHTML =
        "🛍️";


    if (
        product.image
    ) {

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


    const stock =
        Number(
            product.stock || 0
        );


    const outOfStock =
        stock <= 0;


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


    return card;

}


/* =========================================================
   CONNECT ADD BUTTONS
========================================================= */

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


                    const loggedIn =
                        await checkUserLogin();


                    if (!loggedIn) {

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


                    button.disabled =
                        true;


                    const oldText =
                        button.textContent.trim();


                    button.textContent =
                        "Adding...";


                    const success =
                        await window.addToCart(
                            product
                        );


                    if (
                        success
                    ) {

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


/* =========================================================
   UPDATE CART
========================================================= */

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
            ) =>
                total +
                Number(
                    item.quantity || 0
                ),
            0
        );


    if (cartCount) {

        cartCount.textContent =
            quantity;

    }


    if (
        !window.cart.length
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
                "$0.00";

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


    if (cartTotal) {

        cartTotal.textContent =
            `$${total.toFixed(2)}`;

    }

}


/* =========================================================
   REMOVE CART ITEM
========================================================= */

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
                    `/api/cart/${cartItemId}`,
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
                "Remove cart error:",
                error
            );


            alert(
                "Unable to remove product."
            );

        }

    }
);


/* =========================================================
   OPEN CART
========================================================= */

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


/* =========================================================
   CLOSE CART
========================================================= */

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


/* =========================================================
   HELPERS
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


/* =========================================================
   ESCAPE KEY
========================================================= */

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


/* =========================================================
   INITIALIZE
========================================================= */

async function initializeProductsPage() {

    await checkUserLogin();

    await loadProducts();

}


initializeProductsPage();