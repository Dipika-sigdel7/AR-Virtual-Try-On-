const buyButtons = document.querySelectorAll(".buy-btn");

buyButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        const productName =
            this.parentElement.querySelector("h2").textContent;

        alert(productName + " added to your cart!");

    });

});