
// =========================================================
// AR E-COMMERCE
// HOME PAGE APP.JS
// USER SESSION + USER-SPECIFIC CART + PROFILE + MODAL
// =========================================================


// =========================================================
// USER CART STORAGE
// =========================================================

const CART_STORAGE_PREFIX =
    "ar_ecommerce_cart_user_";


/* =========================================================
   CURRENT USER
========================================================= */

window.currentUser = null;

let userLoggedIn = false;


/* =========================================================
   GET USER CART STORAGE KEY
========================================================= */

function getCartStorageKey(userId) {

    return (
        CART_STORAGE_PREFIX +
        String(userId)
    );

}


/* =========================================================
   LOAD CART FOR CURRENT USER
========================================================= */

function loadUserCart(userId) {

    if (!userId) {

        return [];

    }


    try {

        const key =
            getCartStorageKey(userId);


        const savedCart =
            localStorage.getItem(key);


        if (!savedCart) {

            return [];

        }


        const cart =
            JSON.parse(savedCart);


        if (!Array.isArray(cart)) {

            return [];

        }


        return cart;

    }

    catch (error) {

        console.error(
            "Failed to load user cart:",
            error
        );

        return [];

    }

}


/* =========================================================
   SAVE CURRENT USER CART
========================================================= */

function saveCart() {

    /*
     * Never save a cart when nobody is logged in.
     */

    if (
        !userLoggedIn ||
        !window.currentUser ||
        !window.currentUser.id
    ) {

        return;

    }


    try {

        const key =
            getCartStorageKey(
                window.currentUser.id
            );


        localStorage.setItem(
            key,
            JSON.stringify(window.cart)
        );

    }

    catch (error) {

        console.error(
            "Failed to save cart:",
            error
        );

    }

}


/* =========================================================
   ACTIVE CART
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


        console.log(
            "CURRENT USER:",
            data
        );


        /*
         * USER IS LOGGED IN
         */

        if (
            response.ok &&
            data.success === true &&
            data.loggedIn === true &&
            data.user &&
            data.user.id
        ) {

            userLoggedIn = true;

            window.currentUser =
                data.user;


            /*
             * Load this user's own cart.
             */

            window.cart =
                loadUserCart(
                    data.user.id
                );


            showLoggedInUser(
                data.user
            );


            updateCart();


            return;

        }


        /*
         * USER IS NOT LOGGED IN
         */

        userLoggedIn = false;

        window.currentUser =
            null;

        window.cart = [];


        showLoggedOutUser();

        updateCart();

    }

    catch (error) {

        console.error(
            "Session check failed:",
            error
        );


        userLoggedIn = false;

        window.currentUser =
            null;

        window.cart = [];


        showLoggedOutUser();

        updateCart();

    }

}


/* =========================================================
   LOGGED-IN UI
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


    /*
     * PROFILE
     */

    if (profileButton) {

        profileButton.addEventListener(
            "click",
            openProfile
        );

    }


    /*
     * LOGOUT
     */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            logoutUser
        );

    }

}


/* =========================================================
   LOGGED-OUT UI
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


    const loginLink =
        document.getElementById(
            "login-link"
        );


    /*
     * If the user is somehow already logged in,
     * clicking Login opens Profile.
     */

    if (loginLink) {

        loginLink.addEventListener(
            "click",
            async event => {

                if (userLoggedIn) {

                    event.preventDefault();

                    openProfile();

                }

            }
        );

    }

}


/* =========================================================
   OPEN PROFILE
========================================================= */

function openProfile() {

    /*
     * User is not logged in.
     */

    if (
        !userLoggedIn ||
        !window.currentUser
    ) {

        alert(
            "Please login to view your profile."
        );


        window.location.href =
            "/login";


        return;

    }


    /*
     * User is logged in.
     */

    window.location.href =
        "/profile";

}


window.openProfile =
    openProfile;


/* =========================================================
   LOGOUT
========================================================= */

async function logoutUser() {

    /*
     * Save the user's cart before logout.
     *
     * IMPORTANT:
     * We DO NOT delete the stored cart.
     *
     * This allows the same user to get
     * the cart back after logging in again.
     */

    saveCart();


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

            /*
             * Clear active session.
             */

            userLoggedIn = false;

            window.currentUser =
                null;


            /*
             * IMPORTANT:
             *
             * Empty the active cart.
             *
             * The cart is NOT removed from
             * localStorage.
             *
             * Therefore:
             *
             * Logout -> active cart empty
             *
             * Login again -> old cart restored
             */

            window.cart = [];


            showLoggedOutUser();

            updateCart();


            /*
             * Return to home.
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
   ADD TO CART
========================================================= */

function addToCart(product) {

    /*
     * User MUST be logged in.
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

        return false;

    }


    const productId =
        String(product.id);


    /*
     * Check if product already exists.
     */

    const existingItem =
        window.cart.find(
            item =>
                String(item.id) ===
                productId
        );


    if (existingItem) {

        existingItem.quantity =
            Number(
                existingItem.quantity || 0
            ) + 1;

    }

    else {

        window.cart.push({

            ...product,

            quantity: 1

        });

    }


    /*
     * Save to this user's cart.
     */

    saveCart();


    updateCart();


    return true;

}


window.addToCart =
    addToCart;


/* =========================================================
   UPDATE CART
========================================================= */

function updateCart() {

    /*
     * Only save when logged in.
     */

    if (userLoggedIn) {

        saveCart();

    }


    /*
     * Total quantity.
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


    if (cartCount) {

        cartCount.textContent =
            totalQuantity;

    }


    /*
     * Empty cart.
     */

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


    /*
     * Calculate total.
     */

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


    cartItems.innerHTML = "";


    /*
     * Display cart products.
     */

    window.cart.forEach(
        (
            product,
            index
        ) => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "cart-item";


            let imageHTML =
                escapeHTML(
                    product.image ||
                    "🛍️"
                );


            /*
             * Real product image.
             */

            if (
                typeof product.image ===
                    "string" &&
                (
                    product.image.startsWith("/") ||
                    product.image.startsWith("http")
                )
            ) {

                imageHTML = `

                    <img
                        src="${escapeAttribute(
                            product.image
                        )}"
                        alt="${escapeAttribute(
                            product.name
                        )}"
                        class="cart-product-real-image"
                    >

                `;

            }


            item.innerHTML = `

                <div class="cart-item-info">

                    <div class="cart-item-image">

                        ${imageHTML}

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
                    data-index="${index}"
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
   REMOVE FROM CART
========================================================= */

if (cartItems) {

    cartItems.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".remove-cart-item"
                );


            if (!button) {

                return;

            }


            /*
             * User must be logged in.
             */

            if (!userLoggedIn) {

                alert(
                    "Please login first."
                );

                return;

            }


            const index =
                Number(
                    button.dataset.index
                );


            if (
                Number.isInteger(index) &&
                index >= 0 &&
                index <
                    window.cart.length
            ) {

                window.cart.splice(
                    index,
                    1
                );

            }


            saveCart();

            updateCart();

        }
    );

}


/* =========================================================
   OPEN CART
========================================================= */

if (cartButton) {

    cartButton.addEventListener(
        "click",
        () => {

            /*
             * Cart can only be used by
             * a logged-in user.
             */

            if (!userLoggedIn) {

                alert(
                    "Please login to view your cart."
                );


                window.location.href =
                    "/login";


                return;

            }


            updateCart();


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
   CLICK OUTSIDE CART
========================================================= */

if (cartModal) {

    cartModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                cartModal
            ) {

                closeCartModal();

            }

        }
    );

}


/* =========================================================
   CHECKOUT
========================================================= */

if (checkoutButton) {

    checkoutButton.addEventListener(
        "click",
        async () => {

            /*
             * Cart empty.
             */

            if (
                window.cart.length === 0
            ) {

                alert(
                    "Your cart is empty."
                );

                return;

            }


            /*
             * User must be logged in.
             */

            if (
                !userLoggedIn ||
                !window.currentUser
            ) {

                alert(
                    "Please login before checkout."
                );


                window.location.href =
                    "/login";


                return;

            }


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


            const items =
                window.cart.map(
                    product => {

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

                const response =
                    await fetch(
                        "/api/products/checkout",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            credentials:
                                "include",

                            body:
                                JSON.stringify({

                                    user_id:
                                        Number(
                                            window.currentUser.id
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


                /*
                 * Remove purchased products
                 * from this user's cart.
                 */

                window.cart = [];


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


if (productModal) {

    productModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                productModal
            ) {

                productModal.classList.remove(
                    "active"
                );

                document.body.style.overflow =
                    "";

            }

        }
    );

}


/* =========================================================
   HELPER FUNCTIONS
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
   INITIALIZE
========================================================= */

window.cart = [];

updateCart();

checkUserLogin();
