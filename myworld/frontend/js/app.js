
// ==========================
// PRODUCT DATA
// ==========================

const products = {

  smartphone: {
    name: "Smartphone",
    category: "Electronics",
    price: 499,
    image: "📱",
    rating: "4.8 / 5"
  },

  sneakers: {
    name: "Premium Sneakers",
    category: "Fashion",
    price: 99,
    image: "👟",
    rating: "4.7 / 5"
  },

  smartwatch: {
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


// Cart elements

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

    // Prevent product modal when
    // Add to Cart is clicked

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


    // Update image

    if (modalProductImage) {

      modalProductImage.textContent =
        product.image;

    }


    // Update name

    if (modalProductName) {

      modalProductName.textContent =
        product.name;

    }


    // Update category

    if (modalProductCategory) {

      modalProductCategory.textContent =
        product.category;

    }


    // Update price

    if (modalProductPrice) {

      modalProductPrice.textContent =
        `$${product.price}`;

    }


    // Update rating

    if (modalRating) {

      modalRating.textContent =
        product.rating;

    }


    // Open modal

    productModal.classList.add("active");

    document.body.style.overflow =
      "hidden";

  });

});


// ==========================
// CLOSE PRODUCT MODAL
// ==========================

function closeProductModal() {

  productModal.classList.remove(
    "active"
  );

  document.body.style.overflow = "";

}


modalClose.addEventListener(
  "click",
  closeProductModal
);


// ==========================
// CLOSE PRODUCT MODAL
// CLICK OUTSIDE
// ==========================

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


exploreProducts.addEventListener(
  "click",
  () => {

    document
      .querySelector("#products")
      .scrollIntoView({
        behavior: "smooth"
      });

  }
);


// ==========================
// TRY AR BUTTON
// ==========================

const tryArButton =
  document.querySelector(
    "#try-ar-btn"
  );


tryArButton.addEventListener(
  "click",
  () => {

    document
      .querySelector("#products")
      .scrollIntoView({
        behavior: "smooth"
      });

  }
);


// ==========================
// VIEW ALL
// ==========================

const viewAllButton =
  document.querySelector(
    "#view-all"
  );


viewAllButton.addEventListener(
  "click",
  () => {

    document
      .querySelector("#products")
      .scrollIntoView({
        behavior: "smooth"
      });

  }
);


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


      const card =
        button.closest(".product-card");


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


      const product =
        products[productId];


      if (!product) {
        return;
      }


      cart.push(product);


      updateCart();


      // Button feedback

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

  // Update cart count

  cartCount.textContent =
    cart.length;


  // Empty cart

  if (cart.length === 0) {

    cartItems.innerHTML = `
      <p class="empty-cart">
        Your cart is empty.
      </p>
    `;

    cartTotal.textContent =
      "$0";

    return;
  }


  // Calculate total

  const total =
    cart.reduce(
      (sum, product) =>
        sum + product.price,
      0
    );


  cartTotal.textContent =
    `$${total}`;


  // Display cart items

  cartItems.innerHTML = "";


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
              $${product.price}
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


      cartItems.appendChild(item);

    }
  );


  // Remove buttons

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


          cart.splice(index, 1);


          updateCart();

        }
      );

    }
  );

}


// ==========================
// OPEN CART
// ==========================

cartButton.addEventListener(
  "click",
  () => {

    updateCart();

    cartModal.classList.add(
      "active"
    );

    document.body.style.overflow =
      "hidden";

  }
);


// ==========================
// CLOSE CART
// ==========================

function closeCartModal() {

  cartModal.classList.remove(
    "active"
  );

  document.body.style.overflow = "";

}


cartClose.addEventListener(
  "click",
  closeCartModal
);


// ==========================
// CLICK OUTSIDE CART
// ==========================

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


// ==========================
// CHECKOUT
// ==========================

checkoutButton.addEventListener(
  "click",
  () => {

    if (cart.length === 0) {

      alert(
        "Your cart is empty."
      );

      return;

    }


    alert(
      "Checkout system will be connected to the backend."
    );

  }
);


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

