
// =========================================================
// PRODUCT DETAILS PAGE
// =========================================================


// =========================================================
// GET PRODUCT ID
// =========================================================

const params =
    new URLSearchParams(window.location.search);

const productId =
    params.get("id");


// =========================================================
// ELEMENTS
// =========================================================

const loading =
    document.getElementById("loading");

const errorMessage =
    document.getElementById("errorMessage");

const productDetails =
    document.getElementById("productDetails");

const productImage =
    document.getElementById("productImage");

const productName =
    document.getElementById("productName");

const productCategory =
    document.getElementById("productCategory");

const productRating =
    document.getElementById("productRating");

const productPrice =
    document.getElementById("productPrice");

const productDescription =
    document.getElementById("productDescription");

const productStock =
    document.getElementById("productStock");

const quantity =
    document.getElementById("quantity");

const decreaseBtn =
    document.getElementById("decreaseBtn");

const increaseBtn =
    document.getElementById("increaseBtn");

const addToCartBtn =
    document.getElementById("addToCartBtn");

const buyNowBtn =
    document.getElementById("buyNowBtn");

const tryOnBtn =
    document.getElementById("tryOnBtn");


// =========================================================
// START
// =========================================================

if (!productId) {

    showError();

} else {

    loadProduct();

}


// =========================================================
// LOAD PRODUCT
// =========================================================

async function loadProduct() {

    try {

        const response =
            await fetch(
                `/api/products/${productId}`
            );


        const data =
            await response.json();


        console.log(
            "Product response:",
            data
        );


        if (
            !response.ok ||
            !data.success ||
            !data.product
        ) {

            showError();

            return;

        }


        displayProduct(
            data.product
        );


    } catch (error) {

        console.error(
            "LOAD PRODUCT ERROR:",
            error
        );

        showError();

    }

}


// =========================================================
// DISPLAY PRODUCT
// =========================================================

function displayProduct(product) {


    // =============================================
    // NAME
    // =============================================

    productName.textContent =
        product.name ||
        "Product";


    // =============================================
    // CATEGORY
    // =============================================

    productCategory.textContent =
        product.category_name ||
        "Uncategorized";


    // =============================================
    // PRICE
    // =============================================

    productPrice.textContent =
        `Rs. ${Number(product.price || 0).toLocaleString()}`;


    // =============================================
    // RATING
    // =============================================

    const rating =
        Number(product.rating || 0);


    productRating.textContent =
        `★ ${rating.toFixed(1)}`;


    // =============================================
    // DESCRIPTION
    // =============================================

    productDescription.textContent =
        product.description ||
        "No description available.";


    // =============================================
    // STOCK
    // =============================================

    const stock =
        Number(product.stock || 0);


    if (
        product.is_available &&
        stock > 0
    ) {

        productStock.textContent =
            `${stock} available`;

        productStock.style.color =
            "green";


        addToCartBtn.disabled =
            false;

        buyNowBtn.disabled =
            false;

    } else {

        productStock.textContent =
            "Out of stock";

        productStock.style.color =
            "red";


        addToCartBtn.disabled =
            true;

        buyNowBtn.disabled =
            true;

    }


    // =============================================
    // IMAGE
    // =============================================

    /*
       Your current product API does not return
       an image field.

       So this uses a placeholder for now.
    */

    productImage.src =
        "/images/product-placeholder.png";


    productImage.alt =
        product.name;


    // =============================================
    // SHOW PRODUCT
    // =============================================

    loading.style.display =
        "none";

    errorMessage.style.display =
        "none";

    productDetails.style.display =
        "grid";

}


// =========================================================
// ERROR
// =========================================================

function showError() {

    loading.style.display =
        "none";

    productDetails.style.display =
        "none";

    errorMessage.style.display =
        "block";

}


// =========================================================
// DECREASE
// =========================================================

decreaseBtn.addEventListener(
    "click",
    () => {

        let value =
            Number(quantity.value);


        if (value > 1) {

            quantity.value =
                value - 1;

        }

    }
);


// =========================================================
// INCREASE
// =========================================================

increaseBtn.addEventListener(
    "click",
    () => {

        let value =
            Number(quantity.value);


        quantity.value =
            value + 1;

    }
);


// =========================================================
// ADD TO CART
// =========================================================

addToCartBtn.addEventListener(
    "click",
    () => {

        const selectedQuantity =
            Number(quantity.value);


        console.log({

            product_id: productId,

            quantity:
                selectedQuantity

        });


        alert(
            "Product added to cart!"
        );

    }
);


// =========================================================
// BUY NOW
// =========================================================

buyNowBtn.addEventListener(
    "click",
    () => {

        const selectedQuantity =
            Number(quantity.value);


        window.location.href =
            `/checkout?productId=${productId}&quantity=${selectedQuantity}`;

    }
);


// =========================================================
// AR TRY ON
// =========================================================

tryOnBtn.addEventListener(
    "click",
    () => {

        window.location.href =
            `/ar-try-on?productId=${productId}`;

    }
);
