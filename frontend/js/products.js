// =========================================================
// AR ECOMMERCE
// PRODUCTS PAGE
// =========================================================


// =========================================================
// VARIABLES
// =========================================================

let products = [];

let cart =
    JSON.parse(
        localStorage.getItem("arEcommerceCart")
    ) || [];


// =========================================================
// ELEMENTS
// =========================================================

const productGrid =
    document.getElementById("product-grid");

const cartButton =
    document.getElementById("cart-btn");

const cartModal =
    document.getElementById("cart-modal");

const cartClose =
    document.getElementById("cart-close");

const cartItems =
    document.getElementById("cart-items");

const cartCount =
    document.getElementById("cart-count");

const cartTotal =
    document.getElementById("cart-total");

const checkoutButton =
    document.getElementById("checkout-btn");



// =========================================================
// LOAD PRODUCTS FROM BACKEND
// =========================================================

async function loadProducts() {

    try {

        const response =
            await fetch("/api/products");


        if (!response.ok) {

            throw new Error(
                `HTTP error: ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "Products API:",
            data
        );


        // Your API is expected to return:
        //
        // {
        //     success: true,
        //     products: [...]
        // }


        if (
            data.success === false
        ) {

            throw new Error(
                data.message ||
                "Failed to load products."
            );

        }


        // Support both:
        //
        // data.products
        //
        // and
        //
        // data.data


        products =
            Array.isArray(data.products)
                ? data.products
                : Array.isArray(data.data)
                    ? data.data
                    : Array.isArray(data)
                        ? data
                        : [];


        console.log(
            "Loaded products:",
            products
        );


        renderProducts();


    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );


        productGrid.innerHTML = `

            <div class="products-error">

                <div class="error-icon">
                    ⚠️
                </div>

                <h3>
                    Unable to load products
                </h3>

                <p>
                    ${error.message}
                </p>

                <button
                    class="retry-btn"
                    id="retry-products"
                    type="button"
                >
                    Try Again
                </button>

            </div>

        `;


        const retryButton =
            document.getElementById(
                "retry-products"
            );


        if (retryButton) {

            retryButton.addEventListener(
                "click",
                loadProducts
            );

        }

    }

}



// =========================================================
// RENDER PRODUCTS
// =========================================================

function renderProducts() {

    if (
        !products ||
        products.length === 0
    ) {

        productGrid.innerHTML = `

            <div class="products-empty">

                <div class="empty-icon">
                    🛍️
                </div>

                <h3>
                    No Products Available
                </h3>

                <p>
                    Products added by the administrator
                    will appear here.
                </p>

            </div>

        `;

        return;

    }


    productGrid.innerHTML = "";


    products.forEach(
        (product, index) => {

            const card =
                createProductCard(
                    product,
                    index
                );


            productGrid.appendChild(
                card
            );

        }
    );


    // Attach Add to Cart buttons

    attachCartButtons();

}



// =========================================================
// CREATE PRODUCT CARD
// =========================================================

function createProductCard(
    product,
    index
) {

    const card =
        document.createElement("div");


    card.className =
        "product-card";


    card.dataset.product =
        product.id;


    // ---------------------------------------------------------
    // PRODUCT VALUES
    // ---------------------------------------------------------

    const name =
        product.name ||
        product.product_name ||
        "Unnamed Product";


    const category =
        product.category ||
        product.category_name ||
        "General";


    const description =
        product.description ||
        "No description available.";


    const price =
        Number(
            product.price || 0
        );


    const image =
        product.image ||
        product.image_url ||
        product.product_image ||
        "";


    // ---------------------------------------------------------
    // IMAGE
    // ---------------------------------------------------------

    let imageHTML;


    if (image) {

        imageHTML = `

            <img
                src="${escapeHTML(image)}"
                alt="${escapeHTML(name)}"
                class="product-real-image"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            >

            <span
                class="product-emoji fallback-emoji"
                style="display:none;"
            >
                🛍️
            </span>

        `;

    } else {

        imageHTML = `

            <span class="product-emoji">
                🛍️
            </span>

        `;

    }



    // ---------------------------------------------------------
    // CARD
    // ---------------------------------------------------------

    card.innerHTML = `

        <div class="product-image">

            ${imageHTML}

            <span class="ar-badge">
                AR
            </span>

        </div>


        <div class="product-info">

            <p class="category">
                ${escapeHTML(category)}
            </p>


            <h3>
                ${escapeHTML(name)}
            </h3>


            <p class="product-description">
                ${escapeHTML(description)}
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


    // Animation delay

    card.style.animationDelay =
        `${0.15 + index * 0.15}s`;


    return card;

}



// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        String(value ?? "");


    return div.innerHTML;

}



// =========================================================
// ADD TO CART BUTTONS
// =========================================================

function attachCartButtons() {

    const addButtons =
        document.querySelectorAll(
            "[data-product-action='cart']"
        );


    addButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();


                    const card =
                        this.closest(
                            ".product-card"
                        );


                    if (!card) {
                        return;
                    }


                    const productId =
                        card.dataset.product;


                    const product =
                        products.find(
                            item =>
                                String(
                                    item.id
                                ) ===
                                String(
                                    productId
                                )
                        );


                    if (!product) {

                        console.error(
                            "Product not found:",
                            productId
                        );

                        return;

                    }


                    addToCart(
                        product,
                        this
                    );

                }
            );

        }
    );

}



// =========================================================
// ADD PRODUCT TO CART
// =========================================================

function addToCart(
    product,
    button
) {

    const productId =
        product.id;


    const existingItem =
        cart.find(
            item =>
                String(item.id) ===
                String(productId)
        );


    if (existingItem) {

        existingItem.quantity += 1;

    } else {

        cart.push({

            id:
                product.id,

            name:
                product.name ||
                product.product_name,

            price:
                Number(
                    product.price || 0
                ),

            image:
                product.image ||
                product.image_url ||
                product.product_image ||
                "",

            category:
                product.category ||
                product.category_name ||
                "",

            quantity:
                1

        });

    }


    saveCart();

    updateCart();


    // =====================================================
    // BUTTON FEEDBACK
    // =====================================================

    if (button) {

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

}



// =========================================================
// SAVE CART
// =========================================================

function saveCart() {

    localStorage.setItem(
        "arEcommerceCart",
        JSON.stringify(cart)
    );

}



// =========================================================
// UPDATE CART
// =========================================================

function updateCart() {

    saveCart();


    // -----------------------------------------------------
    // COUNT
    // -----------------------------------------------------

    let count = 0;


    cart.forEach(
        item => {

            count +=
                Number(
                    item.quantity
                ) || 0;

        }
    );


    if (cartCount) {

        cartCount.textContent =
            count;

    }


    // -----------------------------------------------------
    // EMPTY
    // -----------------------------------------------------

    if (
        !cartItems
    ) {
        return;
    }


    if (
        cart.length === 0
    ) {

        cartItems.innerHTML = `

            <p class="cart-empty">
                Your cart is empty.
            </p>

        `;

        cartTotal.textContent =
            "$0.00";

        return;

    }


    // -----------------------------------------------------
    // ITEMS
    // -----------------------------------------------------

    cartItems.innerHTML = "";


    let total = 0;


    cart.forEach(
        item => {

            const price =
                Number(
                    item.price
                ) || 0;


            const quantity =
                Number(
                    item.quantity
                ) || 1;


            const itemTotal =
                price * quantity;


            total +=
                itemTotal;


            const cartItem =
                document.createElement(
                    "div"
                );


            cartItem.className =
                "cart-item";


            const image =
                item.image
                    ? `<img
                        src="${escapeHTML(item.image)}"
                        alt="${escapeHTML(item.name)}"
                        class="cart-product-image"
                    >`
                    : `<span>🛍️</span>`;


            cartItem.innerHTML = `

                <div class="cart-item-image">

                    ${image}

                </div>


                <div class="cart-item-info">

                    <h4>
                        ${escapeHTML(
                            item.name
                        )}
                    </h4>

                    <p>
                        $${price.toFixed(2)}
                        ×
                        ${quantity}
                    </p>

                </div>


                <button
                    class="remove-cart-item"
                    data-id="${item.id}"
                    type="button"
                >
                    Remove
                </button>

            `;


            cartItems.appendChild(
                cartItem
            );

        }
    );


    cartTotal.textContent =
        `$${total.toFixed(2)}`;


    attachRemoveButtons();

}



// =========================================================
// REMOVE CART ITEM
// =========================================================

function attachRemoveButtons() {

    const buttons =
        document.querySelectorAll(
            ".remove-cart-item"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    const id =
                        this.dataset.id;


                    cart =
                        cart.filter(
                            item =>
                                String(
                                    item.id
                                ) !==
                                String(
                                    id
                                )
                        );


                    updateCart();

                }
            );

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

            cartModal.classList.add(
                "active"
            );

        }
    );

}



// =========================================================
// CLOSE CART
// =========================================================

if (cartClose) {

    cartClose.addEventListener(
        "click",
        () => {

            cartModal.classList.remove(
                "active"
            );

        }
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

                cartModal.classList.remove(
                    "active"
                );

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
        () => {

            if (
                cart.length === 0
            ) {

                alert(
                    "Your cart is empty."
                );

                return;

            }


            window.location.href =
                "/checkout";

        }
    );

}



// =========================================================
// INITIALIZE
// =========================================================

updateCart();

loadProducts();