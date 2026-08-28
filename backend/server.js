
// =========================================================
// AR ECOMMERCE
// HOME PAGE APP.JS
// DATABASE CART + USER SESSION + PRODUCT MODAL
// =========================================================


/* =========================================================
   USER SESSION
========================================================= */

window.currentUser = null;

let userLoggedIn = false;


/* =========================================================
   DATABASE CART
========================================================= */

window.cart = [];


/* =========================================================
   AUTH ELEMENT
========================================================= */

const authActions =
    document.getElementById(
        "auth-actions"
    );


/* =========================================================
   CART ELEMENTS
========================================================= */

const cartButton =
    document.getElementById(
        "cart-btn"
    );

const cartCount =
    document.getElementById(
        "cart-count"
    );

const cartModal =
    document.getElementById(
        "cart-modal"
    );

const cartClose =
    document.getElementById(
        "cart-close"
    );

const cartItems =
    document.getElementById(
        "cart-items"
    );

const cartTotal =
    document.getElementById(
        "cart-total"
    );

const checkoutButton =
    document.getElementById(
        "checkout-btn"
    );


/* =========================================================
   CHECK CURRENT LOGIN
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


        console.log(
            "CURRENT USER:",
            data
        );


        /* -----------------------------------------
           USER IS LOGGED IN
        ----------------------------------------- */

        if (
            response.ok &&
            data.success === true &&
            data.loggedIn === true &&
            data.user
        ) {

            userLoggedIn = true;

            window.currentUser =
                data.user;


            showLoggedInUser(
                data.user
            );


            /*
             * IMPORTANT:
             * Load this user's cart
             * from the database.
             */

            await loadCartFromDatabase();

        }


        /* -----------------------------------------
           USER IS NOT LOGGED IN
        ----------------------------------------- */

        else {

            userLoggedIn = false;

            window.currentUser = null;

            /*
             * Never keep another user's
             * cart in browser memory.
             */

            window.cart = [];

            showLoggedOutUser();

            updateCart();

        }

    }

    catch (error) {

        console.error(
            "Session check failed:",
            error
        );


        userLoggedIn = false;

        window.currentUser = null;

        window.cart = [];

        showLoggedOutUser();

        updateCart();

    }

}


/* =========================================================
   SHOW LOGGED-IN USER
========================================================= */

function showLoggedInUser(user) {

    if (!authActions) {

        return;

    }


    authActions.innerHTML = `

        <button
            type="button"
            class="profile-btn"
            id="profile-btn"
        >
            👤 ${escapeHTML(
                user.name || "Profile"
            )}
        </button>

        <button
            type="button"
            class="logout-btn"
            id="logout-btn"
        >
            Logout
        </button>

    `;


    const profileButton =
        document.getElementById(
            "profile-btn"
        );


    const logoutButton =
        document.getElementById(
            "logout-btn"
        );


    /* -----------------------------------------
       PROFILE
    ----------------------------------------- */

    if (profileButton) {

        profileButton.addEventListener(
            "click",
            openProfile
        );

    }


    /* -----------------------------------------
       LOGOUT
    ----------------------------------------- */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            logoutUser
        );

    }

}


/* =========================================================
   SHOW LOGGED-OUT USER
========================================================= */

function showLoggedOutUser() {

    if (!authActions) {

        return;

    }


    authActions.innerHTML = `

        <a
            href="/login"
            class="login-btn"
            id="login-link"
        >
            Login
        </a>

    `;

}


/* =========================================================
   LOAD CART FROM DATABASE
========================================================= */

async function loadCartFromDatabase() {

    /*
     * Never request a user's cart
     * when there is no logged-in user.
     */

    if (
        !userLoggedIn ||
        !window.currentUser
    ) {

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


        console.log(
            "DATABASE CART:",
            data
        );


        if (
            response.ok &&
            data.success === true &&
            Array.isArray(data.items)
        ) {

            /*
             * Convert database cart items
             * into the format used by the UI.
             */

            window.cart =
                data.items.map(
                    item => {

                        return {

                            id:
                                item.product_id,

                            cart_item_id:
                                item.cart_item_id,

                            name:
                                item.name,

                            description:
                                item.description,

                            price:
                                Number(
                                    item.price || 0
                                ),

                            stock:
                                item.stock,

                            rating:
                                item.rating,

                            category_name:
                                item.category_name,

                            quantity:
                                Number(
                                    item.quantity || 1
                                ),

                            /*
                             * If your product API
                             * returns image later,
                             * this field can be used.
                             */

                            image:
                                item.image || ""

                        };

                    }
                );

        }

        else {

            window.cart = [];

        }


        updateCart();

    }

    catch (error) {

        console.error(
            "Load database cart error:",
            error
        );


        window.cart = [];

        updateCart();

    }

}


window.loadCartFromDatabase =
    loadCartFromDatabase;


/* =========================================================
   ADD PRODUCT TO CART
========================================================= */

async function addToCart(product) {

    /*
     * User must be logged in.
     */

    if (
        !userLoggedIn ||
        !window.currentUser
    ) {

        alert(
            "Please login before adding products to the cart."
        );


        window.location.href =
            "/login";


        return false;

    }


    if (!product) {

        console.error(
            "No product supplied."
        );

        return false;

    }


    if (!product.id) {

        console.error(
            "Product ID is missing:",
            product
        );

        alert(
            "Unable to add this product."
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
                                product.id,

                            quantity: 1

                        })

                }
            );


        const data =
            await response.json();


        console.log(
            "ADD CART RESPONSE:",
            data
        );


        /*
         * Session may have expired.
         */

        if (
            response.status === 401
        ) {

            userLoggedIn = false;

            window.currentUser = null;

            window.cart = [];

            updateCart();

            alert(
                "Your session has expired. Please login again."
            );


            window.location.href =
                "/login";


            return false;

        }


        if (
            !response.ok ||
            !data.success
        ) {

            alert(
                data.message ||
                "Failed to add product."
            );

            return false;

        }


        /*
         * Reload from DATABASE.
         *
         * This guarantees that the frontend
         * always matches MariaDB.
         */

        await loadCartFromDatabase();


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
   UPDATE CART UI
========================================================= */

function updateCart() {

    /*
     * Calculate total quantity.
     */

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


    /* -----------------------------------------
       CART COUNT
    ----------------------------------------- */

    if (cartCount) {

        cartCount.textContent =
            totalQuantity;

    }


    /* -----------------------------------------
       EMPTY CART
    ----------------------------------------- */

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
                "$0.00";

        }


        return;

    }


    /* -----------------------------------------
       TOTAL PRICE
    ----------------------------------------- */

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


    if (!cartItems) {

        return;

    }


    /* -----------------------------------------
       CLEAR OLD CART UI
    ----------------------------------------- */

    cartItems.innerHTML = "";


    /* -----------------------------------------
       DISPLAY PRODUCTS
    ----------------------------------------- */

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

                        ${
                            typeof product.image ===
                            "string" &&
                            (
                                product.image.startsWith("/") ||
                                product.image.startsWith("http")
                            )

                            ? `

                                <img
                                    src="${escapeAttribute(
                                        product.image
                                    )}"
                                    alt="${escapeAttribute(
                                        product.name
                                    )}"
                                    class="cart-product-real-image"
                                >

                            `

                            : escapeHTML(
                                product.image ||
                                "🛍️"
                            )
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
                                product.category ||
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
                    data-cart-item-id="${escapeAttribute(
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

}


window.updateCart =
    updateCart;


/* =========================================================
   REMOVE PRODUCT FROM CART
========================================================= */

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
                button.dataset.cartItemId;


            if (!cartItemId) {

                console.error(
                    "Cart item ID missing."
                );

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

                            credentials:
                                "include"
                        }
                    );


                const data =
                    await response.json();


                /*
                 * Session expired.
                 */

                if (
                    response.status === 401
                ) {

                    userLoggedIn = false;

                    window.currentUser = null;

                    window.cart = [];

                    updateCart();

                    alert(
                        "Please login again."
                    );


                    window.location.href =
                        "/login";


                    return;

                }


                if (
                    !response.ok ||
                    !data.success
                ) {

                    alert(
                        data.message ||
                        "Failed to remove product."
                    );

                    return;

                }


                /*
                 * Reload from database.
                 */

                await loadCartFromDatabase();

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


/* =========================================================
   OPEN CART
========================================================= */

if (cartButton) {

    cartButton.addEventListener(
        "click",
        async () => {

            /*
             * Cart requires login.
             */

            if (
                !userLoggedIn ||
                !window.currentUser
            ) {

                alert(
                    "Please login to view your cart."
                );


                window.location.href =
                    "/login";


                return;

            }


            /*
             * Always refresh cart
             * from database before opening.
             */

            await loadCartFromDatabase();


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

function closeCartModal() {

    if (cartModal) {

        cartModal.classList.remove(
            "active"
        );

    }


    document.body.style.overflow =
        "";

}


window.closeCartModal =
    closeCartModal;


if (cartClose) {

    cartClose.addEventListener(
        "click",
        closeCartModal
    );

}


/* =========================================================
   PROFILE
========================================================= */

function openProfile() {

    if (
        !userLoggedIn ||
        !window.currentUser
    ) {

        window.location.href =
            "/login";

        return;

    }


    window.location.href =
        "/profile";

}


window.openProfile =
    openProfile;


/* =========================================================
   LOGOUT
========================================================= */

async function logoutUser() {

    try {

        const response =
            await fetch(
                "/api/users/logout",
                {
                    method: "POST",

                    credentials:
                        "include"
                }
            );


        const data =
            await response.json();


        if (
            response.ok &&
            data.success
        ) {

            /*
             * IMPORTANT
             *
             * We clear ONLY the frontend
             * cart variable.
             *
             * We DO NOT call:
             *
             * DELETE /api/cart
             *
             * because the database cart must
             * remain for the next login.
             */

            window.cart = [];


            userLoggedIn = false;

            window.currentUser = null;


            updateCart();

            showLoggedOutUser();


            /*
             * Close cart if it is open.
             */

            closeCartModal();


            /*
             * Return to home page.
             */

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


/* =========================================================
   ESCAPE HTML
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


/* =========================================================
   ESCAPE ATTRIBUTE
========================================================= */

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
            /'/g,
            "&#039;"
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
   PRODUCT MODAL
========================================================= */

const productModal =
    document.getElementById(
        "product-modal"
    );

const modalClose =
    document.getElementById(
        "modal-close"
    );


if (modalClose) {

    modalClose.addEventListener(
        "click",
        () => {

            if (productModal) {

                productModal.classList.remove(
                    "active"
                );

            }

            document.body.style.overflow =
                "";

        }
    );

}


/* =========================================================
   NAVIGATION
========================================================= */

const exploreProducts =
    document.getElementById(
        "explore-products"
    );


if (exploreProducts) {

    exploreProducts.addEventListener(
        "click",
        () => {

            window.location.href =
                "/products";

        }
    );

}


const viewAll =
    document.getElementById(
        "view-all"
    );


if (viewAll) {

    viewAll.addEventListener(
        "click",
        () => {

            window.location.href =
                "/products";

        }
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

            if (productModal) {

                productModal.classList.remove(
                    "active"
                );

            }


            closeCartModal();

        }

    }
);


/* =========================================================
   INITIALIZE APPLICATION
========================================================= */

checkUserLogin();
