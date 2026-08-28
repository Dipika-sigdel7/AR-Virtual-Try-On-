// =========================================================
// AR ECOMMERCE
// HOME PAGE APP.JS
// SHARED CART + USER SESSION + PRODUCT MODAL
// =========================================================


/* =========================================================
   CART STORAGE
========================================================= */

const CART_STORAGE_KEY =
    "ar_ecommerce_cart";


/* =========================================================
   CART
========================================================= */

function loadCart() {

    try {

        const savedCart =
            localStorage.getItem(
                CART_STORAGE_KEY
            );


        if (!savedCart) {

            return [];

        }


        const cart =
            JSON.parse(savedCart);


        return Array.isArray(cart)
            ? cart
            : [];

    }

    catch (error) {

        console.error(
            "Failed to load cart:",
            error
        );

        return [];

    }

}


window.cart =
    loadCart();


function saveCart() {

    try {

        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(
                window.cart
            )
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
   USER SESSION
========================================================= */

window.currentUser = null;

let userLoggedIn = false;


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

        }

        else {

            userLoggedIn = false;

            window.currentUser = null;

            showLoggedOutUser();

        }

    }

    catch (error) {

        console.error(
            "Session check failed:",
            error
        );


        userLoggedIn = false;

        window.currentUser = null;

        showLoggedOutUser();

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
     * Profile button
     */

    if (profileButton) {

        profileButton.addEventListener(
            "click",
            openProfile
        );

    }


    /*
     * Logout button
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

}


/* =========================================================
   OPEN PROFILE
========================================================= */

function openProfile() {

    /*
     * If user is logged in,
     * show profile.
     */

    if (
        !userLoggedIn ||
        !window.currentUser
    ) {

        window.location.href =
            "/login";

        return;

    }


    /*
     * If profile page exists,
     * open it.
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

            userLoggedIn = false;

            window.currentUser = null;


            /*
             * Clear UI.
             */

            showLoggedOutUser();


            /*
             * Go home after logout.
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

    if (!userLoggedIn) {

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

    saveCart();


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
   CART REMOVE
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


            const index =
                Number(
                    button.dataset.index
                );


            if (
                Number.isInteger(index) &&
                index >= 0 &&
                index < window.cart.length
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

updateCart();

checkUserLogin();