// =========================================================
// AR ECOMMERCE
// PRODUCT DETAILS PAGE
// PRODUCT + CART + REVIEWS
// =========================================================


/* =========================================================
   GLOBAL
========================================================= */

let currentProduct = null;

let currentUser = null;

let userLoggedIn = false;

let selectedRating = 0;


/* =========================================================
   GET PRODUCT ID
========================================================= */

const urlParams =
    new URLSearchParams(
        window.location.search
    );


const productId =
    urlParams.get("id");


/* =========================================================
   ELEMENTS
========================================================= */

const loading =
    document.getElementById(
        "loading"
    );


const errorMessage =
    document.getElementById(
        "errorMessage"
    );


const productDetails =
    document.getElementById(
        "productDetails"
    );


const productImage =
    document.getElementById(
        "productImage"
    );


const imageFallback =
    document.getElementById(
        "imageFallback"
    );


const productCategory =
    document.getElementById(
        "productCategory"
    );


const productName =
    document.getElementById(
        "productName"
    );


const productRating =
    document.getElementById(
        "productRating"
    );


const productPrice =
    document.getElementById(
        "productPrice"
    );


const productDescription =
    document.getElementById(
        "productDescription"
    );


const productStock =
    document.getElementById(
        "productStock"
    );


const quantityInput =
    document.getElementById(
        "quantity"
    );


const decreaseBtn =
    document.getElementById(
        "decreaseBtn"
    );


const increaseBtn =
    document.getElementById(
        "increaseBtn"
    );


const addToCartBtn =
    document.getElementById(
        "addToCartBtn"
    );


const buyNowBtn =
    document.getElementById(
        "buyNowBtn"
    );


const tryOnBtn =
    document.getElementById(
        "tryOnBtn"
    );


const loginNav =
    document.getElementById(
        "loginNav"
    );


/* =========================================================
   REVIEW ELEMENTS
========================================================= */

const reviewsSection =
    document.getElementById(
        "reviewsSection"
    );


const reviewAverage =
    document.getElementById(
        "reviewAverage"
    );


const reviewCount =
    document.getElementById(
        "reviewCount"
    );


const reviewForm =
    document.getElementById(
        "reviewForm"
    );


const reviewLoginMessage =
    document.getElementById(
        "reviewLoginMessage"
    );


const reviewLoginBtn =
    document.getElementById(
        "reviewLoginBtn"
    );


const reviewRating =
    document.getElementById(
        "reviewRating"
    );


const ratingText =
    document.getElementById(
        "ratingText"
    );


const reviewText =
    document.getElementById(
        "reviewText"
    );


const characterCount =
    document.getElementById(
        "characterCount"
    );


const reviewImage =
    document.getElementById(
        "reviewImage"
    );


const reviewImagePreview =
    document.getElementById(
        "reviewImagePreview"
    );


const previewImage =
    document.getElementById(
        "previewImage"
    );


const removeReviewImage =
    document.getElementById(
        "removeReviewImage"
    );


const submitReviewBtn =
    document.getElementById(
        "submitReviewBtn"
    );


const reviewFormMessage =
    document.getElementById(
        "reviewFormMessage"
    );


const reviewsList =
    document.getElementById(
        "reviewsList"
    );


/* =========================================================
   IMAGE URL FIX
========================================================= */

function getProductImageUrl(image) {

    if (!image) {

        return "";

    }


    let value =
        String(image).trim();


    if (!value) {

        return "";

    }


    /*
     * Already a complete URL.
     */

    if (
        value.startsWith("http://") ||
        value.startsWith("https://") ||
        value.startsWith("data:")
    ) {

        return value;

    }


    /*
     * Already starts with /uploads.
     */

    if (
        value.startsWith("/uploads/")
    ) {

        return value;

    }


    /*
     * Database may contain:
     *
     * uploads/products/file.jpg
     */

    if (
        value.startsWith("uploads/")
    ) {

        return "/" + value;

    }


    /*
     * Database may contain:
     *
     * products/file.jpg
     */

    if (
        value.startsWith("products/")
    ) {

        return "/uploads/" + value;

    }


    /*
     * Database may contain only:
     *
     * file.jpg
     *
     * Your server serves:
     * /uploads/products
     */

    return "/uploads/products/" + value;

}


/* =========================================================
   SHOW ERROR
========================================================= */

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
            "flex";

    }

}


/* =========================================================
   LOAD CURRENT USER
========================================================= */

async function checkLogin() {

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

        }

        else {

            userLoggedIn = false;

            currentUser = null;

        }


        updateNavigation();

        updateReviewLoginState();

        return userLoggedIn;

    }

    catch (error) {

        console.error(
            "Login check error:",
            error
        );


        userLoggedIn = false;

        currentUser = null;

        updateNavigation();

        updateReviewLoginState();

        return false;

    }

}


/* =========================================================
   UPDATE NAVIGATION
========================================================= */

function updateNavigation() {

    if (!loginNav) {

        return;

    }


    /*
     * Keep Login in navigation.
     */

    loginNav.textContent =
        "Login";

    loginNav.href =
        "/login";

}


/* =========================================================
   REVIEW LOGIN STATE
========================================================= */

function updateReviewLoginState() {

    if (!reviewForm || !reviewLoginMessage) {

        return;

    }


    if (userLoggedIn) {

        reviewForm.style.display =
            "block";

        reviewLoginMessage.style.display =
            "none";

    }

    else {

        reviewForm.style.display =
            "none";

        reviewLoginMessage.style.display =
            "flex";

    }

}


/* =========================================================
   LOAD PRODUCT
========================================================= */

async function loadProduct() {

    if (!productId) {

        showError();

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
                    cache: "no-store"
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            data.success !== true
        ) {

            console.error(
                "Product API error:",
                data
            );

            showError();

            return;

        }


        currentProduct =
            data.product;


        if (!currentProduct) {

            showError();

            return;

        }


        displayProduct(
            currentProduct
        );


        if (loading) {

            loading.style.display =
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


        await loadReviews();

    }

    catch (error) {

        console.error(
            "PRODUCT LOAD ERROR:",
            error
        );

        showError();

    }

}


/* =========================================================
   DISPLAY PRODUCT
========================================================= */

function displayProduct(product) {

    /*
     * Category
     */

    if (productCategory) {

        productCategory.textContent =
            product.category_name ||
            product.category ||
            "Uncategorized";

    }


    /*
     * Name
     */

    if (productName) {

        productName.textContent =
            product.name ||
            "Product";

    }


    /*
     * Rating
     */

    const rating =
        Number(
            product.rating || 0
        );


    if (productRating) {

        productRating.textContent =
            `★ ${rating.toFixed(1)}`;

    }


    /*
     * Price
     */

    if (productPrice) {

        productPrice.textContent =
            `Rs. ${Number(
                product.price || 0
            ).toLocaleString(
                "en-IN"
            )}`;

    }


    /*
     * Description
     */

    if (productDescription) {

        productDescription.textContent =
            product.description ||
            "No description available.";

    }


    /*
     * Stock
     */

    const stock =
        Number(
            product.stock || 0
        );


    if (productStock) {

        if (stock > 0) {

            productStock.textContent =
                `${stock} available`;

            productStock.classList.remove(
                "out"
            );

        }

        else {

            productStock.textContent =
                "Out of stock";

            productStock.classList.add(
                "out"
            );

        }

    }


    /*
     * Quantity
     */

    if (quantityInput) {

        quantityInput.value =
            1;

        quantityInput.max =
            Math.max(
                stock,
                1
            );

    }


    /*
     * PRODUCT IMAGE
     */

    const imageUrl =
        getProductImageUrl(
            product.image
        );


    if (
        productImage &&
        imageUrl
    ) {

        productImage.src =
            imageUrl;

        productImage.alt =
            product.name ||
            "Product";

        productImage.style.display =
            "block";

        if (imageFallback) {

            imageFallback.style.display =
                "none";

        }


        /*
         * If image URL is invalid,
         * show fallback instead.
         */

        productImage.onerror =
            function () {

                console.error(
                    "Product image failed:",
                    imageUrl
                );


                productImage.style.display =
                    "none";


                if (imageFallback) {

                    imageFallback.style.display =
                        "block";

                }

            };

    }

    else {

        if (productImage) {

            productImage.style.display =
                "none";

        }


        if (imageFallback) {

            imageFallback.style.display =
                "block";

        }

    }


    /*
     * Disable cart if out of stock.
     */

    if (addToCartBtn) {

        addToCartBtn.disabled =
            stock <= 0;

        if (stock <= 0) {

            addToCartBtn.textContent =
                "Out of Stock";

        }

        else {

            addToCartBtn.textContent =
                "Add to Cart";

        }

    }

}


/* =========================================================
   QUANTITY
========================================================= */

if (decreaseBtn) {

    decreaseBtn.addEventListener(
        "click",
        () => {

            let quantity =
                Number(
                    quantityInput.value
                );


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


if (increaseBtn) {

    increaseBtn.addEventListener(
        "click",
        () => {

            let quantity =
                Number(
                    quantityInput.value
                );


            const stock =
                Number(
                    currentProduct?.stock || 0
                );


            quantity++;


            if (
                stock > 0 &&
                quantity > stock
            ) {

                quantity =
                    stock;

            }


            quantityInput.value =
                Math.max(
                    1,
                    quantity
                );

        }
    );

}


if (quantityInput) {

    quantityInput.addEventListener(
        "change",
        () => {

            let quantity =
                Number(
                    quantityInput.value
                );


            const stock =
                Number(
                    currentProduct?.stock || 0
                );


            if (
                !Number.isFinite(quantity) ||
                quantity < 1
            ) {

                quantity = 1;

            }


            if (
                stock > 0 &&
                quantity > stock
            ) {

                quantity =
                    stock;

            }


            quantityInput.value =
                quantity;

        }
    );

}


/* =========================================================
   ADD TO CART
========================================================= */

if (addToCartBtn) {

    addToCartBtn.addEventListener(
        "click",
        async () => {

            if (!currentProduct) {

                return;

            }


            /*
             * Same login behavior as
             * Products page.
             */

            if (!userLoggedIn) {

                sessionStorage.setItem(
                    "loginRedirect",
                    window.location.pathname +
                    window.location.search
                );


                alert(
                    "Please login before adding products to the cart."
                );


                window.location.href =
                    "/login";


                return;

            }


            const quantity =
                Math.max(
                    1,
                    Number(
                        quantityInput?.value || 1
                    )
                );


            try {

                addToCartBtn.disabled =
                    true;


                addToCartBtn.textContent =
                    "Adding...";


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

                    userLoggedIn = false;

                    currentUser = null;

                    updateReviewLoginState();


                    alert(
                        "Please login first."
                    );


                    window.location.href =
                        "/login";


                    return;

                }


                if (
                    !response.ok ||
                    data.success !== true
                ) {

                    throw new Error(
                        data.message ||
                        "Failed to add product."
                    );

                }


                addToCartBtn.textContent =
                    "Added ✓";


                setTimeout(
                    () => {

                        addToCartBtn.textContent =
                            "Add to Cart";

                        addToCartBtn.disabled =
                            false;

                    },
                    1200
                );

            }

            catch (error) {

                console.error(
                    "Add cart error:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to add product."
                );


                addToCartBtn.textContent =
                    "Add to Cart";

                addToCartBtn.disabled =
                    false;

            }

        }
    );

}


/* =========================================================
   BUY NOW
========================================================= */

if (buyNowBtn) {

    buyNowBtn.addEventListener(
        "click",
        async () => {

            if (!currentProduct) {

                return;

            }


            if (!userLoggedIn) {

                sessionStorage.setItem(
                    "loginRedirect",
                    window.location.pathname +
                    window.location.search
                );


                alert(
                    "Please login before buying."
                );


                window.location.href =
                    "/login";


                return;

            }


            const quantity =
                Math.max(
                    1,
                    Number(
                        quantityInput?.value || 1
                    )
                );


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
                    "Buy now error:",
                    error
                );


                alert(
                    "Unable to continue."
                );

            }

        }
    );

}


/* =========================================================
   AR BUTTON
========================================================= */

if (tryOnBtn) {

    tryOnBtn.addEventListener(
        "click",
        () => {

            if (!currentProduct) {

                return;

            }


            /*
             * Keep your AR button ready.
             * Replace this later with your AR page.
             */

            const arUrl =
                `/ar-tryon.html?id=${encodeURIComponent(
                    currentProduct.id
                )}`;


            window.location.href =
                arUrl;

        }
    );

}


/* =========================================================
   REVIEW LOGIN
========================================================= */

if (reviewLoginBtn) {

    reviewLoginBtn.addEventListener(
        "click",
        () => {

            sessionStorage.setItem(
                "loginRedirect",
                window.location.pathname +
                window.location.search
            );


            window.location.href =
                "/login";

        }
    );

}


/* =========================================================
   STAR RATING
========================================================= */

const starButtons =
    document.querySelectorAll(
        "#starRating button"
    );


starButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                selectedRating =
                    Number(
                        button.dataset.rating
                    );


                if (reviewRating) {

                    reviewRating.value =
                        selectedRating;

                }


                updateStars();


                if (ratingText) {

                    const labels = {

                        1: "Very bad",

                        2: "Bad",

                        3: "Average",

                        4: "Good",

                        5: "Excellent"

                    };


                    ratingText.textContent =
                        labels[
                            selectedRating
                        ];

                }

            }
        );

    }
);


/* =========================================================
   UPDATE STARS
========================================================= */

function updateStars() {

    starButtons.forEach(
        button => {

            const rating =
                Number(
                    button.dataset.rating
                );


            if (
                rating <=
                selectedRating
            ) {

                button.classList.add(
                    "active"
                );

            }

            else {

                button.classList.remove(
                    "active"
                );

            }

        }
    );

}


/* =========================================================
   REVIEW TEXT COUNTER
========================================================= */

if (reviewText) {

    reviewText.addEventListener(
        "input",
        () => {

            if (characterCount) {

                characterCount.textContent =
                    reviewText.value.length;

            }

        }
    );

}


/* =========================================================
   REVIEW IMAGE PREVIEW
========================================================= */

if (reviewImage) {

    reviewImage.addEventListener(
        "change",
        () => {

            const file =
                reviewImage.files[0];


            if (!file) {

                return;

            }


            /*
             * Maximum 5 MB.
             */

            if (
                file.size >
                5 * 1024 * 1024
            ) {

                alert(
                    "Image must be smaller than 5 MB."
                );


                reviewImage.value =
                    "";


                return;

            }


            const allowedTypes = [

                "image/jpeg",

                "image/png",

                "image/jpg",

                "image/webp"

            ];


            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                alert(
                    "Please select a JPG, PNG or WEBP image."
                );


                reviewImage.value =
                    "";


                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                event => {

                    previewImage.src =
                        event.target.result;


                    reviewImagePreview.style.display =
                        "block";

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


/* =========================================================
   REMOVE REVIEW IMAGE
========================================================= */

if (removeReviewImage) {

    removeReviewImage.addEventListener(
        "click",
        () => {

            reviewImage.value =
                "";


            reviewImagePreview.style.display =
                "none";


            previewImage.src =
                "";

        }
    );

}


/* =========================================================
   SUBMIT REVIEW
========================================================= */

if (reviewForm) {

    reviewForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (!userLoggedIn) {

                sessionStorage.setItem(
                    "loginRedirect",
                    window.location.pathname +
                    window.location.search
                );


                alert(
                    "Please login to submit a review."
                );


                window.location.href =
                    "/login";


                return;

            }


            if (
                selectedRating < 1 ||
                selectedRating > 5
            ) {

                showReviewMessage(
                    "Please select a rating.",
                    "error"
                );


                return;

            }


            const text =
                reviewText.value.trim();


            if (!text) {

                showReviewMessage(
                    "Please write your review.",
                    "error"
                );


                return;

            }


            try {

                submitReviewBtn.disabled =
                    true;


                submitReviewBtn.textContent =
                    "Submitting...";


                const formData =
                    new FormData();


                formData.append(
                    "rating",
                    selectedRating
                );


                formData.append(
                    "review",
                    text
                );


                if (
                    reviewImage.files.length > 0
                ) {

                    formData.append(
                        "image",
                        reviewImage.files[0]
                    );

                }


                const response =
                    await fetch(
                        `/api/products/${encodeURIComponent(
                            productId
                        )}/reviews`,
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


                if (
                    response.status === 401
                ) {

                    userLoggedIn = false;

                    currentUser = null;

                    updateReviewLoginState();


                    sessionStorage.setItem(
                        "loginRedirect",
                        window.location.pathname +
                        window.location.search
                    );


                    alert(
                        "Please login first."
                    );


                    window.location.href =
                        "/login";


                    return;

                }


                if (
                    !response.ok ||
                    data.success !== true
                ) {

                    throw new Error(
                        data.message ||
                        "Failed to submit review."
                    );

                }


                showReviewMessage(
                    "Review submitted successfully!",
                    "success"
                );


                resetReviewForm();


                await loadReviews();


                /*
                 * Update product rating
                 * after review.
                 */

                await loadProductRating();

            }

            catch (error) {

                console.error(
                    "Submit review error:",
                    error
                );


                showReviewMessage(
                    error.message ||
                    "Unable to submit review.",
                    "error"
                );

            }

            finally {

                submitReviewBtn.disabled =
                    false;

                submitReviewBtn.textContent =
                    "Submit Review";

            }

        }
    );

}


/* =========================================================
   REVIEW MESSAGE
========================================================= */

function showReviewMessage(
    message,
    type
) {

    if (!reviewFormMessage) {

        return;

    }


    reviewFormMessage.textContent =
        message;


    reviewFormMessage.className =
        `review-form-message ${type}`;

}


/* =========================================================
   RESET REVIEW FORM
========================================================= */

function resetReviewForm() {

    reviewForm.reset();


    selectedRating = 0;


    if (reviewRating) {

        reviewRating.value =
            "0";

    }


    if (ratingText) {

        ratingText.textContent =
            "Select a rating";

    }


    if (characterCount) {

        characterCount.textContent =
            "0";

    }


    updateStars();


    if (reviewImagePreview) {

        reviewImagePreview.style.display =
            "none";

    }


    if (previewImage) {

        previewImage.src =
            "";

    }

}


/* =========================================================
   LOAD REVIEWS
========================================================= */

async function loadReviews() {

    if (!productId || !reviewsList) {

        return;

    }


    reviewsList.innerHTML = `

        <div class="reviews-loading">

            <div class="small-loader"></div>

            Loading reviews...

        </div>

    `;


    try {

        const response =
            await fetch(
                `/api/products/${encodeURIComponent(
                    productId
                )}/reviews`,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            data.success !== true
        ) {

            throw new Error(
                data.message ||
                "Failed to load reviews."
            );

        }


        const reviews =
            Array.isArray(data.reviews)
                ? data.reviews
                : [];


        updateReviewSummary(
            reviews
        );


        displayReviews(
            reviews
        );

    }

    catch (error) {

        console.error(
            "Load reviews error:",
            error
        );


        reviewsList.innerHTML = `

            <div class="reviews-empty">

                Unable to load reviews.

            </div>

        `;

    }

}


/* =========================================================
   REVIEW SUMMARY
========================================================= */

function updateReviewSummary(
    reviews
) {

    if (!reviews.length) {

        if (reviewAverage) {

            reviewAverage.textContent =
                "0.0";

        }


        if (reviewCount) {

            reviewCount.textContent =
                "0 reviews";

        }


        return;

    }


    const total =
        reviews.reduce(
            (
                sum,
                review
            ) =>
                sum +
                Number(
                    review.rating || 0
                ),
            0
        );


    const average =
        total /
        reviews.length;


    if (reviewAverage) {

        reviewAverage.textContent =
            average.toFixed(1);

    }


    if (reviewCount) {

        reviewCount.textContent =
            `${reviews.length} ${
                reviews.length === 1
                    ? "review"
                    : "reviews"
            }`;

    }

}


/* =========================================================
   DISPLAY REVIEWS
========================================================= */

function displayReviews(
    reviews
) {

    if (!reviews.length) {

        reviewsList.innerHTML = `

            <div class="reviews-empty">

                <div style="font-size:40px;margin-bottom:10px;">
                    💬
                </div>

                <h3>
                    No reviews yet
                </h3>

                <p>
                    Be the first customer to review this product.
                </p>

            </div>

        `;

        return;

    }


    reviewsList.innerHTML =
        "";


    reviews.forEach(
        review => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "review-card";


            const reviewerName =
                review.username ||
                review.name ||
                "Customer";


            const rating =
                Number(
                    review.rating || 0
                );


            const stars =
                "★".repeat(
                    rating
                ) +
                "☆".repeat(
                    5 - rating
                );


            const date =
                formatReviewDate(
                    review.created_at
                );


            const imageUrl =
                review.image
                    ? getReviewImageUrl(
                        review.image
                    )
                    : "";


            card.innerHTML = `

                <div class="review-top">

                    <div class="reviewer">

                        <div class="reviewer-avatar">

                            ${escapeHTML(
                                reviewerName
                                    .charAt(0)
                                    .toUpperCase()
                            )}

                        </div>


                        <div>

                            <div class="reviewer-name">

                                ${escapeHTML(
                                    reviewerName
                                )}

                            </div>


                            <div class="review-date">

                                ${escapeHTML(
                                    date
                                )}

                            </div>

                        </div>

                    </div>


                    <div class="review-stars">

                        ${stars}

                    </div>

                </div>


                <p class="review-text">

                    ${escapeHTML(
                        review.review ||
                        review.comment ||
                        ""
                    )}

                </p>


                ${
                    imageUrl

                    ?

                    `

                    <div class="review-photo">

                        <img
                            src="${escapeAttribute(
                                imageUrl
                            )}"
                            alt="Customer review image"
                        >

                    </div>

                    `

                    :

                    ""

                }

            `;


            reviewsList.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   REVIEW IMAGE URL
========================================================= */

function getReviewImageUrl(
    image
) {

    if (!image) {

        return "";

    }


    const value =
        String(image).trim();


    if (
        value.startsWith(
            "http://"
        ) ||
        value.startsWith(
            "https://"
        )
    ) {

        return value;

    }


    if (
        value.startsWith(
            "/uploads/"
        )
    ) {

        return value;

    }


    if (
        value.startsWith(
            "uploads/"
        )
    ) {

        return "/" + value;

    }


    return "/uploads/reviews/" + value;

}


/* =========================================================
   LOAD PRODUCT RATING
========================================================= */

async function loadProductRating() {

    try {

        const response =
            await fetch(
                `/api/products/${encodeURIComponent(
                    productId
                )}`,
                {
                    cache: "no-store"
                }
            );


        const data =
            await response.json();


        if (
            response.ok &&
            data.success === true &&
            data.product
        ) {

            const rating =
                Number(
                    data.product.rating || 0
                );


            if (productRating) {

                productRating.textContent =
                    `★ ${rating.toFixed(1)}`;

            }

        }

    }

    catch (error) {

        console.error(
            "Rating refresh error:",
            error
        );

    }

}


/* =========================================================
   DATE
========================================================= */

function formatReviewDate(
    date
) {

    if (!date) {

        return "";

    }


    try {

        return new Date(
            date
        ).toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );

    }

    catch {

        return "";

    }

}


/* =========================================================
   SECURITY HELPERS
========================================================= */

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


/* =========================================================
   INITIALIZE
========================================================= */

async function initializeProductDetails() {

    await checkLogin();

    await loadProduct();

}


initializeProductDetails();