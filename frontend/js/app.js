// ==========================
// PRODUCT DATA
// ==========================

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


// ==========================
// CART
// ==========================

let cart = [];


// ==========================
// ELEMENTS
// ==========================

const productModal =
  document.querySelector("#product-modal");

const modalClose =
  document.querySelector("#modal-close");

const modalProductImage =
  document.querySelector("#modal-product-image");

const modalProductName =
  document.querySelector("#modal-product-name");

const modalProductCategory =
  document.querySelector("#modal-product-category");

const modalProductPrice =
  document.querySelector("#modal-product-price");

const modalRating =
  document.querySelector("#modal-rating");


// ==========================
// CART ELEMENTS
// ==========================

const cartButton =
  document.querySelector("#cart-btn");

const cartCount =
  document.querySelector("#cart-count");

const cartModal =
  document.querySelector("#cart-modal");

const cartClose =
  document.querySelector("#cart-close");

const cartItems =
  document.querySelector("#cart-items");

const cartTotal =
  document.querySelector("#cart-total");

const checkoutButton =
  document.querySelector("#checkout-btn");


// ==========================
// OPEN PRODUCT MODAL
// ==========================

const productCards =
  document.querySelectorAll(".product-card");


productCards.forEach((card) => {

  card.addEventListener("click", (event) => {

    // Do not open product modal
    // when Add to Cart is clicked

    if (
      event.target.closest(
        "[data-product-action='cart']"
      )
    ) {
      return;
    }


    const productId =
      card.getAttribute("data-product");


    if (!productId) {
      return;
    }


    const product =
      products[productId];


    if (!product) {
      return;
    }


    // --------------------------
    // IMAGE
    // --------------------------

    if (modalProductImage) {

      modalProductImage.textContent =
        product.image;

    }


    // --------------------------
    // NAME
    // --------------------------

    if (modalProductName) {

      modalProductName.textContent =
        product.name;

    }


    // --------------------------
    // CATEGORY
    // --------------------------

    if (modalProductCategory) {

      modalProductCategory.textContent =
        product.category;

    }


    // --------------------------
    // PRICE
    // --------------------------

    if (modalProductPrice) {

      modalProductPrice.textContent =
        `$${product.price}`;

    }


    // --------------------------
    // RATING
    // --------------------------

    if (modalRating) {

      modalRating.textContent =
        product.rating;

    }


    // --------------------------
    // OPEN MODAL
    // --------------------------

    if (productModal) {

      productModal.classList.add("active");

      document.body.style.overflow =
        "hidden";

    }

  });

});


// ==========================
// CLOSE PRODUCT MODAL
// ==========================

function closeProductModal() {

  if (productModal) {

    productModal.classList.remove(
      "active"
    );

  }

  document.body.style.overflow = "";

}


if (modalClose) {

  modalClose.addEventListener(
    "click",
    closeProductModal
  );

}


// ==========================
// CLOSE PRODUCT MODAL
// CLICK OUTSIDE
// ==========================

if (productModal) {

  productModal.addEventListener(
    "click",
    (event) => {

      if (
        event.target === productModal
      ) {

        closeProductModal();

      }

    }
  );

}


// ==========================
// ESCAPE KEY
// ==========================

document.addEventListener(
  "keydown",
  (event) => {

    if (event.key === "Escape") {

      closeProductModal();

      closeCartModal();

    }

  }
);


// ==========================
// EXPLORE PRODUCTS
// ==========================

const exploreProducts =
  document.querySelector(
    "#explore-products"
  );


if (exploreProducts) {

  exploreProducts.addEventListener(
    "click",
    () => {

      const productsSection =
        document.querySelector("#products");

      if (productsSection) {

        productsSection.scrollIntoView({
          behavior: "smooth"
        });

      }

    }
  );

}


// ==========================
// TRY AR BUTTON
// ==========================

const tryArButton =
  document.querySelector(
    "#try-ar-btn"
  );


if (tryArButton) {

  tryArButton.addEventListener(
    "click",
    () => {

      const productsSection =
        document.querySelector("#products");

      if (productsSection) {

        productsSection.scrollIntoView({
          behavior: "smooth"
        });

      }

    }
  );

}


// ==========================
// VIEW ALL
// ==========================

const viewAllButton =
  document.querySelector(
    "#view-all"
  );


if (viewAllButton) {

  viewAllButton.addEventListener(
    "click",
    () => {

      const productsSection =
        document.querySelector("#products");

      if (productsSection) {

        productsSection.scrollIntoView({
          behavior: "smooth"
        });

      }

    }
  );

}


// ==========================
// ADD TO CART
// ==========================

const addButtons =
  document.querySelectorAll(
    "[data-product-action='cart']"
  );


addButtons.forEach((button) => {

  button.addEventListener(
    "click",
    (event) => {

      event.stopPropagation();


      // --------------------------
      // GET PRODUCT CARD
      // --------------------------

      const card =
        button.closest(".product-card");


      if (!card) {
        return;
      }


      // --------------------------
      // GET PRODUCT ID
      // --------------------------

      const productId =
        card.getAttribute(
          "data-product"
        );


      if (!productId) {
        return;
      }


      // --------------------------
      // GET PRODUCT
      // --------------------------

      const product =
        products[productId];


      if (!product) {
        return;
      }


      // --------------------------
      // CHECK EXISTING CART ITEM
      // --------------------------

      const existingItem =
        cart.find(
          item => item.id === product.id
        );


      // --------------------------
      // INCREASE QUANTITY
      // --------------------------

      if (existingItem) {

        existingItem.quantity += 1;

      }


      // --------------------------
      // ADD NEW PRODUCT
      // --------------------------

      else {

        cart.push({

          ...product,

          quantity: 1

        });

      }


      // --------------------------
      // UPDATE CART
      // --------------------------

      updateCart();


      // --------------------------
      // BUTTON FEEDBACK
      // --------------------------

      const originalText =
        button.textContent;


      button.textContent =
        "Added ✓";


      button.style.background =
        "#00a8cc";


      setTimeout(() => {

        button.textContent =
          originalText;

        button.style.background =
          "";

      }, 1000);

    }
  );

});


// ==========================
// UPDATE CART
// ==========================

function updateCart() {

  // --------------------------
  // TOTAL QUANTITY
  // --------------------------

  const totalQuantity =
    cart.reduce(
      (sum, product) =>
        sum + product.quantity,
      0
    );


  if (cartCount) {

    cartCount.textContent =
      totalQuantity;

  }


  // --------------------------
  // EMPTY CART
  // --------------------------

  if (cart.length === 0) {

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


  // --------------------------
  // CALCULATE TOTAL
  // --------------------------

  const total =
    cart.reduce(
      (sum, product) =>
        sum +
        (
          Number(product.price) *
          Number(product.quantity)
        ),
      0
    );


  if (cartTotal) {

    cartTotal.textContent =
      `$${total.toFixed(2)}`;

  }


  // --------------------------
  // CLEAR CART DISPLAY
  // --------------------------

  if (cartItems) {

    cartItems.innerHTML = "";

  }


  // --------------------------
  // DISPLAY CART ITEMS
  // --------------------------

  cart.forEach(
    (product, index) => {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "cart-item";


      item.innerHTML = `

        <div class="cart-item-info">

          <div class="cart-item-image">
            ${product.image}
          </div>

          <div>

            <div class="cart-item-name">
              ${product.name}
            </div>

            <div class="cart-item-price">
              $${Number(product.price).toFixed(2)}
              ×
              ${product.quantity}
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

        cartItems.appendChild(item);

      }

    }
  );


  // --------------------------
  // REMOVE CART ITEMS
  // --------------------------

  const removeButtons =
    document.querySelectorAll(
      ".remove-cart-item"
    );


  removeButtons.forEach(
    (button) => {

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
            Number.isInteger(index)
          ) {

            cart.splice(
              index,
              1
            );

          }


          updateCart();

        }
      );

    }
  );

}


// ==========================
// OPEN CART
// ==========================

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


// ==========================
// CLOSE CART
// ==========================

function closeCartModal() {

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
    closeCartModal
  );

}


// ==========================
// CLICK OUTSIDE CART
// ==========================

if (cartModal) {

  cartModal.addEventListener(
    "click",
    (event) => {

      if (
        event.target === cartModal
      ) {

        closeCartModal();

      }

    }
  );

}


// ==========================
// CHECKOUT
// ==========================

if (checkoutButton) {

  checkoutButton.addEventListener(
    "click",
    async () => {

      // --------------------------
      // CHECK EMPTY CART
      // --------------------------

      if (cart.length === 0) {

        alert(
          "Your cart is empty."
        );

        return;

      }


      // --------------------------
      // GET USER ID
      // --------------------------

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


      // --------------------------
      // GET SHIPPING ADDRESS
      // --------------------------

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


      // --------------------------
      // PREPARE CART ITEMS
      // --------------------------

      const items =
        cart.map(
          (product) => {

            return {

              product_id:
                product.id,

              quantity:
                product.quantity

            };

          }
        );


      try {

        // --------------------------
        // SEND CHECKOUT REQUEST
        // --------------------------

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
                    Number(userId),

                  shipping_address:
                    shippingAddress,

                  items:
                    items

                })

            }
          );


        // --------------------------
        // GET SERVER RESPONSE
        // --------------------------

        const data =
          await response.json();


        console.log(
          "CHECKOUT RESPONSE:",
          data
        );


        // --------------------------
        // CHECK ERROR
        // --------------------------

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


        // --------------------------
        // SUCCESS
        // --------------------------

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


        // --------------------------
        // CLEAR CART
        // --------------------------

        cart = [];


        updateCart();


        // --------------------------
        // CLOSE CART
        // --------------------------

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


// ==========================
// NAVIGATION ACTIVE LINK
// ==========================

const navLinks =
  document.querySelectorAll(
    ".navbar nav a"
  );


navLinks.forEach((link) => {

  link.addEventListener(
    "click",
    () => {

      navLinks.forEach(
        (item) => {

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

});


// ==========================
// INITIAL CART
// ==========================

updateCart();