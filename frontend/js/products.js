// =========================================================
// PRODUCTS PAGE
// DYNAMIC ADMIN PRODUCTS
// =========================================================


// =========================================================
// ELEMENTS
// =========================================================

const categoriesContainer =
    document.getElementById(
        "categories-container"
    );


// =========================================================
// LOAD PRODUCTS
// =========================================================

async function loadProducts() {

    try {

        categoriesContainer.innerHTML = `

            <div class="loading-products">

                Loading products...

            </div>

        `;


        const response =
            await fetch(
                "/api/products"
            );


        const data =
            await response.json();


        console.log(
            "Products API:",
            data
        );


        // =================================================
        // API FAILED
        // =================================================

        if (
            !response.ok ||
            !data.success
        ) {

            categoriesContainer.innerHTML = `

                <div class="products-message">

                    No products available.

                </div>

            `;

            return;

        }


        // =================================================
        // PRODUCTS LIST
        // =================================================

        const productsList =
            Array.isArray(data.products)
                ? data.products
                : [];


        // =================================================
        // NO PRODUCTS
        // =================================================

        if (
            productsList.length === 0
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
        // SAVE PRODUCTS GLOBALLY
        // =================================================

        if (
            !window.productsById
        ) {

            window.productsById = {};

        }


        productsList.forEach(
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


        productsList.forEach(
            product => {

                const categoryName =
                    product.category_name ||
                    product.category ||
                    "Uncategorized";


                if (
                    !categories[
                        categoryName
                    ]
                ) {

                    categories[
                        categoryName
                    ] = [];

                }


                categories[
                    categoryName
                ].push(product);

            }
        );


        // =================================================
        // CLEAR CONTAINER
        // =================================================

        categoriesContainer.innerHTML =
            "";


        // =================================================
        // DISPLAY CATEGORIES
        // =================================================

        Object.keys(
            categories
        ).forEach(
            categoryName => {

                const products =
                    categories[
                        categoryName
                    ];


                // =================================================
                // CATEGORY SECTION
                // =================================================

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


                // =================================================
                // PRODUCT GRID
                // =================================================

                const grid =
                    document.createElement(
                        "div"
                    );


                grid.className =
                    "product-grid";


                // =================================================
                // CREATE CARDS
                // =================================================

                products.forEach(
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


        // =================================================
        // CONNECT CART BUTTONS
        // =================================================

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


// =========================================================
// CREATE PRODUCT CARD
// =========================================================

function createProductCard(
    product
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "product-card";


    card.setAttribute(
        "data-product",
        product.id
    );


    // =====================================================
    // IMAGE
    // =====================================================

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
    // PRODUCT CARD
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


// =========================================================
// CHECK LOGIN STATUS
// =========================================================

async function checkUserLoggedIn() {

    try {

        const response =
            await fetch(
                "/api/auth/me",
                {
                    method: "GET",

                    credentials: "include"
                }
            );


        if (
            !response.ok
        ) {

            return false;

        }


        const data =
            await response.json();


        return (
            data.success === true &&
            data.user
        );

    }

    catch (error) {

        console.error(
            "LOGIN CHECK ERROR:",
            error
        );

        return false;

    }

}


// =========================================================
// CONNECT CART BUTTONS
// =========================================================

function connectCartButtons() {

    const addButtons =
        document.querySelectorAll(
            "[data-product-action='cart']"
        );


    addButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                async event => {

                    event.preventDefault();

                    event.stopPropagation();


                    // =================================================
                    // PREVENT DOUBLE CLICK
                    // =================================================

                    if (
                        button.disabled
                    ) {

                        return;

                    }


                    // =================================================
                    // CHECK USER LOGIN
                    // =================================================

                    const loggedIn =
                        await checkUserLoggedIn();


                    // =================================================
                    // NOT LOGGED IN
                    // =================================================

                    if (
                        !loggedIn
                    ) {

                        alert(
                            "Please login to add products to your cart."
                        );


                        /*
                         * Remember the current page.
                         * After successful login, the user
                         * can be returned here.
                         */

                        sessionStorage.setItem(
                            "loginRedirect",
                            window.location.pathname +
                            window.location.search
                        );


                        window.location.href =
                            "/login";


                        return;

                    }


                    // =================================================
                    // FIND PRODUCT CARD
                    // =================================================

                    const card =
                        button.closest(
                            ".product-card"
                        );


                    if (
                        !card
                    ) {

                        return;

                    }


                    // =================================================
                    // GET PRODUCT ID
                    // =================================================

                    const productId =
                        card.getAttribute(
                            "data-product"
                        );


                    // =================================================
                    // GET PRODUCT
                    // =================================================

                    const product =
                        window.productsById[
                            String(productId)
                        ];


                    if (
                        !product
                    ) {

                        console.error(
                            "Product not found:",
                            productId
                        );

                        return;

                    }


                    // =================================================
                    // CHECK CART FUNCTION
                    // =================================================

                    if (
                        typeof window.addToCart !==
                        "function"
                    ) {

                        console.error(
                            "window.addToCart() is not available."
                        );

                        alert(
                            "Cart is currently unavailable."
                        );

                        return;

                    }


                    // =================================================
                    // DISABLE BUTTON WHILE ADDING
                    // =================================================

                    button.disabled = true;

                    const originalText =
                        button.textContent.trim();


                    button.textContent =
                        "Adding...";


                    // =================================================
                    // ADD TO CART
                    // =================================================

                    try {

                        const result =
                            await window.addToCart(
                                product
                            );


                        // =================================================
                        // CART ADD FAILED
                        // =================================================

                        if (
                            result === false
                        ) {

                            button.disabled =
                                false;

                            button.textContent =
                                originalText;

                            return;

                        }


                        // =================================================
                        // SUCCESS
                        // =================================================

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

                                button.disabled =
                                    false;

                            },
                            1000
                        );


                    }

                    catch (error) {

                        console.error(
                            "ADD TO CART ERROR:",
                            error
                        );


                        button.disabled =
                            false;

                        button.textContent =
                            originalText;


                        alert(
                            "Unable to add product to cart."
                        );

                    }

                }
            );

        }
    );

}


// =========================================================
// HTML ESCAPE
// =========================================================

function escapeHTML(
    value
) {

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

function escapeAttribute(
    value
) {

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
// LOAD PRODUCTS
// =========================================================

loadProducts();