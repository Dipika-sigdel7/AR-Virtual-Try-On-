// =========================================================
// AR ECOMMERCE
// PRODUCT DETAILS PAGE
// PRODUCT + CART + REVIEWS
// =========================================================


// =========================================================
// GLOBAL
// =========================================================

let currentProduct = null;

let currentUser = null;

let userLoggedIn = false;

let selectedRating = 0;


// =========================================================
// ELEMENTS
// =========================================================

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

const reviewsSection =
    document.getElementById(
        "reviewsSection"
    );

const productImage =
    document.getElementById(
        "productImage"
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


// =========================================================
// REVIEW ELEMENTS
// =========================================================

const writeReviewBtn =
    document.getElementById(
        "writeReviewBtn"
    );

const reviewFormContainer =
    document.getElementById(
        "reviewFormContainer"
    );

const reviewForm =
    document.getElementById(
        "reviewForm"
    );

const reviewRating =
    document.getElementById(
        "reviewRating"
    );

const reviewText =
    document.getElementById(
        "reviewText"
    );

const reviewImage =
    document.getElementById(
        "reviewImage"
    );

const imagePreview =
    document.getElementById(
        "imagePreview"
    );

const reviewsList =
    document.getElementById(
        "reviewsList"
    );

const cancelReviewBtn =
    document.getElementById(
        "cancelReviewBtn"
    );

const submitReviewBtn =
    document.getElementById(
        "submitReviewBtn"
    );


// =========================================================
// LOGIN MODAL
// =========================================================

const loginModal =
    document.getElementById(
        "loginModal"
    );

const closeLoginModal =
    document.getElementById(
        "closeLoginModal"
    );

const goToLoginBtn =
    document.getElementById(
        "goToLoginBtn"
    );

const continueShoppingBtn =
    document.getElementById(
        "continueShoppingBtn"
    );


// =========================================================
// GET PRODUCT ID
// =========================================================

function getProductId() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return params.get(
        "id"
    );

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        value ?? "";

    return div.innerHTML;

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

            if (loginNav) {

                loginNav.textContent =
                    "Login";

            }

            return true;

        }


        userLoggedIn = false;

        currentUser = null;

        return false;

    }

    catch (error) {

        console.error(
            "Login check error:",
            error
        );

        userLoggedIn = false;

        currentUser = null;

        return false;

    }

}


// =========================================================
// LOAD PRODUCT
// =========================================================

async function loadProduct() {

    const productId =
        getProductId();


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

            showError();

            return;

        }


        currentProduct =
            data.product;


        displayProduct(
            currentProduct
        );


        await loadReviews(
            productId
        );

    }

    catch (error) {

        console.error(
            "PRODUCT LOAD ERROR:",
            error
        );

        showError();

    }

}


// =========================================================
// DISPLAY PRODUCT
// =========================================================

function displayProduct(product) {

    loading.style.display =
        "none";


    errorMessage.style.display =
        "none";


    productDetails.style.display =
        "grid";


    reviewsSection.style.display =
        "block";


    productCategory.textContent =
        product.category_name ||
        product.category ||
        "Uncategorized";


    productName.textContent =
        product.name ||
        "Product";


    productRating.textContent =
        `★ ${Number(
            product.rating || 0
        ).toFixed(1)}`;


    productPrice.textContent =
        `Rs. ${Number(
            product.price || 0
        ).toFixed(2)}`;


    productDescription.textContent =
        product.description ||
        "No description available.";


    const stock =
        Number(
            product.stock || 0
        );


    if (stock > 0) {

        productStock.textContent =
            `${stock} available`;

        productStock.className =
            "stock-available";

        quantityInput.max =
            stock;

    }

    else {

        productStock.textContent =
            "Out of stock";

        productStock.className =
            "stock-unavailable";

        addToCartBtn.disabled =
            true;

        buyNowBtn.disabled =
            true;

    }


    // ---------------------------------------------
    // IMAGE
    // ---------------------------------------------

    if (
        product.image
    ) {

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


    // ---------------------------------------------
    // SAVE PRODUCT
    // ---------------------------------------------

    window.currentProduct =
        product;

}


// =========================================================
// ERROR
// =========================================================

function showError() {

    loading.style.display =
        "none";


    productDetails.style.display =
        "none";


    reviewsSection.style.display =
        "none";


    errorMessage.style.display =
        "block";

}


// =========================================================
// QUANTITY
// =========================================================

if (decreaseBtn) {

    decreaseBtn.addEventListener(
        "click",
        () => {

            let quantity =
                Number(
                    quantityInput.value
                ) || 1;


            if (
                quantity > 1
            ) {

                quantity--;

            }


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
        "change",
        () => {

            let quantity =
                Number(
                    quantityInput.value
                ) || 1;


            const stock =
                Number(
                    currentProduct?.stock || 0
                );


            if (
                quantity < 1
            ) {

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

                return;

            }


            const quantity =
                Number(
                    quantityInput.value
                ) || 1;


            addToCartBtn.disabled =
                true;


            const oldText =
                addToCartBtn.textContent;


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


                if (
                    response.status === 401
                ) {

                    userLoggedIn = false;

                    showLoginModal();

                    return;

                }


                if (
                    !response.ok ||
                    data.success !== true
                ) {

                    alert(
                        data.message ||
                        "Failed to add product."
                    );

                    return;

                }


                addToCartBtn.textContent =
                    "Added ✓";


                addToCartBtn.style.background =
                    "#16a34a";


                setTimeout(
                    () => {

                        addToCartBtn.textContent =
                            oldText;

                        addToCartBtn.style.background =
                            "";

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

                return;

            }


            const quantity =
                Number(
                    quantityInput.value
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

            reviewForm.reset();

            selectedRating = 0;

            reviewRating.value =
                "0";


            updateStars();


            imagePreview.innerHTML =
                "";

            imagePreview.style.display =
                "none";


            reviewFormContainer.style.display =
                "none";


            writeReviewBtn.style.display =
                "block";

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


                reviewRating.value =
                    selectedRating;


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
                reviewImage.files[0];


            if (!file) {

                imagePreview.innerHTML =
                    "";

                imagePreview.style.display =
                    "none";

                return;

            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please select an image file."
                );

                reviewImage.value =
                    "";

                return;

            }


            if (
                file.size >
                5 * 1024 * 1024
            ) {

                alert(
                    "Image must be smaller than 5MB."
                );

                reviewImage.value =
                    "";

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function (
                    event
                ) {

                    imagePreview.innerHTML = `

                        <img
                            src="${event.target.result}"
                            alt="Review image preview"
                        >

                    `;


                    imagePreview.style.display =
                        "block";

                };


            reader.readAsDataURL(
                file
            );

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

                showLoginModal();

                return;

            }


            if (!currentProduct) {

                return;

            }


            const rating =
                Number(
                    reviewRating.value
                );


            const text =
                reviewText.value.trim();


            if (
                rating < 1 ||
                rating > 5
            ) {

                alert(
                    "Please select a rating."
                );

                return;

            }


            if (!text) {

                alert(
                    "Please write your review."
                );

                return;

            }


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
                reviewImage.files.length > 0
            ) {

                formData.append(
                    "image",
                    reviewImage.files[0]
                );

            }


            submitReviewBtn.disabled =
                true;


            submitReviewBtn.textContent =
                "Submitting...";


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


                if (
                    response.status === 401
                ) {

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


                alert(
                    "Review submitted successfully! ⭐"
                );


                reviewForm.reset();


                selectedRating =
                    0;


                reviewRating.value =
                    "0";


                updateStars();


                imagePreview.innerHTML =
                    "";


                imagePreview.style.display =
                    "none";


                reviewFormContainer.style.display =
                    "none";


                writeReviewBtn.style.display =
                    "block";


                await loadReviews(
                    currentProduct.id
                );


                // Refresh product rating
                await loadProduct();

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

                submitReviewBtn.disabled =
                    false;

                submitReviewBtn.textContent =
                    "Submit Review";

            }

        }
    );

}


// =========================================================
// LOAD REVIEWS
// =========================================================

async function loadReviews(
    productId
) {

    if (!reviewsList) {

        return;

    }


    reviewsList.innerHTML = `

        <div class="reviews-loading">

            <div class="loader small"></div>

            Loading reviews...

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
                    cache: "no-store"
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            data.success !== true
        ) {

            reviewsList.innerHTML = `

                <div class="no-reviews">

                    <div class="no-reviews-icon">
                        💬
                    </div>

                    <p>
                        Unable to load reviews.
                    </p>

                </div>

            `;

            return;

        }


        const reviews =
            Array.isArray(
                data.reviews
            )
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

function createReviewCard(
    review
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "review-card";


    const rating =
        Number(
            review.rating || 0
        );


    const starsHTML =
        "★".repeat(rating) +
        "☆".repeat(
            5 - rating
        );


    let dateText =
        "";


    if (
        review.created_at
    ) {

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
// ESCAPE ATTRIBUTE
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
// CLOSE MODAL WITH ESC
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
// INITIALIZE
// =========================================================

async function initialize() {

    await checkUserLogin();

    await loadProduct();

}


initialize();