// =========================================================
// AR ECOMMERCE
// HOME PAGE / APP.JS
// PRODUCT MODAL + SHARED CART + CHECKOUT
// =========================================================


// =========================================================
// SHARED CART STORAGE
// =========================================================

const CART_STORAGE_KEY = "ar_ecommerce_cart";


// =========================================================
// LOAD CART FROM LOCAL STORAGE
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

    }

    catch (error) {

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

    }

    catch (error) {

        console.error(
            "Failed to save cart:",
            error
        );

    }

}


// =========================================================
// ONE SHARED CART
// =========================================================

window.cart =
    loadCart();


// =========================================================
// ELEMENTS
// =========================================================

const productModal =
    document.querySelector(
        "#product-modal"
    );


const modalClose =
    document.querySelector(
        "#modal-close"
    );


const modalProductImage =
    document.querySelector(
        "#modal-product-image"
    );


const modalProductName =
    document.querySelector(
        "#modal-product-name"
    );


const modalProductCategory =
    document.querySelector(
        "#modal-product-category"
    );


const modalProductPrice =
    document.querySelector(
        "#modal-product-price"
    );


const modalRating =
    document.querySelector(
        "#modal-rating"
    );


// =========================================================
// CART ELEMENTS
// =========================================================

const cartButton =
    document.querySelector(
        "#cart-btn"
    );


const cartCount =
    document.querySelector(
        "#cart-count"
    );


const cartModal =
    document.querySelector(
        "#cart-modal"
    );


const cartClose =
    document.querySelector(
        "#cart-close"
    );


const cartItems =
    document.querySelector(
        "#cart-items"
    );


const cartTotal =
    document.querySelector(
        "#cart-total"
    );


const checkoutButton =
    document.querySelector(
        "#checkout-btn"
    );


// =========================================================
// PRODUCT DATA
// IMPORTANT:
// This is ONLY used for old/static Home cards.
// Admin products can also be added dynamically.
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


// Add old/static products

Object.values(products).forEach(
    product => {

        window.productsById[
            String(product.id)
        ] = product;

    }
);


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

                // Do not open modal when
                // Add to Cart is clicked.

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


                // ------------------------------------------------
                // If product is static
                // ------------------------------------------------

                if (!product) {

                    product =
                        products[productId];

                }


                if (!product) {

                    return;

                }


                // ------------------------------------------------
                // IMAGE
                // ------------------------------------------------

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


                // ------------------------------------------------
                // NAME
                // ------------------------------------------------

                if (modalProductName) {

                    modalProductName.textContent =
                        product.name || "";

                }


                // ------------------------------------------------
                // CATEGORY
                // ------------------------------------------------

                if (modalProductCategory) {

                    modalProductCategory.textContent =
                        product.category_name ||
                        product.category ||
                        "Uncategorized";

                }


                // ------------------------------------------------
                // PRICE
                // ------------------------------------------------

                if (modalProductPrice) {

                    modalProductPrice.textContent =
                        `$${Number(
                            product.price || 0
                        ).toFixed(2)}`;

                }


                // ------------------------------------------------
                // RATING
                // ------------------------------------------------

                if (modalRating) {

                    modalRating.textContent =
                        product.rating ||
                        "No rating";

                }


                // ------------------------------------------------
                // OPEN MODAL
                // ------------------------------------------------

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
// ADD TO CART
// WORKS FOR HOME + DYNAMIC PRODUCTS
// =========================================================

function addToCart(product) {

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


    // ---------------------------------------------------------
    // EXISTING PRODUCT
    // ---------------------------------------------------------

    if (existingItem) {

        existingItem.quantity =
            Number(
                existingItem.quantity || 0
            ) + 1;

    }


    // ---------------------------------------------------------
    // NEW PRODUCT
    // ---------------------------------------------------------

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
// MAKE AVAILABLE TO PRODUCTS.JS
// =========================================================

window.addToCart =
    addToCart;


// =========================================================
// CONNECT HOME ADD TO CART BUTTONS
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


                // ------------------------------------------------
                // Find product
                // ------------------------------------------------

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


                // ------------------------------------------------
                // Add to cart
                // ------------------------------------------------

                addToCart(product);


                // ------------------------------------------------
                // BUTTON ANIMATION
                // ------------------------------------------------

                const originalText =
                    button.textContent;


                button.textContent =
                    "Added ✓";


                button.classList.add(
                    "added"
                );


                button.style.transform =
                    "scale(0.95)";


                setTimeout(
                    () => {

                        button.style.transform =
                            "";

                    },
                    150
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

    // =======================================================
    // SAVE CART
    // =======================================================

    saveCart();


    // =======================================================
    // TOTAL QUANTITY
    // =======================================================

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


    // =======================================================
    // CART COUNT
    // =======================================================

    if (cartCount) {

        cartCount.textContent =
            totalQuantity;

    }


    // =======================================================
    // EMPTY CART
    // =======================================================

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


    // =======================================================
    // TOTAL PRICE
    // =======================================================

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


    // =======================================================
    // CLEAR CART
    // =======================================================

    if (cartItems) {

        cartItems.innerHTML =
            "";

    }


    // =======================================================
    // DISPLAY CART PRODUCTS
    // =======================================================

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


            // ------------------------------------------------
            // PRODUCT IMAGE
            // ------------------------------------------------

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


            // ------------------------------------------------
            // CART ITEM
            // ------------------------------------------------

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


    // =======================================================
    // REMOVE BUTTONS
    // =======================================================

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
                        Number.isInteger(
                            index
                        ) &&
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
// MAKE UPDATE CART AVAILABLE GLOBALLY
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

            // ------------------------------------------------
            // EMPTY CART
            // ------------------------------------------------

            if (
                window.cart.length === 0
            ) {

                alert(
                    "Your cart is empty."
                );

                return;

            }


            // ------------------------------------------------
            // USER ID
            // ------------------------------------------------

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


            // ------------------------------------------------
            // SHIPPING ADDRESS
            // ------------------------------------------------

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


            // ------------------------------------------------
            // CART ITEMS
            // ------------------------------------------------

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

                // --------------------------------------------
                // CHECKOUT REQUEST
                // --------------------------------------------

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


                // --------------------------------------------
                // CHECK ERROR
                // --------------------------------------------

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


                // --------------------------------------------
                // SUCCESS
                // --------------------------------------------

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


                // --------------------------------------------
                // CLEAR SHARED CART
                // --------------------------------------------

                window.cart.length =
                    0;


                saveCart();

                updateCart();


                // --------------------------------------------
                // CLOSE CART
                // --------------------------------------------

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
// INITIALIZE CART
// =========================================================

updateCart();