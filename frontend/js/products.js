// =========================================================
// PRODUCTS PAGE
// DYNAMIC ADMIN PRODUCTS
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

        productsList.forEach(
            product => {

                window.productsById[
                    String(product.id)
                ] = product;

            }
        );


        // =================================================
        // GROUP BY CATEGORY
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
        // CLEAR
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
        // CONNECT BUTTONS
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
    // CARD
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
                    // USE SAME CART AS HOME
                    // =================================================

                    if (
                        typeof window.addToCart ===
                        "function"
                    ) {

                        window.addToCart(
                            product
                        );

                    }


                    // =================================================
                    // BUTTON FEEDBACK
                    // =================================================

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
// LOAD
// =========================================================

loadProducts();