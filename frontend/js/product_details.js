
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
// PRODUCT ELEMENTS
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

const imageFallback =
    document.getElementById("imageFallback");

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

const reviewLoginMessage =
    document.getElementById("reviewLoginMessage");

const reviewLoginBtn =
    document.getElementById("reviewLoginBtn");

const reviewForm =
    document.getElementById("reviewForm");

const starRating =
    document.getElementById("starRating");

const reviewRating =
    document.getElementById("reviewRating");

const ratingText =
    document.getElementById("ratingText");

const reviewText =
    document.getElementById("reviewText");

const reviewImage =
    document.getElementById("reviewImage");

const reviewImagePreview =
    document.getElementById("reviewImagePreview");

const previewImage =
    document.getElementById("previewImage");

const removeReviewImage =
    document.getElementById("removeReviewImage");

const characterCount =
    document.getElementById("characterCount");

const submitReviewBtn =
    document.getElementById("submitReviewBtn");

const reviewFormMessage =
    document.getElementById("reviewFormMessage");

const reviewsList =
    document.getElementById("reviewsList");

const reviewAverage =
    document.getElementById("reviewAverage");

const reviewCount =
    document.getElementById("reviewCount");


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
// AR TRY-ON
// ADD-ON FEATURE
// DOES NOT CHANGE EXISTING PRODUCT/CART/REVIEW CODE
// =========================================================


// =========================================================
// AR ELEMENTS
// =========================================================

const arModal =
    document.getElementById("arModal");

const closeArModal =
    document.getElementById("closeArModal");

const startCameraBtn =
    document.getElementById("startCameraBtn");

const uploadImageBtn =
    document.getElementById("uploadImageBtn");

const arImageInput =
    document.getElementById("arImageInput");

const arCamera =
    document.getElementById("arCamera");

const arUserImage =
    document.getElementById("arUserImage");

const arProductImage =
    document.getElementById("arProductImage");

const arProductOverlay =
    document.getElementById("arProductOverlay");

const arInstruction =
    document.getElementById("arInstruction");


// =========================================================
// AR STATE
// =========================================================

let arCameraStream = null;

let arScale = 1;

let arPositionX = 0;

let arPositionY = 0;

let arDragging = false;

let arStartX = 0;

let arStartY = 0;


// =========================================================
// GET PRODUCT IMAGE
// =========================================================

function getARProductImage() {

    /*
     * Your existing product details code normally has:
     *
     * currentProduct
     *
     * Use that product image.
     */

    if (
        typeof currentProduct !== "undefined" &&
        currentProduct &&
        currentProduct.image
    ) {

        return currentProduct.image;

    }


    /*
     * Fallback:
     * Find the product image already displayed
     * on the product details page.
     */

    const existingImage =
        document.querySelector(
            "#productImage"
        );


    if (
        existingImage &&
        existingImage.src
    ) {

        return existingImage.src;

    }


    return null;

}


// =========================================================
// OPEN AR
// =========================================================

async function openAR() {

    if (!arModal) {

        console.error(
            "AR modal not found."
        );

        return;

    }


    arModal.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";


    resetARPosition();


    // =====================================================
    // PRODUCT IMAGE
    // =====================================================

    const productImage =
        getARProductImage();


    if (productImage) {

        arProductImage.src =
            productImage;

        arProductOverlay.style.display =
            "block";

    }

    else {

        arProductOverlay.style.display =
            "none";

        console.warn(
            "Product image not available for AR."
        );

    }


    // =====================================================
    // START CAMERA
    // =====================================================

    await startARCamera();

}


// =========================================================
// START CAMERA
// =========================================================

async function startARCamera() {

    stopARCamera();


    try {

        arCameraStream =
            await navigator.mediaDevices.getUserMedia({

                video: {

                    facingMode: "user",

                    width: {
                        ideal: 1280
                    },

                    height: {
                        ideal: 720
                    }

                },

                audio: false

            });


        arCamera.srcObject =
            arCameraStream;


        arCamera.style.display =
            "block";


        arUserImage.style.display =
            "none";


        arInstruction.textContent =
            "Move and resize the product to see how it looks.";


        setActiveARMode(
            startCameraBtn
        );

    }

    catch (error) {

        console.error(
            "AR CAMERA ERROR:",
            error
        );


        arCamera.style.display =
            "none";


        arInstruction.textContent =
            "Camera access was blocked. You can upload an image instead.";

    }

}


// =========================================================
// STOP CAMERA
// =========================================================

function stopARCamera() {

    if (!arCameraStream) {

        return;

    }


    arCameraStream
        .getTracks()
        .forEach(
            track => {

                track.stop();

            }
        );


    arCameraStream =
        null;


    arCamera.srcObject =
        null;

}


// =========================================================
// UPLOAD USER IMAGE
// =========================================================

if (uploadImageBtn) {

    uploadImageBtn.addEventListener(
        "click",
        () => {

            if (arImageInput) {

                arImageInput.click();

            }

        }
    );

}


// =========================================================
// HANDLE UPLOADED IMAGE
// =========================================================

if (arImageInput) {

    arImageInput.addEventListener(
        "change",
        event => {

            const file =
                event.target.files &&
                event.target.files[0];


            if (!file) {

                return;

            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please select a valid image."
                );

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function(e) {

                    stopARCamera();


                    arCamera.style.display =
                        "none";


                    arUserImage.src =
                        e.target.result;


                    arUserImage.style.display =
                        "block";


                    arInstruction.textContent =
                        "Drag and resize the product to see how it looks.";


                    setActiveARMode(
                        uploadImageBtn
                    );


                    resetARPosition();

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


// =========================================================
// SET ACTIVE MODE
// =========================================================

function setActiveARMode(button) {

    document
        .querySelectorAll(
            ".ar-mode-btn"
        )
        .forEach(
            item => {

                item.classList.remove(
                    "active"
                );

            }
        );


    if (button) {

        button.classList.add(
            "active"
        );

    }

}


// =========================================================
// CAMERA BUTTON
// =========================================================

if (startCameraBtn) {

    startCameraBtn.addEventListener(
        "click",
        async () => {

            await startARCamera();

        }
    );

}


// =========================================================
// CLOSE AR
// =========================================================

function closeAR() {

    stopARCamera();


    if (arModal) {

        arModal.classList.remove(
            "active"
        );

    }


    document.body.style.overflow =
        "";


    if (arImageInput) {

        arImageInput.value =
            "";

    }


    arUserImage.src =
        "";


    arUserImage.style.display =
        "none";


    arCamera.style.display =
        "none";

}


if (closeArModal) {

    closeArModal.addEventListener(
        "click",
        closeAR
    );

}


// =========================================================
// CLOSE WHEN CLICKING BACKGROUND
// =========================================================

if (arModal) {

    arModal.addEventListener(
        "click",
        event => {

            if (
                event.target === arModal
            ) {

                closeAR();

            }

        }
    );

}


// =========================================================
// ESCAPE KEY
// =========================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            arModal &&
            arModal.classList.contains(
                "active"
            )
        ) {

            closeAR();

        }

    }
);


// =========================================================
// RESET PRODUCT POSITION
// =========================================================

function resetARPosition() {

    arScale = 1;

    arPositionX = 0;

    arPositionY = 0;

    updateARProduct();

}


// =========================================================
// UPDATE PRODUCT POSITION
// =========================================================

function updateARProduct() {

    if (!arProductOverlay) {

        return;

    }


    arProductOverlay.style.transform =
        `
        translate(
            calc(-50% + ${arPositionX}px),
            calc(-50% + ${arPositionY}px)
        )
        scale(${arScale})
        `;

}


// =========================================================
// ZOOM IN
// =========================================================

const arZoomIn =
    document.getElementById(
        "arZoomIn"
    );


if (arZoomIn) {

    arZoomIn.addEventListener(
        "click",
        () => {

            arScale += 0.1;


            if (arScale > 3) {

                arScale = 3;

            }


            updateARProduct();

        }
    );

}


// =========================================================
// ZOOM OUT
// =========================================================

const arZoomOut =
    document.getElementById(
        "arZoomOut"
    );


if (arZoomOut) {

    arZoomOut.addEventListener(
        "click",
        () => {

            arScale -= 0.1;


            if (arScale < 0.3) {

                arScale = 0.3;

            }


            updateARProduct();

        }
    );

}


// =========================================================
// MOVE PRODUCT
// =========================================================

function moveARProduct(
    x,
    y
) {

    arPositionX += x;

    arPositionY += y;

    updateARProduct();

}


const arMoveUp =
    document.getElementById(
        "arMoveUp"
    );


const arMoveDown =
    document.getElementById(
        "arMoveDown"
    );


const arMoveLeft =
    document.getElementById(
        "arMoveLeft"
    );


const arMoveRight =
    document.getElementById(
        "arMoveRight"
    );


if (arMoveUp) {

    arMoveUp.addEventListener(
        "click",
        () => {

            moveARProduct(
                0,
                -15
            );

        }
    );

}


if (arMoveDown) {

    arMoveDown.addEventListener(
        "click",
        () => {

            moveARProduct(
                0,
                15
            );

        }
    );

}


if (arMoveLeft) {

    arMoveLeft.addEventListener(
        "click",
        () => {

            moveARProduct(
                -15,
                0
            );

        }
    );

}


if (arMoveRight) {

    arMoveRight.addEventListener(
        "click",
        () => {

            moveARProduct(
                15,
                0
            );

        }
    );

}


// =========================================================
// DRAG PRODUCT WITH MOUSE
// =========================================================

if (arProductOverlay) {

    arProductOverlay.addEventListener(
        "pointerdown",
        event => {

            arDragging = true;


            arProductOverlay.setPointerCapture(
                event.pointerId
            );


            arStartX =
                event.clientX -
                arPositionX;


            arStartY =
                event.clientY -
                arPositionY;


            arProductOverlay.style.cursor =
                "grabbing";

        }
    );


    arProductOverlay.addEventListener(
        "pointermove",
        event => {

            if (!arDragging) {

                return;

            }


            arPositionX =
                event.clientX -
                arStartX;


            arPositionY =
                event.clientY -
                arStartY;


            updateARProduct();

        }
    );


    arProductOverlay.addEventListener(
        "pointerup",
        event => {

            arDragging = false;


            try {

                arProductOverlay.releasePointerCapture(
                    event.pointerId
                );

            }

            catch (error) {

                // Ignore pointer release errors.

            }


            arProductOverlay.style.cursor =
                "grab";

        }
    );


    arProductOverlay.addEventListener(
        "pointercancel",
        () => {

            arDragging = false;

            arProductOverlay.style.cursor =
                "grab";

        }
    );

}


// =========================================================
// CONNECT EXISTING TRY AR BUTTON
// =========================================================

/*
 * IMPORTANT:
 *
 * Your existing product-details page already has
 * a Try AR button.
 *
 * We find it without changing the existing button.
 */


const existingTryARButton =
    document.getElementById(
        "tryOnBtn"
    );


if (existingTryARButton) {

    existingTryARButton.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();

            openAR();

        }
    );

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


        console.log(
            "LOGIN STATUS:",
            data
        );


        if (
            response.ok &&
            data.success === true &&
            data.loggedIn === true &&
            data.user
        ) {

            userLoggedIn = true;
            currentUser = data.user;

        }

        else {

            userLoggedIn = false;
            currentUser = null;

        }

    }

    catch (error) {

        console.error(
            "LOGIN CHECK ERROR:",
            error
        );

        userLoggedIn = false;
        currentUser = null;

    }


    // Login button should always remain Login

    if (loginNav) {

        loginNav.textContent =
            "Login";

    }


    updateReviewLoginUI();

    return userLoggedIn;

}


// =========================================================
// REVIEW LOGIN UI
// =========================================================

function updateReviewLoginUI() {

    if (
        !reviewLoginMessage ||
        !reviewForm
    ) {

        return;

    }


    if (userLoggedIn) {

        reviewLoginMessage.style.display =
            "none";

        reviewForm.style.display =
            "block";

    }

    else {

        reviewLoginMessage.style.display =
            "flex";

        reviewForm.style.display =
            "none";

    }

}


// =========================================================
// REVIEW LOGIN BUTTON
// =========================================================

if (reviewLoginBtn) {

    reviewLoginBtn.addEventListener(
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

        loading.style.display =
            "block";

        errorMessage.style.display =
            "none";

        productDetails.style.display =
            "none";

        reviewsSection.style.display =
            "none";


        const response =
            await fetch(
                `/api/products/${encodeURIComponent(productId)}`,
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store"
                }
            );


        const data =
            await response.json();


        console.log(
            "PRODUCT RESPONSE:",
            data
        );


        if (
            !response.ok ||
            data.success !== true ||
            !data.product
        ) {

            showError();

            return;

        }


        currentProduct =
            data.product;

        window.currentProduct =
            currentProduct;


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

    if (!product) {

        showError();

        return;

    }


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
        Number(product.stock || 0);


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


    quantityInput.min =
        "1";

    quantityInput.max =
        stock > 0
            ? stock
            : 1;

    quantityInput.value =
        "1";


    addToCartBtn.disabled =
        stock <= 0;

    buyNowBtn.disabled =
        stock <= 0;


    if (product.image) {

        productImage.src =
            product.image;

        productImage.style.display =
            "block";

        imageFallback.style.display =
            "none";

    }

    else {

        productImage.style.display =
            "none";

        imageFallback.style.display =
            "flex";

    }

}


// =========================================================
// SHOW PRODUCT ERROR
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
// QUANTITY DECREASE
// =========================================================

if (decreaseBtn) {

    decreaseBtn.addEventListener(
        "click",
        () => {

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
// QUANTITY INCREASE
// =========================================================

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
// QUANTITY INPUT
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

                alert(
                    "Product is not loaded yet."
                );

                return;

            }


            const quantity =
                Number(
                    quantityInput.value
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


                if (
                    response.status === 401
                ) {

                    userLoggedIn =
                        false;

                    updateReviewLoginUI();

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
                    response.status === 401
                ) {

                    userLoggedIn =
                        false;

                    updateReviewLoginUI();

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


                const ratingLabels = {
                    1: "Poor",
                    2: "Fair",
                    3: "Good",
                    4: "Very Good",
                    5: "Excellent"
                };


                ratingText.textContent =
                    ratingLabels[
                        selectedRating
                    ];

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


            star.classList.toggle(
                "active",
                value <= selectedRating
            );

        }
    );

}


// =========================================================
// REVIEW CHARACTER COUNT
// =========================================================

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


// =========================================================
// REVIEW IMAGE PREVIEW
// =========================================================

if (reviewImage) {

    reviewImage.addEventListener(
        "change",
        () => {

            const file =
                reviewImage.files?.[0];


            if (!file) {

                clearReviewImage();

                return;

            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please select a valid image."
                );

                reviewImage.value =
                    "";

                clearReviewImage();

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

                clearReviewImage();

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                event => {

                    if (previewImage) {

                        previewImage.src =
                            event.target.result;

                    }


                    if (reviewImagePreview) {

                        reviewImagePreview.style.display =
                            "block";

                    }

                };


            reader.readAsDataURL(file);

        }
    );

}


// =========================================================
// REMOVE REVIEW IMAGE
// =========================================================

if (removeReviewImage) {

    removeReviewImage.addEventListener(
        "click",
        clearReviewImage
    );

}


// =========================================================
// CLEAR REVIEW IMAGE
// =========================================================

function clearReviewImage() {

    if (reviewImage) {

        reviewImage.value =
            "";

    }


    if (previewImage) {

        previewImage.src =
            "";

    }


    if (reviewImagePreview) {

        reviewImagePreview.style.display =
            "none";

    }

}


// =========================================================
// SUBMIT REVIEW
// =========================================================

if (reviewForm) {

    reviewForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            // =================================================
            // CHECK LOGIN
            // =================================================

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


            // =================================================
            // CHECK PRODUCT
            // =================================================

            if (!currentProduct) {

                alert(
                    "Product is not loaded yet."
                );

                return;

            }


            // =================================================
            // PRODUCT ID
            // =================================================

            const productId =
                Number(
                    currentProduct.id
                );


            if (
                !Number.isInteger(productId) ||
                productId <= 0
            ) {

                alert(
                    "Invalid product ID."
                );

                return;

            }


            // =================================================
            // RATING
            // =================================================

            const rating =
                Number(
                    reviewRating.value
                );


            if (
                !Number.isInteger(rating) ||
                rating < 1 ||
                rating > 5
            ) {

                alert(
                    "Please select a rating."
                );

                return;

            }


            // =================================================
            // REVIEW TEXT
            // =================================================

            const text =
                reviewText.value.trim();


            if (!text) {

                alert(
                    "Please write your review."
                );

                return;

            }


            if (text.length > 1000) {

                alert(
                    "Review must be 1000 characters or less."
                );

                return;

            }


            // =================================================
            // FORM DATA
            // =================================================

            const formData =
                new FormData();


            formData.append(
                "rating",
                String(rating)
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


            // =================================================
            // BUTTON STATE
            // =================================================

            const oldButtonText =
                submitReviewBtn
                    ? submitReviewBtn.textContent
                    : "Submit Review";


            if (submitReviewBtn) {

                submitReviewBtn.disabled =
                    true;

                submitReviewBtn.textContent =
                    "Submitting...";

            }


            if (reviewFormMessage) {

                reviewFormMessage.textContent =
                    "";

            }


            try {

                // =================================================
                // IMPORTANT:
                //
                // BACKEND ROUTE IS:
                //
                // POST /api/reviews/product/:productId
                //
                // =================================================

                const reviewUrl =
                    `/api/reviews/product/${encodeURIComponent(
                        productId
                    )}`;


                console.log(
                    "SUBMIT REVIEW URL:",
                    reviewUrl
                );


                const response =
                    await fetch(
                        reviewUrl,
                        {
                            method: "POST",

                            credentials:
                                "include",

                            body:
                                formData
                        }
                    );


                // =================================================
                // READ RESPONSE SAFELY
                // =================================================

                let data = null;

                try {

                    data =
                        await response.json();

                }

                catch (jsonError) {

                    console.error(
                        "INVALID SERVER RESPONSE:",
                        jsonError
                    );

                }


                console.log(
                    "REVIEW SUBMIT STATUS:",
                    response.status
                );

                console.log(
                    "REVIEW SUBMIT RESPONSE:",
                    data
                );


                // =================================================
                // NOT LOGGED IN
                // =================================================

                if (
                    response.status === 401
                ) {

                    userLoggedIn =
                        false;

                    currentUser =
                        null;

                    updateReviewLoginUI();

                    sessionStorage.setItem(
                        "loginRedirect",
                        window.location.href
                    );

                    showLoginModal();

                    return;

                }


                // =================================================
                // NOT FOUND
                // =================================================

                if (
                    response.status === 404
                ) {

                    const message =
                        data?.message ||
                        "Review endpoint was not found. Check the server route.";

                    console.error(
                        "REVIEW 404:",
                        message
                    );

                    alert(
                        `Failed to submit review.\n\nServer returned 404.\n${message}`
                    );

                    return;

                }


                // =================================================
                // OTHER ERROR
                // =================================================

                if (
                    !response.ok ||
                    !data ||
                    data.success !== true
                ) {

                    const message =
                        data?.message ||
                        `Server returned ${response.status}.`;

                    console.error(
                        "REVIEW SUBMIT ERROR:",
                        message
                    );

                    alert(
                        `Failed to submit review.\n\n${message}`
                    );

                    return;

                }


                // =================================================
                // SUCCESS
                // =================================================

                alert(
                    "Review submitted successfully! ⭐"
                );


                // Clear form

                resetReviewForm();


                // Reload reviews

                await loadReviews(
                    productId
                );


                // Refresh product rating

                await refreshProduct();

            }

            catch (error) {

                console.error(
                    "SUBMIT REVIEW ERROR:",
                    error
                );

                alert(
                    "Unable to submit review. Please check that the server is running."
                );

            }

            finally {

                if (submitReviewBtn) {

                    submitReviewBtn.disabled =
                        false;

                    submitReviewBtn.textContent =
                        oldButtonText;

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


    if (ratingText) {

        ratingText.textContent =
            "Select a rating";

    }


    updateStars();


    clearReviewImage();


    if (characterCount) {

        characterCount.textContent =
            "0";

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

            <div class="small-loader"></div>

            Loading reviews...

        </div>

    `;


    try {

        const reviewUrl =
            `/api/reviews/product/${encodeURIComponent(
                productId
            )}`;


        console.log(
            "LOADING REVIEWS:",
            reviewUrl
        );


        const response =
            await fetch(
                reviewUrl,
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store"
                }
            );


        let data = null;


        try {

            data =
                await response.json();

        }

        catch (jsonError) {

            console.error(
                "INVALID REVIEW RESPONSE:",
                jsonError
            );

        }


        console.log(
            "REVIEWS STATUS:",
            response.status
        );


        console.log(
            "REVIEWS RESPONSE:",
            data
        );


        if (
            !response.ok ||
            !data ||
            data.success !== true
        ) {

            reviewsList.innerHTML = `

                <div class="no-reviews">

                    <div class="no-reviews-icon">
                        ⚠️
                    </div>

                    <p>
                        ${
                            escapeHTML(
                                data?.message ||
                                "Unable to load reviews."
                            )
                        }
                    </p>

                </div>

            `;

            return;

        }


        const reviews =
            Array.isArray(data.reviews)
                ? data.reviews
                : [];


        updateReviewSummary(
            reviews,
            data.averageRating,
            data.reviewCount
        );


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
// REVIEW SUMMARY
// =========================================================

function updateReviewSummary(
    reviews,
    apiAverage,
    apiCount
) {

    let average =
        Number(apiAverage);


    let count =
        Number(apiCount);


    if (
        !Number.isFinite(average)
    ) {

        if (reviews.length > 0) {

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


            average =
                total /
                reviews.length;

        }

        else {

            average =
                0;

        }

    }


    if (
        !Number.isFinite(count)
    ) {

        count =
            reviews.length;

    }


    if (reviewAverage) {

        reviewAverage.textContent =
            average.toFixed(1);

    }


    if (reviewCount) {

        reviewCount.textContent =
            `${count} ${
                count === 1
                    ? "review"
                    : "reviews"
            }`;

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
                Math.round(
                    Number(
                        review.rating || 0
                    )
                )
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
// REFRESH PRODUCT
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

    productCategory.textContent =
        product.category_name ||
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
        Number(product.stock || 0);


    productStock.textContent =
        stock > 0
            ? `${stock} available`
            : "Out of stock";


    productStock.className =
        stock > 0
            ? "stock-available"
            : "stock-unavailable";


    quantityInput.max =
        stock > 0
            ? stock
            : 1;


    addToCartBtn.disabled =
        stock <= 0;


    buyNowBtn.disabled =
        stock <= 0;

}


// =========================================================
// ESCAPE KEY
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
// CLOSE MODAL WHEN CLICKING OUTSIDE
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
// INITIALIZE
// =========================================================

async function initialize() {

    console.log(
        "========================================"
    );

    console.log(
        "PRODUCT DETAILS INITIALIZING"
    );

    console.log(
        "========================================"
    );


    const productId =
        getProductId();


    console.log(
        "PRODUCT ID:",
        productId
    );


    if (!productId) {

        showError();

        return;

    }


    // Check login first

    await checkUserLogin();


    // Load product and reviews

    await loadProduct();

}


// =========================================================
// START
// =========================================================

initialize();
