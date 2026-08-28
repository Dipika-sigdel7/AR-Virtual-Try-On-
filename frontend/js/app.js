// =========================================================
// AR ECOMMERCE
// HOME PAGE / APP.JS
// PRODUCT MODAL + SHARED CART + CHECKOUT + USER AUTH
// =========================================================


// =========================================================
// SHARED CART STORAGE
// =========================================================

const CART_STORAGE_KEY =
    "ar_ecommerce_cart";


// =========================================================
// LOAD CART
// =========================================================

function loadCart() {

    try {

        const savedCart =
            localStorage.getItem(
                CART_STORAGE_KEY
            );

        if (!savedCart) {
            return [];
        }

        const parsedCart =
            JSON.parse(savedCart);

        if (!Array.isArray(parsedCart)) {
            return [];
        }

        return parsedCart;

    } catch (error) {

        console.error(
            "Failed to load cart:",
            error
        );

        return [];

    }

}


// =========================================================
// SAVE CART
// =========================================================

function saveCart() {

    try {

        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(window.cart)
        );

    } catch (error) {

        console.error(
            "Failed to save cart:",
            error
        );

    }

}


// =========================================================
// SHARED CART
// =========================================================

window.cart =
    loadCart();


// =========================================================
// CURRENT USER
// =========================================================

window.currentUser = null;

let userLoggedIn = false;


// =========================================================
// ELEMENTS
// =========================================================

const productModal =
    document.getElementById(
        "product-modal"
    );

const modalClose =
    document.getElementById(
        "modal-close"
    );

const modalProductImage =
    document.getElementById(
        "modal-product-image"
    );

const modalProductName =
    document.getElementById(
        "modal-product-name"
    );

const modalProductCategory =
    document.getElementById(
        "modal-product-category"
    );

const modalProductPrice =
    document.getElementById(
        "modal-product-price"
    );

const modalRating =
    document.getElementById(
        "modal-rating"
    );


// =========================================================
// CART ELEMENTS
// =========================================================

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


// =========================================================
// AUTH ELEMENT
// =========================================================

const authActions =
    document.getElementById(
        "auth-actions"
    );


// =========================================================
// PRODUCT DATA
// =========================================================

const products = {

    smartphone: {

        id: 1,
        name: "Smartphone",
        category: "Electronics",
        price: 499,
        image: "📱",
        rating: "4.8 / 5"

    },

    sneakers: {

        id: 2,
        name: "Premium Sneakers",
        category: "Fashion",
        price: 99,
        image: "👟",
        rating: "4.7 / 5"

    },

    smartwatch: {

        id: 3,
        name: "Smart Watch",
        category: "Accessories",
        price: 149,
        image: "⌚",
        rating: "4.9 / 5"

    }

};


// =========================================================
// PRODUCT LOOKUP
// =========================================================

window.productsById =
    window.productsById || {};

Object.values(products).forEach(
    product => {

        window.productsById[
            String(product.id)
        ] = product;

    }
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


        console.log(
            "USER SESSION:",
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

            window.currentUser =
                null;

            showLoggedOutUser();

        }

    }

    catch (error) {

        console.error(
            "Unable to check login:",
            error
        );

        userLoggedIn = false;

        window.currentUser =
            null;

        showLoggedOutUser();

    }

}


// =========================================================
// SHOW LOGGED-IN USER
// =========================================================

function showLoggedInUser(user) {

    if (!authActions) {

        console.error(
            "ERROR: #auth-actions was not found in HTML."
        );

        return;

    }


    authActions.innerHTML = `

        <a
            href="/profile"
            class="profile-btn"
            id="profile-link"
        >
            👤 Profile
        </a>

        <button
            type="button"
            class="logout-btn"
            id="logout-btn"
        >
            Logout
        </button>

    `;


    const logoutButton =
        document.getElementById(
            "logout-btn"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            logoutUser
        );

    }

}


// =========================================================
// SHOW LOGGED-OUT USER
// =========================================================

function showLoggedOutUser() {

    if (!authActions) {

        console.error(
            "ERROR: #auth-actions was not found in HTML."
        );

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


// =========================================================
// LOGOUT
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
            data.success
        ) {

            userLoggedIn = false;

            window.currentUser =
                null;


            showLoggedOutUser();


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


// =========================================================
// ADD TO CART
// IMPORTANT:
// USER MUST BE LOGGED IN
// =========================================================

function addToCart(product) {

    /*
     * DO NOT ADD PRODUCT IF USER
     * IS NOT LOGGED IN.
     */

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


// =========================================================
// MAKE ADD TO CART GLOBAL
// =========================================================

window.addToCart =
    addToCart;


// =========================================================
// PRODUCT MODAL
// =========================================================

const productCards =
    document.querySelectorAll(
        ".product-card"
    );


productCards.forEach(
    card => {

        card.addEventListener(
            "click",
            event => {

                if (
                    event.target.closest(
                        "[data-product-action='cart']"
                    )
                ) {

                    return;

                }


                const productId =
                    card.getAttribute(
                        "data-product"
                    );


                if (!productId) {

                    return;

                }


                let product =
                    window.productsById[
                        String(productId)
                    ];


                if (!product) {

                    product =
                        products[productId];

                }


                if (!product) {

                    return;

                }


                if (modalProductImage) {

                    if (
                        typeof product.image ===
                            "string" &&
                        (
                            product.image.startsWith("/") ||
                            product.image.startsWith("http")
                        )
                    ) {

                        modalProductImage.innerHTML = `

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

                    else {

                        modalProductImage.textContent =
                            product.image || "🛍️";

                    }

                }


                if (modalProductName) {

                    modalProductName.textContent =
                        product.name || "";

                }


                if (modalProductCategory) {

                    modalProductCategory.textContent =
                        product.category_name ||
                        product.category ||
                        "Uncategorized";

                }


                if (modalProductPrice) {

                    modalProductPrice.textContent =
                        `$${Number(
                            product.price || 0
                        ).toFixed(2)}`;

                }


                if (modalRating) {

                    modalRating.textContent =
                        product.rating ||
                        "No rating";

                }


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


// =========================================================
// CLOSE PRODUCT MODAL
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
        event => {

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
// CONNECT ADD TO CART BUTTONS
// =========================================================

const addButtons =
    document.querySelectorAll(
        "[data-product-action='cart']"
    );


addButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();


                /*
                 * CHECK LOGIN FIRST
                 */

                if (!userLoggedIn) {

                    alert(
                        "Please login before adding products to the cart."
                    );


                    window.location.href =
                        "/login";


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
                    card.getAttribute(
                        "data-product"
                    );


                if (!productId) {

                    return;

                }


                let product =
                    window.productsById[
                        String(productId)
                    ];


                if (!product) {

                    product =
                        products[productId];

                }


                if (!product) {

                    console.error(
                        "Product not found:",
                        productId
                    );

                    return;

                }


                const added =
                    addToCart(product);


                if (!added) {

                    return;

                }


                const originalText =
                    button.textContent;


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

                    },
                    1000
                );

            }
        );

    }
);


// =========================================================
// UPDATE CART
// =========================================================

function updateCart() {

    saveCart();


    const totalQuantity =
        window.cart.reduce(
            (
                sum,
                product
            ) => {

                return (
                    sum +
                    Number(
                        product.quantity || 0
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
                product
            ) => {

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


    if (cartTotal) {

        cartTotal.textContent =
            `$${total.toFixed(2)}`;

    }


    if (cartItems) {

        cartItems.innerHTML =
            "";

    }


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
                product.image ||
                "🛍️";


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
                    class="remove-cart-item"
                    data-index="${index}"
                    type="button"
                >
                    Remove
                </button>

            `;


            if (cartItems) {

                cartItems.appendChild(
                    item
                );

            }

        }
    );


    const removeButtons =
        document.querySelectorAll(
            ".remove-cart-item"
        );


    removeButtons.forEach(
        button => {

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
    );

}


// =========================================================
// GLOBAL UPDATE CART
// =========================================================

window.updateCart =
    updateCart;


// =========================================================
// OPEN CART
// =========================================================

if (cartButton) {

    cartButton.addEventListener(
        "click",
        () => {

            /*
             * Cart itself can be opened,
             * but checkout requires login.
             */

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


window.closeCartModal =
    closeCartModal;


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


// =========================================================
// CHECKOUT
// =========================================================

if (checkoutButton) {

    checkoutButton.addEventListener(
        "click",
        async () => {

            if (
                window.cart.length === 0
            ) {

                alert(
                    "Your cart is empty."
                );

                return;

            }


            /*
             * ALWAYS CHECK SERVER SESSION.
             */

            let user;


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
                    !response.ok ||
                    !data.success ||
                    !data.loggedIn ||
                    !data.user
                ) {

                    alert(
                        "Please login before checkout."
                    );


                    window.location.href =
                        "/login";


                    return;

                }


                user =
                    data.user;

            }

            catch (error) {

                console.error(
                    "Session check failed:",
                    error
                );


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
                                            user.id
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


                window.cart.length =
                    0;


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
// ESCAPE KEY
// =========================================================

document.addEventListener(
    "keydown",
    event => {

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
// NAVIGATION ACTIVE LINK
// =========================================================

const navLinks =
    document.querySelectorAll(
        ".navbar nav a"
    );


navLinks.forEach(
    link => {

        link.addEventListener(
            "click",
            () => {

                navLinks.forEach(
                    item => {

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
// HERO BUTTON
// =========================================================

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


// =========================================================
// VIEW ALL
// =========================================================

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
// INITIALIZE
// =========================================================

updateCart();


// IMPORTANT:
// Check the session when the page loads.

checkUserLogin();