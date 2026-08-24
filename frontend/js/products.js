// ==========================
// ADD TO CART
// ==========================

const addButtons = document.querySelectorAll(
  "[data-product-action='cart']"
);

addButtons.forEach((button) => {

  button.addEventListener("click", function(event) {

    // Stop the product card click event
    event.stopPropagation();

    // Find the product card
    const card = this.closest(".product-card");

    if (!card) {
      return;
    }

    // Get product ID
    const productId = card.getAttribute("data-product");

    if (!productId) {
      return;
    }

    // Get product
    const product = products[productId];

    if (!product) {
      console.error("Product not found:", productId);
      return;
    }

    // Check if product already exists in cart
    const existingItem = cart.find(
      item => item.id === product.id
    );

    if (existingItem) {

      // Increase quantity
      existingItem.quantity += 1;

    } else {

      // Add new product
      cart.push({
        ...product,
        quantity: 1
      });

    }

    // Update cart
    updateCart();

    // ==========================
    // BUTTON FEEDBACK
    // ==========================

    const originalText = this.textContent;

    this.textContent = "Added ✓";

    this.classList.add("added");

    this.disabled = true;

    setTimeout(() => {

      this.textContent = originalText;

      this.classList.remove("added");

      this.disabled = false;

    }, 1200);

  });

});