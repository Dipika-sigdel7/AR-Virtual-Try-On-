
// =========================================================
// AR E-COMMERCE
// PRODUCT DETAILS PAGE
// PRODUCT + CART + REVIEWS
// =========================================================


// =========================================================
// GLOBAL VARIABLES
// =========================================================

let currentProduct = null;
let currentUser = null;
let userLoggedIn = false;
let selectedRating = 0;


// =========================================================
// ELEMENTS
// =========================================================

const loading =
    document.getElementById("loading");

const errorMessage =
    document.getElementById("errorMessage");

const productDetails =
    document.getElementById("productDetails");

const reviewsSection =
    document.getElementById("reviewsSection");

const productImage =
    document.getElementById("productImage");

const productCategory =
    document.getElementById("productCategory");

const productName =
    document.getElementById("productName");

const productRating =
    document.getElementById("productRating");

const productPrice =
    document.getElementById("productPrice");

const productDescription =
    document.getElementById("productDescription");

const productStock =
    document.getElementById("productStock");

const quantityInput =
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

const loginNav =
    document.getElementById("loginNav");


// =========================================================
// REVIEW ELEMENTS
// =========================================================

const writeReviewBtn =
    document.getElementById("writeReviewBtn");

const reviewFormContainer =
    document.getElementById("reviewFormContainer");

const reviewForm =
    document.getElementById("reviewForm");

const reviewRating =
    document.getElementById("reviewRating");

const reviewText =
    document.getElementById("reviewText");

const reviewImage =
    document.getElementById("reviewImage");

const imagePreview =
    document.getElementById("imagePreview");

const reviewsList =
    document.getElementById("reviewsList");

const cancelReviewBtn =
    document.getElementById("cancelReviewBtn");

const submitReviewBtn =
    document.getElementById("submitReviewBtn");


// =========================================================
// LOGIN MODAL
// =========================================================

const loginModal =
    document.getElementById("loginModal");

const closeLoginModal =
    document.getElementById("closeLoginModal");

const goToLoginBtn =
    document.getElementById("goToLoginBtn");

const continueShoppingBtn =
    document.getElementById("continueShoppingBtn");


// =========================================================
// GET PRODUCT ID
// =========================================================

function getProductId() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get("id");
}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


// =========================================================
// ESCAPE ATTRIBUTE
// =========================================================

function escapeAttribute(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}


// =========================================================
// CHECK LOGIN
// =========================================================

async function checkUserLogin() {

    try {

        const response =
            await fetch(
                "/api/users/me",
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store"
                }
            );


        const data =
            await response.json();


        if (
            response.ok &&
            data.success === true &&
            data.loggedIn === true &&
            data.user
        ) {

            userLoggedIn = true;

            currentUser =
                data.user;


            // Login button should ALWAYS
            // remain Login in navigation

            if (loginNav) {

                loginNav.textContent =
                    "Login";

            }


            return true;
        }


        userLoggedIn = false;
        currentUser = null;


        if (loginNav) {

            loginNav.textContent =
                "Login";

        }


        return false;

    }

    catch (error) {

        console.error(
            "LOGIN CHECK ERROR:",
            error
        );


        userLoggedIn = false;
        currentUser = null;


        if (loginNav) {

            loginNav.textContent =
                "Login";

        }


        return false;
    }
}


// =========================================================
// LOAD PRODUCT
// =========================================================

async function loadProduct() {

    const productId =
        getProductId();


    // -----------------------------------------------------
    // CHECK PRODUCT ID
    // -----------------------------------------------------

    if (!productId) {

        console.error(
            "No product ID found in URL."
        );

        showError();

        return false;
    }


    try {

        if (loading) {

            loading.style.display =
                "block";

        }


        if (errorMessage) {

            errorMessage.style.display =
                "none";

        }


        if (productDetails) {

            productDetails.style.display =
                "none";

        }


        const response =
            await fetch(
                `/api/products/${encodeURIComponent(
                    productId
                )}`,
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store"
                }
            );


        const data =
            await response.json();


        console.log(
            "PRODUCT API RESPONSE:",
            data
        );


        if (
            !response.ok ||
            data.success !== true ||
            !data.product
        ) {

            console.error(
                "Product API failed:",
                data
            );

            showError();

            return false;
        }


        currentProduct =
            data.product;


        window.currentProduct =
            currentProduct;


        displayProduct(
            currentProduct
        );


        // Load reviews separately

        await loadReviews(
            productId
        );


        return true;

    }

    catch (error) {

        console.error(
            "PRODUCT LOAD ERROR:",
            error
        );


        showError();

        return false;

    }
}


// =========================================================
// DISPLAY PRODUCT
// =========================================================

function displayProduct(product) {

    if (!product) {

        showError();

        return;
    }


    // -----------------------------------------------------
    // SHOW PRODUCT
    // -----------------------------------------------------

    if (loading) {

        loading.style.display =
            "none";

    }


    if (errorMessage) {

        errorMessage.style.display =
            "none";

    }


    if (productDetails) {

        productDetails.style.display =
            "grid";

    }


    if (reviewsSection) {

        reviewsSection.style.display =
            "block";

    }


    // -----------------------------------------------------
    // CATEGORY
    // -----------------------------------------------------

    if (productCategory) {

        productCategory.textContent =
            product.category_name ||
            product.category ||
            "Uncategorized";

    }


    // -----------------------------------------------------
    // NAME
    // -----------------------------------------------------

    if (productName) {

        productName.textContent =
            product.name ||
            "Product";

    }


    // -----------------------------------------------------
    // RATING
    // -----------------------------------------------------

    if (productRating) {

        productRating.textContent =
            `★ ${Number(
                product.rating || 0
            ).toFixed(1)}`;

    }


    // -----------------------------------------------------
    // PRICE
    // -----------------------------------------------------

    if (productPrice) {

        productPrice.textContent =
            `Rs. ${Number(
                product.price || 0
            ).toFixed(2)}`;

    }


    // -----------------------------------------------------
    // DESCRIPTION
    // -----------------------------------------------------

    if (productDescription) {

        productDescription.textContent =
            product.description ||
            "No description available.";

    }


    // -----------------------------------------------------
    // STOCK
    // -----------------------------------------------------

    const stock =
        Number(product.stock || 0);


    if (productStock) {

        if (stock > 0) {

            productStock.textContent =
                `${stock} available`;

            productStock.className =
                "stock-available";

        }

        else {

            productStock.textContent =
                "Out of stock";

            productStock.className =
                "stock-unavailable";

        }

    }


    if (quantityInput) {

        quantityInput.min =
            "1";

        quantityInput.max =
            stock > 0
                ? stock
                : 1;

        if (
            Number(quantityInput.value) < 1
        ) {

            quantityInput.value =
                "1";

        }

    }


    // -----------------------------------------------------
    // BUTTONS
    // -----------------------------------------------------

    if (addToCartBtn) {

        addToCartBtn.disabled =
            stock <= 0;

    }


    if (buyNowBtn) {

        buyNowBtn.disabled =
            stock <= 0;

    }


    // -----------------------------------------------------
    // IMAGE
    // -----------------------------------------------------

    if (productImage) {

        if (product.image) {

            productImage.src =
                product.image;

        }

        else {

            productImage.src =
                "/images/product-placeholder.png";

        }


        productImage.alt =
            product.name ||
            "Product";

    }


    // -----------------------------------------------------
    // SAVE PRODUCT
    // -----------------------------------------------------

    currentProduct =
        product;

    window.currentProduct =
        product;
}


// =========================================================
// SHOW ERROR
// =========================================================

function showError() {

    if (loading) {

        loading.style.display =
            "none";

    }


    if (productDetails) {

        productDetails.style.display =
            "none";

    }


    if (reviewsSection) {

        reviewsSection.style.display =
            "none";

    }


    if (errorMessage) {

        errorMessage.style.display =
            "block";

    }
}


// =========================================================
// QUANTITY - DECREASE
// =========================================================

if (decreaseBtn) {

    decreaseBtn.addEventListener(
        "click",
        () => {

            if (!quantityInput) {

                return;

            }


            let quantity =
                Number(
                    quantityInput.value
                ) || 1;


            quantity =
                Math.max(
                    1,
                    quantity - 1
                );


            quantityInput.value =
                quantity;

        }
    );

}


// =========================================================
// QUANTITY - INCREASE
// =========================================================

if (increaseBtn) {

    increaseBtn.addEventListener(
        "click",
        () => {

            if (!quantityInput) {

                return;

            }


            let quantity =
                Number(
                    quantityInput.value
                ) || 1;


            const stock =
                Number(
                    currentProduct?.stock || 0
                );


            if (
                stock > 0 &&
                quantity < stock
            ) {

                quantity++;

            }


            quantityInput.value =
                quantity;

        }
    );

}


// =========================================================
// QUANTITY VALIDATION
// =========================================================

if (quantityInput) {

    quantityInput.addEventListener(
        "input",
        () => {

            let quantity =
                Number(
                    quantityInput.value
                ) || 1;


            const stock =
                Number(
                    currentProduct?.stock || 0
                );


            if (quantity < 1) {

                quantity = 1;

            }


            if (
                stock > 0 &&
                quantity > stock
            ) {

                quantity = stock;

            }


            quantityInput.value =
                quantity;

        }
    );

}


// =========================================================
// LOGIN MODAL
// =========================================================

function showLoginModal() {

    if (!loginModal) {

        return;

    }


    loginModal.style.display =
        "flex";

    document.body.style.overflow =
        "hidden";
}


function hideLoginModal() {

    if (!loginModal) {

        return;

    }


    loginModal.style.display =
        "none";

    document.body.style.overflow =
        "";
}


// =========================================================
// CLOSE LOGIN MODAL
// =========================================================

if (closeLoginModal) {

    closeLoginModal.addEventListener(
        "click",
        hideLoginModal
    );

}


if (continueShoppingBtn) {

    continueShoppingBtn.addEventListener(
        "click",
        hideLoginModal
    );

}


// =========================================================
// GO TO LOGIN
// =========================================================

if (goToLoginBtn) {

    goToLoginBtn.addEventListener(
        "click",
        () => {

            sessionStorage.setItem(
                "loginRedirect",
                window.location.href
            );


            window.location.href =
                "/login";

        }
    );

}


// =========================================================
// ADD TO CART
// =========================================================

if (addToCartBtn) {

    addToCartBtn.addEventListener(
        "click",
        async () => {

            const loggedIn =
                await checkUserLogin();


            if (!loggedIn) {

                sessionStorage.setItem(
                    "loginRedirect",
                    window.location.href
                );


                showLoginModal();

                return;

            }


            if (!currentProduct) {

                alert(
                    "Product is not loaded yet."
                );

                return;

            }


            const quantity =
                Number(
                    quantityInput?.value
                ) || 1;


            const stock =
                Number(
                    currentProduct.stock || 0
                );


            if (stock <= 0) {

                alert(
                    "This product is out of stock."
                );

                return;

            }


            if (quantity > stock) {

                alert(
                    "Requested quantity is not available."
                );

                return;

            }


            const oldText =
                addToCartBtn.textContent;


            addToCartBtn.disabled =
                true;

            addToCartBtn.textContent =
                "Adding...";


            try {

                const response =
                    await fetch(
                        "/api/cart/add",
                        {
                            method: "POST",

                            credentials:
                                "include",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    product_id:
                                        Number(
                                            currentProduct.id
                                        ),

                                    quantity:
                                        quantity

                                })

                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "ADD CART RESPONSE:",
                    data
                );


                if (
                    response.status === 401
                ) {

                    userLoggedIn =
                        false;

                    showLoginModal();

                    return;

                }


                if (
                    !response.ok ||
                    data.success !== true
                ) {

                    alert(
                        data.message ||
                        "Failed to add product to cart."
                    );

                    return;

                }


                addToCartBtn.textContent =
                    "Added ✓";


                setTimeout(
                    () => {

                        addToCartBtn.textContent =
                            oldText;

                        addToCartBtn.disabled =
                            false;

                    },
                    1200
                );

            }

            catch (error) {

                console.error(
                    "ADD CART ERROR:",
                    error
                );


                alert(
                    "Unable to add product to cart."
                );

                addToCartBtn.textContent =
                    oldText;

                addToCartBtn.disabled =
                    false;

            }

        }
    );

}


// =========================================================
// BUY NOW
// =========================================================

if (buyNowBtn) {

    buyNowBtn.addEventListener(
        "click",
        async () => {

            const loggedIn =
                await checkUserLogin();


            if (!loggedIn) {

                sessionStorage.setItem(
                    "loginRedirect",
                    window.location.href
                );


                showLoginModal();

                return;

            }


            if (!currentProduct) {

                alert(
                    "Product is not loaded yet."
                );

                return;

            }


            const quantity =
                Number(
                    quantityInput?.value
                ) || 1;


            try {

                const response =
                    await fetch(
                        "/api/cart/add",
                        {
                            method: "POST",

                            credentials:
                                "include",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    product_id:
                                        Number(
                                            currentProduct.id
                                        ),

                                    quantity:
                                        quantity

                                })

                        }
                    );


                const data =
                    await response.json();


                if (
                    response.status === 401
                ) {

                    userLoggedIn =
                        false;

                    showLoginModal();

                    return;

                }


                if (
                    !response.ok ||
                    data.success !== true
                ) {

                    alert(
                        data.message ||
                        "Unable to continue."
                    );

                    return;

                }


                window.location.href =
                    "/cart";

            }

            catch (error) {

                console.error(
                    "BUY NOW ERROR:",
                    error
                );


                alert(
                    "Unable to continue."
                );

            }

        }
    );

}


// =========================================================
// TRY AR
// =========================================================

if (tryOnBtn) {

    tryOnBtn.addEventListener(
        "click",
        async () => {

            const loggedIn =
                await checkUserLogin();


            if (!loggedIn) {

                sessionStorage.setItem(
                    "loginRedirect",
                    window.location.href
                );


                showLoginModal();

                return;

            }


            alert(
                "AR Try-On will open here."
            );

        }
    );

}


// =========================================================
// WRITE REVIEW
// =========================================================

if (writeReviewBtn) {

    writeReviewBtn.addEventListener(
        "click",
        async () => {

            const loggedIn =
                await checkUserLogin();


            if (!loggedIn) {

                sessionStorage.setItem(
                    "loginRedirect",
                    window.location.href
                );


                showLoginModal();

                return;

            }


            if (!reviewFormContainer) {

                return;

            }


            reviewFormContainer.style.display =
                "block";


            writeReviewBtn.style.display =
                "none";


            reviewFormContainer.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }
    );

}


// =========================================================
// CANCEL REVIEW
// =========================================================

if (cancelReviewBtn) {

    cancelReviewBtn.addEventListener(
        "click",
        () => {

            resetReviewForm();

        }
    );

}


// =========================================================
// STAR RATING
// =========================================================

const stars =
    document.querySelectorAll(
        "#starRating button"
    );


stars.forEach(
    star => {

        star.addEventListener(
            "click",
            () => {

                selectedRating =
                    Number(
                        star.dataset.rating
                    );


                if (reviewRating) {

                    reviewRating.value =
                        selectedRating;

                }


                updateStars();

            }
        );

    }
);


// =========================================================
// UPDATE STARS
// =========================================================

function updateStars() {

    stars.forEach(
        star => {

            const value =
                Number(
                    star.dataset.rating
                );


            if (
                value <= selectedRating
            ) {

                star.classList.add(
                    "active"
                );

            }

            else {

                star.classList.remove(
                    "active"
                );

            }

        }
    );
}


// =========================================================
// IMAGE PREVIEW
// =========================================================

if (reviewImage) {

    reviewImage.addEventListener(
        "change",
        () => {

            const file =
                reviewImage.files?.[0];


            if (!file) {

                clearImagePreview();

                return;

            }


            // ------------------------------------------------
            // FILE TYPE
            // ------------------------------------------------

            if (
                !file.type.startsWith("image/")
            ) {

                alert(
                    "Please select a valid image file."
                );

                reviewImage.value =
                    "";

                clearImagePreview();

                return;

            }


            // ------------------------------------------------
            // FILE SIZE
            // ------------------------------------------------

            if (
                file.size >
                5 * 1024 * 1024
            ) {

                alert(
                    "Image must be smaller than 5MB."
                );

                reviewImage.value =
                    "";

                clearImagePreview();

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                event => {

                    if (!imagePreview) {

                        return;

                    }


                    imagePreview.innerHTML = `

                        <img
                            src="${escapeAttribute(
                                event.target.result
                            )}"
                            alt="Review image preview"
                        >

                    `;


                    imagePreview.style.display =
                        "block";

                };


            reader.readAsDataURL(file);

        }
    );

}


// =========================================================
// SUBMIT REVIEW
// =========================================================

if (reviewForm) {

    reviewForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const loggedIn =
                await checkUserLogin();


            if (!loggedIn) {

                sessionStorage.setItem(
                    "loginRedirect",
                    window.location.href
                );


                showLoginModal();

                return;

            }


            if (!currentProduct) {

                alert(
                    "Product has not loaded yet."
                );

                return;

            }


            const rating =
                Number(
                    reviewRating?.value ||
                    selectedRating
                );


            const text =
                reviewText?.value.trim() ||
                "";


            // ------------------------------------------------
            // VALIDATE RATING
            // ------------------------------------------------

            if (
                rating < 1 ||
                rating > 5
            ) {

                alert(
                    "Please select a rating."
                );

                return;

            }


            // ------------------------------------------------
            // VALIDATE REVIEW
            // ------------------------------------------------

            if (!text) {

                alert(
                    "Please write your review."
                );

                return;

            }


            // ------------------------------------------------
            // CREATE FORM DATA
            // ------------------------------------------------

            const formData =
                new FormData();


            formData.append(
                "product_id",
                currentProduct.id
            );


            formData.append(
                "rating",
                rating
            );


            formData.append(
                "review_text",
                text
            );


            if (
                reviewImage &&
                reviewImage.files &&
                reviewImage.files.length > 0
            ) {

                formData.append(
                    "image",
                    reviewImage.files[0]
                );

            }


            // ------------------------------------------------
            // SUBMIT BUTTON
            // ------------------------------------------------

            if (submitReviewBtn) {

                submitReviewBtn.disabled =
                    true;

                submitReviewBtn.textContent =
                    "Submitting...";

            }


            try {

                const response =
                    await fetch(
                        "/api/reviews",
                        {
                            method: "POST",

                            credentials:
                                "include",

                            body:
                                formData

                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "REVIEW API RESPONSE:",
                    data
                );


                if (
                    response.status === 401
                ) {

                    userLoggedIn =
                        false;

                    showLoginModal();

                    return;

                }


                if (
                    !response.ok ||
                    data.success !== true
                ) {

                    alert(
                        data.message ||
                        "Failed to submit review."
                    );

                    return;

                }


                // ------------------------------------------------
                // SUCCESS
                // ------------------------------------------------

                alert(
                    "Review submitted successfully! ⭐"
                );


                resetReviewForm();


                // ------------------------------------------------
                // RELOAD REVIEWS
                // ------------------------------------------------

                await loadReviews(
                    currentProduct.id
                );


                // ------------------------------------------------
                // RELOAD PRODUCT RATING
                // ------------------------------------------------

                await refreshProduct();


            }

            catch (error) {

                console.error(
                    "SUBMIT REVIEW ERROR:",
                    error
                );


                alert(
                    "Unable to submit review."
                );

            }

            finally {

                if (submitReviewBtn) {

                    submitReviewBtn.disabled =
                        false;

                    submitReviewBtn.textContent =
                        "Submit Review";

                }

            }

        }
    );

}


// =========================================================
// RESET REVIEW FORM
// =========================================================

function resetReviewForm() {

    if (reviewForm) {

        reviewForm.reset();

    }


    selectedRating =
        0;


    if (reviewRating) {

        reviewRating.value =
            "0";

    }


    updateStars();


    clearImagePreview();


    if (reviewFormContainer) {

        reviewFormContainer.style.display =
            "none";

    }


    if (writeReviewBtn) {

        writeReviewBtn.style.display =
            "block";

    }

}


// =========================================================
// CLEAR IMAGE PREVIEW
// =========================================================

function clearImagePreview() {

    if (!imagePreview) {

        return;

    }


    imagePreview.innerHTML =
        "";

    imagePreview.style.display =
        "none";
}


// =========================================================
// REFRESH PRODUCT ONLY
// =========================================================

async function refreshProduct() {

    const productId =
        getProductId();


    if (!productId) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/products/${encodeURIComponent(
                    productId
                )}`,
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store"
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            data.success !== true ||
            !data.product
        ) {

            return;

        }


        currentProduct =
            data.product;


        window.currentProduct =
            currentProduct;


        // Update only product information.
        // Do NOT call loadReviews() here.

        updateProductInformation(
            currentProduct
        );

    }

    catch (error) {

        console.error(
            "REFRESH PRODUCT ERROR:",
            error
        );

    }

}


// =========================================================
// UPDATE PRODUCT INFORMATION
// =========================================================

function updateProductInformation(product) {

    if (!product) {

        return;

    }


    if (productCategory) {

        productCategory.textContent =
            product.category_name ||
            product.category ||
            "Uncategorized";

    }


    if (productName) {

        productName.textContent =
            product.name ||
            "Product";

    }


    if (productRating) {

        productRating.textContent =
            `★ ${Number(
                product.rating || 0
            ).toFixed(1)}`;

    }


    if (productPrice) {

        productPrice.textContent =
            `Rs. ${Number(
                product.price || 0
            ).toFixed(2)}`;

    }


    if (productDescription) {

        productDescription.textContent =
            product.description ||
            "No description available.";

    }


    const stock =
        Number(product.stock || 0);


    if (productStock) {

        productStock.textContent =
            stock > 0
                ? `${stock} available`
                : "Out of stock";

        productStock.className =
            stock > 0
                ? "stock-available"
                : "stock-unavailable";

    }


    if (quantityInput) {

        quantityInput.max =
            stock > 0
                ? stock
                : 1;

    }


    if (addToCartBtn) {

        addToCartBtn.disabled =
            stock <= 0;

    }


    if (buyNowBtn) {

        buyNowBtn.disabled =
            stock <= 0;

    }

}


// =========================================================
// LOAD REVIEWS
// =========================================================

async function loadReviews(productId) {

    if (!reviewsList) {

        return;

    }


    reviewsList.innerHTML = `

        <div class="reviews-loading">

            <div class="loader small"></div>

            <span>
                Loading reviews...
            </span>

        </div>

    `;


    try {

        const response =
            await fetch(
                `/api/reviews/product/${encodeURIComponent(
                    productId
                )}`,
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store"
                }
            );


        const data =
            await response.json();


        console.log(
            "REVIEWS API RESPONSE:",
            data
        );


        if (
            !response.ok ||
            data.success !== true
        ) {

            reviewsList.innerHTML = `

                <div class="no-reviews">

                    <div class="no-reviews-icon">
                        ⚠️
                    </div>

                    <p>
                        Unable to load reviews.
                    </p>

                </div>

            `;

            return;

        }


        const reviews =
            Array.isArray(data.reviews)
                ? data.reviews
                : [];


        if (
            reviews.length === 0
        ) {

            reviewsList.innerHTML = `

                <div class="no-reviews">

                    <div class="no-reviews-icon">
                        ⭐
                    </div>

                    <h3>
                        No reviews yet
                    </h3>

                    <p>
                        Be the first customer
                        to review this product.
                    </p>

                </div>

            `;

            return;

        }


        reviewsList.innerHTML =
            "";


        reviews.forEach(
            review => {

                reviewsList.appendChild(
                    createReviewCard(
                        review
                    )
                );

            }
        );

    }

    catch (error) {

        console.error(
            "LOAD REVIEWS ERROR:",
            error
        );


        reviewsList.innerHTML = `

            <div class="no-reviews">

                <div class="no-reviews-icon">
                    ⚠️
                </div>

                <p>
                    Unable to load reviews.
                </p>

            </div>

        `;

    }

}


// =========================================================
// CREATE REVIEW CARD
// =========================================================

function createReviewCard(review) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "review-card";


    const rating =
        Math.min(
            5,
            Math.max(
                0,
                Number(review.rating || 0)
            )
        );


    const starsHTML =
        "★".repeat(rating) +
        "☆".repeat(
            5 - rating
        );


    let dateText =
        "";


    if (review.created_at) {

        const date =
            new Date(
                review.created_at
            );


        if (
            !Number.isNaN(
                date.getTime()
            )
        ) {

            dateText =
                date.toLocaleDateString(
                    undefined,
                    {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                    }
                );

        }

    }


    const username =
        escapeHTML(
            review.username ||
            "Customer"
        );


    const reviewContent =
        escapeHTML(
            review.review_text ||
            ""
        );


    let imageHTML =
        "";


    if (
        review.image_url
    ) {

        imageHTML = `

            <div class="review-image">

                <img
                    src="${escapeAttribute(
                        review.image_url
                    )}"
                    alt="Customer review image"
                    loading="lazy"
                >

            </div>

        `;

    }


    card.innerHTML = `

        <div class="review-top">

            <div>

                <div class="reviewer">

                    ${username}

                </div>

                <div class="review-stars">

                    ${starsHTML}

                </div>

            </div>


            <div class="review-date">

                ${dateText}

            </div>

        </div>


        <div class="review-text">

            ${reviewContent}

        </div>


        ${imageHTML}

    `;


    return card;
}


// =========================================================
// CLOSE LOGIN MODAL WITH ESC
// =========================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            hideLoginModal();

        }

    }
);


// =========================================================
// CLOSE LOGIN MODAL WHEN CLICKING OUTSIDE
// =========================================================

if (loginModal) {

    loginModal.addEventListener(
        "click",
        event => {

            if (
                event.target === loginModal
            ) {

                hideLoginModal();

            }

        }
    );

}


// =========================================================
// INITIALIZE PAGE
// =========================================================

async function initialize() {

    console.log(
        "Initializing product details page..."
    );


    const productId =
        getProductId();


    console.log(
        "Product ID:",
        productId
    );


    if (!productId) {

        showError();

        return;

    }


    // Check login but do not block
    // product loading if login check fails.

    await checkUserLogin();


    // Load product and reviews

    await loadProduct();

}


// =========================================================
// START
// =========================================================

initialize();
