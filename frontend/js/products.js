// =========================================================
// PRODUCTS
// =========================================================

const products = {

    smartphone: {
        id: "smartphone",
        name: "Smartphone",
        price: 499,
        category: "Electronics",
        description:
            "Modern smartphone with powerful performance and stylish design.",
        image: "📱"
    },

    sneakers: {
        id: "sneakers",
        name: "Premium Sneakers",
        price: 99,
        category: "Fashion",
        description:
            "Comfortable and stylish sneakers designed for everyday use.",
        image: "👟"
    },

    smartwatch: {
        id: "smartwatch",
        name: "Smart Watch",
        price: 149,
        category: "Accessories",
        description:
            "Track your activities and stay connected with a modern smart watch.",
        image: "⌚"
    },

    headphones: {
        id: "headphones",
        name: "Wireless Headphones",
        price: 129,
        category: "Electronics",
        description:
            "Enjoy high-quality sound with comfortable wireless headphones.",
        image: "🎧"
    }

};


// =========================================================
// CART
// =========================================================

// Use existing cart if your main script already created it.
// Otherwise load the saved cart from localStorage.

let cart = window.cart || JSON.parse(
    localStorage.getItem("cart") || "[]"
);


// =========================================================
// SAVE CART
// =========================================================

function saveCart() {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

}


// =========================================================
// UPDATE CART
// =========================================================

function updateCart() {

    // Save cart
    saveCart();


    // Update cart count if it exists
    const cartCount =
        document.querySelector(".cart-count");

    if (cartCount) {

        const totalQuantity =
            cart.reduce(
                (total, item) =>
                    total + item.quantity,
                0
            );

        cartCount.textContent =
            totalQuantity;

    }


    // If your existing project has its own
    // updateCart function, don't break it.
    if (
        window.updateCartUI &&
        typeof window.updateCartUI === "function"
    ) {

        window.updateCartUI(cart);

    }

}


// =========================================================
// ADD TO CART
// =========================================================

// Event delegation is used here.
// This works even if products are added dynamically.

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                "[data-product-action='cart']"
            );


        // Not an Add to Cart button
        if (!button) {
            return;
        }


        // Stop product card click event
        event.preventDefault();
        event.stopPropagation();


        // Find product card
        const card =
            button.closest(".product-card");


        if (!card) {

            console.error(
                "Product card not found."
            );

            return;
        }


        // Get product ID
        const productId =
            card.getAttribute(
                "data-product"
            );


        if (!productId) {

            console.error(
                "data-product is missing."
            );

            return;
        }


        // Get product
        const product =
            products[productId];


        if (!product) {

            console.error(
                "Product not found:",
                productId
            );

            return;
        }


        // =====================================================
        // CHECK EXISTING CART ITEM
        // =====================================================

        const existingItem =
            cart.find(
                item =>
                    String(item.id) ===
                    String(product.id)
            );


        if (existingItem) {

            existingItem.quantity += 1;

        } else {

            cart.push({

                ...product,

                quantity: 1

            });

        }


        // =====================================================
        // UPDATE CART
        // =====================================================

        updateCart();


        // =====================================================
        // BUTTON FEEDBACK
        // =====================================================

        const originalText =
            button.textContent;


        button.textContent =
            "Added ✓";


        button.classList.add(
            "added"
        );


        button.disabled = true;


        setTimeout(
            () => {

                button.textContent =
                    originalText;

                button.classList.remove(
                    "added"
                );

                button.disabled = false;

            },
            1200
        );

    }
);