// =========================================================
// AR E-COMMERCE
// PRODUCT DETAILS PAGE
// PRODUCT + CART + REVIEWS + AUTOMATIC FACE TRACKING
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
// AR CONTROLS
// =========================================================

const arZoomIn =
    document.getElementById("arZoomIn");

const arZoomOut =
    document.getElementById("arZoomOut");

const arMoveUp =
    document.getElementById("arMoveUp");

const arMoveDown =
    document.getElementById("arMoveDown");

const arMoveLeft =
    document.getElementById("arMoveLeft");

const arMoveRight =
    document.getElementById("arMoveRight");


// =========================================================
// AR CAMERA STATE
// =========================================================

let arCameraStream = null;

let arScale = 1;

let arPositionX = 0;

let arPositionY = 0;


// =========================================================
// MANUAL AR CONTROL STATE
// =========================================================

let arDragging = false;

let arStartX = 0;

let arStartY = 0;


// =========================================================
// FACE TRACKING STATE
// =========================================================

let faceLandmarker = null;

let faceTrackingReady = false;

let faceTrackingInitializing = false;

let arAnimationFrame = null;

let lastVideoTime = -1;

let lastFaceDetected = false;


// =========================================================
// FACE SMOOTHING
// =========================================================

let smoothedFaceX = null;

let smoothedFaceY = null;

let smoothedFaceWidth = null;

let smoothedFaceHeight = null;

const FACE_SMOOTHING = 0.30;


// =========================================================
// AR MODE
// =========================================================

let currentARMode = "camera";


// =========================================================
// AUTOMATIC TRACKING
// =========================================================

let automaticTrackingEnabled = true;


// =========================================================
// PRODUCT ID
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
// GET PRODUCT IMAGE
// IMPORTANT IMAGE FIX
// =========================================================

function getProductImage(product) {

    if (!product) {
        return null;
    }

    /*
     * Different APIs/databases may return
     * the product image using different fields.
     */
    let image =
        product.image_url ||
        product.image ||
        product.image_path ||
        product.product_image ||
        product.imageUrl ||
        product.imagePath ||
        null;

    if (!image) {

        console.warn(
            "Product has no image field:",
            product
        );

        return null;
    }

    image =
        String(image).trim();

    if (!image) {
        return null;
    }

    /*
     * Complete external URL.
     *
     * Example:
     * https://example.com/image.jpg
     */
    if (
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {

        return image;
    }

    /*
     * Base64 image.
     */
    if (
        image.startsWith("data:image/")
    ) {

        return image;
    }

    /*
     * Convert Windows path to URL path.
     *
     * uploads\products\watch.jpg
     *
     * becomes:
     *
     * uploads/products/watch.jpg
     */
    image =
        image.replace(/\\/g, "/");

    /*
     * Remove ./ from beginning.
     */
    image =
        image.replace(/^\.\/+/, "");

    /*
     * If the backend already returned
     * an absolute website path:
     *
     * /uploads/products/watch.jpg
     */
    if (
        image.startsWith("/")
    ) {

        return image;
    }

    /*
     * Remove unnecessary "frontend/"
     * if your database accidentally stores it.
     */
    if (
        image.startsWith("frontend/")
    ) {

        image =
            image.substring(
                "frontend/".length
            );
    }

    /*
     * Convert relative path to
     * browser URL.
     *
     * uploads/products/watch.jpg
     *
     * becomes:
     *
     * /uploads/products/watch.jpg
     */
    return `/${image}`;
}


// =========================================================
// SET PRODUCT IMAGE
// CENTRAL IMAGE FUNCTION
// =========================================================

function setProductImage(
    product
) {

    if (!productImage) {
        return null;
    }

    const image =
        getProductImage(product);

    console.log(
        "========================================"
    );

    console.log(
        "PRODUCT IMAGE"
    );

    console.log(
        "Database/API image:",
        product?.image
    );

    console.log(
        "image_url:",
        product?.image_url
    );

    console.log(
        "image_path:",
        product?.image_path
    );

    console.log(
        "product_image:",
        product?.product_image
    );

    console.log(
        "Final browser image URL:",
        image
    );

    console.log(
        "========================================"
    );


    if (!image) {

        productImage.style.display =
            "none";

        productImage.removeAttribute(
            "src"
        );

        if (imageFallback) {

            imageFallback.style.display =
                "flex";
        }

        return null;
    }


    /*
     * Prevent previous handlers from
     * affecting the new image.
     */
    productImage.onerror =
        null;

    productImage.onload =
        null;


    /*
     * Show image.
     */
    productImage.style.display =
        "block";


    /*
     * Show fallback until image
     * successfully loads.
     */
    if (imageFallback) {

        imageFallback.style.display =
            "none";
    }


    /*
     * Handle successful loading.
     */
    productImage.onload =
        function () {

            console.log(
                "PRODUCT IMAGE LOADED:",
                image
            );

            productImage.style.display =
                "block";

            if (imageFallback) {

                imageFallback.style.display =
                    "none";
            }
        };


    /*
     * Handle failed loading.
     */
    productImage.onerror =
        function () {

            console.error(
                "========================================"
            );

            console.error(
                "PRODUCT IMAGE FAILED TO LOAD"
            );

            console.error(
                "Requested URL:",
                image
            );

            console.error(
                "Product:",
                product
            );

            console.error(
                "========================================"
            );


            productImage.style.display =
                "none";

            if (imageFallback) {

                imageFallback.style.display =
                    "flex";
            }
        };


    /*
     * Finally set the source.
     */
    productImage.src =
        image;


    return image;
}


// =========================================================
// GET AR PRODUCT IMAGE
// =========================================================

function getARProductImage() {

    /*
     * First use the product object.
     */
    const productImageURL =
        getProductImage(
            currentProduct
        );

    if (productImageURL) {

        return productImageURL;
    }


    /*
     * If product object doesn't contain
     * image, use the already displayed
     * product image.
     */
    if (
        productImage &&
        productImage.src &&
        productImage.src !==
            window.location.href
    ) {

        return productImage.src;
    }


    return null;
}


// =========================================================
// GET AR PRODUCT TYPE
// =========================================================

function getARProductType() {

    const category =
        String(
            currentProduct?.category_name ||
            currentProduct?.category ||
            ""
        ).toLowerCase();

    const name =
        String(
            currentProduct?.name ||
            ""
        ).toLowerCase();

    const combined =
        `${category} ${name}`;


    if (
        combined.includes("glass") ||
        combined.includes("eyewear") ||
        combined.includes("spectacle") ||
        combined.includes("sunglass")
    ) {

        return "glasses";
    }


    if (
        combined.includes("hat") ||
        combined.includes("cap") ||
        combined.includes("helmet")
    ) {

        return "head";
    }


    if (
        combined.includes("mask")
    ) {

        return "mask";
    }


    if (
        combined.includes("earring") ||
        combined.includes("ear ring")
    ) {

        return "earrings";
    }


    if (
        combined.includes("necklace") ||
        combined.includes("chain")
    ) {

        return "necklace";
    }


    return "generic";
}


// =========================================================
// GET AR ANCHOR
// =========================================================

function getARAnchor(
    faceX,
    faceY,
    faceWidth,
    faceHeight
) {

    const type =
        getARProductType();


    switch (type) {

        case "glasses":

            return {

                x: faceX,

                y:
                    faceY -
                    faceHeight * 0.03,

                scale:
                    faceWidth / 170
            };


        case "head":

            return {

                x: faceX,

                y:
                    faceY -
                    faceHeight * 0.42,

                scale:
                    faceWidth / 150
            };


        case "mask":

            return {

                x: faceX,

                y:
                    faceY +
                    faceHeight * 0.10,

                scale:
                    faceWidth / 150
            };


        case "earrings":

            return {

                x: faceX,

                y:
                    faceY +
                    faceHeight * 0.02,

                scale:
                    faceWidth / 180
            };


        case "necklace":

            return {

                x: faceX,

                y:
                    faceY +
                    faceHeight * 0.48,

                scale:
                    faceWidth / 180
            };


        default:

            return {

                x: faceX,

                y: faceY,

                scale:
                    faceWidth / 170
            };
    }
}


// =========================================================
// RESET FACE SMOOTHING
// =========================================================

function resetFaceSmoothing() {

    smoothedFaceX = null;

    smoothedFaceY = null;

    smoothedFaceWidth = null;

    smoothedFaceHeight = null;
}


// =========================================================
// SMOOTH VALUE
// =========================================================

function smoothValue(
    previous,
    next
) {

    if (
        previous === null ||
        !Number.isFinite(previous)
    ) {

        return next;
    }


    return (
        previous +
        (
            next -
            previous
        ) *
        FACE_SMOOTHING
    );
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


    const image =
        getARProductImage();


    if (!image) {

        alert(
            "This product does not have an image available for AR."
        );

        return;
    }


    console.log(
        "Opening AR with image:",
        image
    );


    arModal.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";


    currentARMode =
        "camera";


    automaticTrackingEnabled =
        true;


    arDragging =
        false;


    resetARPosition();

    resetFaceSmoothing();


    if (arProductImage) {

        arProductImage.onerror =
            function () {

                console.error(
                    "AR PRODUCT IMAGE FAILED:",
                    image
                );
            };


        arProductImage.onload =
            function () {

                console.log(
                    "AR PRODUCT IMAGE LOADED:",
                    image
                );
            };


        arProductImage.src =
            image;

        arProductImage.style.display =
            "block";
    }


    if (arProductOverlay) {

        arProductOverlay.style.display =
            "block";
    }


    if (arInstruction) {

        arInstruction.textContent =
            "Starting camera...";
    }


    await startARCamera();
}


// =========================================================
// START CAMERA
// =========================================================

async function startARCamera() {

    stopARCamera();

    resetFaceSmoothing();

    arDragging =
        false;

    automaticTrackingEnabled =
        true;

    currentARMode =
        "camera";


    try {

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            throw new Error(
                "Camera API is not supported."
            );
        }


        arCameraStream =
            await navigator.mediaDevices.getUserMedia({

                video: {

                    facingMode: {
                        ideal: "user"
                    },

                    width: {
                        ideal: 1280
                    },

                    height: {
                        ideal: 720
                    },

                    frameRate: {
                        ideal: 30
                    }

                },

                audio: false
            });


        if (!arCamera) {

            throw new Error(
                "Camera element not found."
            );
        }


        arCamera.srcObject =
            arCameraStream;


        arCamera.style.display =
            "block";


        if (arUserImage) {

            arUserImage.style.display =
                "none";
        }


        setActiveARMode(
            startCameraBtn
        );


        const playCamera =
            async () => {

                try {

                    await arCamera.play();

                }

                catch (error) {

                    console.warn(
                        "Camera play warning:",
                        error
                    );
                }


                if (arInstruction) {

                    arInstruction.textContent =
                        "Detecting your face...";
                }


                const ready =
                    await waitForFaceLandmarker();


                if (ready) {

                    startFaceTracking();

                }

                else {

                    if (arInstruction) {

                        arInstruction.textContent =
                            "Face tracking is unavailable. You can position the product manually.";
                    }
                }
            };


        if (
            arCamera.readyState >=
            HTMLMediaElement.HAVE_METADATA
        ) {

            await playCamera();

        }

        else {

            arCamera.onloadedmetadata =
                playCamera;
        }

    }

    catch (error) {

        console.error(
            "AR CAMERA ERROR:",
            error
        );


        stopARCamera();


        if (arCamera) {

            arCamera.style.display =
                "none";
        }


        if (arInstruction) {

            arInstruction.textContent =
                "Camera access was blocked. You can upload a photo instead.";
        }
    }
}


// =========================================================
// WAIT FOR MEDIAPIPE
// =========================================================

async function waitForFaceLandmarker() {

    if (faceTrackingReady) {

        return true;
    }


    if (
        window.FaceLandmarker &&
        window.FilesetResolver
    ) {

        return await initializeFaceLandmarker();
    }


    return new Promise(
        resolve => {

            let completed =
                false;


            const finish =
                async () => {

                    if (completed) {

                        return;
                    }


                    completed =
                        true;


                    window.removeEventListener(
                        "mediapipe-ready",
                        finish
                    );


                    const result =
                        await initializeFaceLandmarker();


                    resolve(result);
                };


            window.addEventListener(
                "mediapipe-ready",
                finish,
                {
                    once: true
                }
            );


            setTimeout(
                async () => {

                    if (completed) {

                        return;
                    }


                    if (
                        window.FaceLandmarker &&
                        window.FilesetResolver
                    ) {

                        await finish();

                    }

                    else {

                        completed =
                            true;


                        window.removeEventListener(
                            "mediapipe-ready",
                            finish
                        );


                        resolve(false);
                    }

                },
                10000
            );
        }
    );
}


// =========================================================
// INITIALIZE MEDIAPIPE
// =========================================================

async function initializeFaceLandmarker() {

    if (faceTrackingReady) {

        return true;
    }


    if (faceTrackingInitializing) {

        return false;
    }


    if (
        !window.FaceLandmarker ||
        !window.FilesetResolver
    ) {

        console.error(
            "MediaPipe Face Landmarker library is not loaded."
        );

        return false;
    }


    faceTrackingInitializing =
        true;


    try {

        const vision =
            await window.FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm"
            );


        faceLandmarker =
            await window.FaceLandmarker.createFromOptions(
                vision,
                {

                    baseOptions: {

                        modelAssetPath:
                            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
                    },

                    runningMode:
                        "VIDEO",

                    numFaces:
                        1,

                    minFaceDetectionConfidence:
                        0.5,

                    minFacePresenceConfidence:
                        0.5,

                    minTrackingConfidence:
                        0.5,

                    outputFaceBlendshapes:
                        false,

                    outputFacialTransformationMatrixes:
                        true
                }
            );


        faceTrackingReady =
            true;


        console.log(
            "MediaPipe Face Landmarker ready."
        );


        return true;

    }

    catch (error) {

        console.error(
            "MEDIAPIPE INITIALIZATION ERROR:",
            error
        );


        faceTrackingReady =
            false;

        faceLandmarker =
            null;


        return false;

    }

    finally {

        faceTrackingInitializing =
            false;
    }
}


// =========================================================
// START FACE TRACKING
// =========================================================

function startFaceTracking() {

    if (!faceTrackingReady) {
        return;
    }

    if (!faceLandmarker) {
        return;
    }

    if (!arCamera) {
        return;
    }


    stopFaceTracking();


    lastVideoTime =
        -1;


    const trackingLoop =
        () => {

            if (
                !arModal ||
                !arModal.classList.contains(
                    "active"
                )
            ) {

                return;
            }


            if (
                currentARMode !==
                "camera"
            ) {

                return;
            }


            if (
                !arCameraStream ||
                !arCamera.srcObject
            ) {

                return;
            }


            if (
                arCamera.readyState >=
                HTMLMediaElement.HAVE_CURRENT_DATA
            ) {

                const videoTime =
                    arCamera.currentTime;


                if (
                    videoTime !==
                    lastVideoTime
                ) {

                    try {

                        const result =
                            faceLandmarker.detectForVideo(
                                arCamera,
                                performance.now()
                            );


                        processFaceResult(
                            result
                        );


                        lastVideoTime =
                            videoTime;

                    }

                    catch (error) {

                        console.error(
                            "FACE DETECTION ERROR:",
                            error
                        );
                    }
                }
            }


            arAnimationFrame =
                requestAnimationFrame(
                    trackingLoop
                );
        };


    arAnimationFrame =
        requestAnimationFrame(
            trackingLoop
        );
}


// =========================================================
// STOP FACE TRACKING
// =========================================================

function stopFaceTracking() {

    if (
        arAnimationFrame !== null
    ) {

        cancelAnimationFrame(
            arAnimationFrame
        );


        arAnimationFrame =
            null;
    }


    lastVideoTime =
        -1;


    lastFaceDetected =
        false;
}


// =========================================================
// GET VIDEO DISPLAY RECTANGLE
// =========================================================

function getVideoDisplayRect() {

    if (!arCamera) {
        return null;
    }


    const videoWidth =
        arCamera.videoWidth;

    const videoHeight =
        arCamera.videoHeight;

    const displayWidth =
        arCamera.clientWidth;

    const displayHeight =
        arCamera.clientHeight;


    if (
        !videoWidth ||
        !videoHeight ||
        !displayWidth ||
        !displayHeight
    ) {

        return null;
    }


    const scale =
        Math.max(
            displayWidth / videoWidth,
            displayHeight / videoHeight
        );


    const renderedWidth =
        videoWidth *
        scale;

    const renderedHeight =
        videoHeight *
        scale;


    const cropX =
        (
            renderedWidth -
            displayWidth
        ) /
        2;


    const cropY =
        (
            renderedHeight -
            displayHeight
        ) /
        2;


    return {

        videoWidth,

        videoHeight,

        displayWidth,

        displayHeight,

        scale,

        cropX,

        cropY
    };
}


// =========================================================
// CONVERT LANDMARK TO DISPLAY COORDINATES
// =========================================================

function landmarkToDisplay(
    point,
    rect
) {

    if (!point || !rect) {

        return {
            x: 0,
            y: 0
        };
    }


    const mirroredX =
        1 -
        point.x;


    const renderedX =
        mirroredX *
        rect.videoWidth *
        rect.scale;


    const renderedY =
        point.y *
        rect.videoHeight *
        rect.scale;


    return {

        x:
            renderedX -
            rect.cropX,

        y:
            renderedY -
            rect.cropY
    };
}


// =========================================================
// PROCESS CAMERA FACE RESULT
// =========================================================

function processFaceResult(
    result
) {

    if (
        !result ||
        !result.faceLandmarks ||
        result.faceLandmarks.length === 0
    ) {

        if (lastFaceDetected) {

            lastFaceDetected =
                false;


            if (arInstruction) {

                arInstruction.textContent =
                    "Face not detected. Move into the camera view.";
            }
        }


        return;
    }


    const landmarks =
        result.faceLandmarks[0];


    if (
        !landmarks ||
        landmarks.length === 0
    ) {

        return;
    }


    const rect =
        getVideoDisplayRect();


    if (!rect) {

        return;
    }


    let minX =
        Infinity;

    let maxX =
        -Infinity;

    let minY =
        Infinity;

    let maxY =
        -Infinity;


    landmarks.forEach(
        point => {

            if (
                Number.isFinite(point.x) &&
                Number.isFinite(point.y)
            ) {

                const position =
                    landmarkToDisplay(
                        point,
                        rect
                    );


                minX =
                    Math.min(
                        minX,
                        position.x
                    );


                maxX =
                    Math.max(
                        maxX,
                        position.x
                    );


                minY =
                    Math.min(
                        minY,
                        position.y
                    );


                maxY =
                    Math.max(
                        maxY,
                        position.y
                    );
            }
        }
    );


    if (
        !Number.isFinite(minX) ||
        !Number.isFinite(maxX) ||
        !Number.isFinite(minY) ||
        !Number.isFinite(maxY)
    ) {

        return;
    }


    const faceWidth =
        maxX -
        minX;

    const faceHeight =
        maxY -
        minY;


    if (
        faceWidth <= 0 ||
        faceHeight <= 0
    ) {

        return;
    }


    const faceCenterX =
        (
            minX +
            maxX
        ) /
        2;


    const faceCenterY =
        (
            minY +
            maxY
        ) /
        2;


    const rawFaceX =
        faceCenterX -
        rect.displayWidth / 2;


    const rawFaceY =
        faceCenterY -
        rect.displayHeight / 2;


    smoothedFaceX =
        smoothValue(
            smoothedFaceX,
            rawFaceX
        );


    smoothedFaceY =
        smoothValue(
            smoothedFaceY,
            rawFaceY
        );


    smoothedFaceWidth =
        smoothValue(
            smoothedFaceWidth,
            faceWidth
        );


    smoothedFaceHeight =
        smoothValue(
            smoothedFaceHeight,
            faceHeight
        );


    lastFaceDetected =
        true;


    if (
        automaticTrackingEnabled &&
        !arDragging
    ) {

        const anchor =
            getARAnchor(
                smoothedFaceX,
                smoothedFaceY,
                smoothedFaceWidth,
                smoothedFaceHeight
            );


        arPositionX =
            anchor.x;


        arPositionY =
            anchor.y;


        arScale =
            Math.max(
                0.25,
                Math.min(
                    3,
                    anchor.scale
                )
            );


        updateARProduct();
    }


    if (arInstruction) {

        arInstruction.textContent =
            "Face detected — product is tracking automatically.";
    }
}


// =========================================================
// STOP CAMERA
// =========================================================

function stopARCamera() {

    stopFaceTracking();


    if (arCameraStream) {

        arCameraStream
            .getTracks()
            .forEach(
                track => {

                    try {

                        track.stop();

                    }

                    catch (error) {

                        console.warn(
                            "Unable to stop camera track:",
                            error
                        );
                    }
                }
            );


        arCameraStream =
            null;
    }


    if (arCamera) {

        arCamera.pause();

        arCamera.srcObject =
            null;
    }
}


// =========================================================
// UPLOAD IMAGE BUTTON
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
// HANDLE IMAGE UPLOAD
// =========================================================

if (arImageInput) {

    arImageInput.addEventListener(
        "change",
        event => {

            const file =
                event.target.files?.[0];


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


                arImageInput.value =
                    "";


                return;
            }


            if (
                file.size >
                10 * 1024 * 1024
            ) {

                alert(
                    "Image must be smaller than 10MB."
                );


                arImageInput.value =
                    "";


                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                async event => {

                    stopARCamera();

                    resetFaceSmoothing();

                    arDragging =
                        false;


                    currentARMode =
                        "image";


                    automaticTrackingEnabled =
                        true;


                    if (arCamera) {

                        arCamera.style.display =
                            "none";
                    }


                    if (arUserImage) {

                        arUserImage.src =
                            event.target.result;

                        arUserImage.style.display =
                            "block";
                    }


                    setActiveARMode(
                        uploadImageBtn
                    );


                    resetARPosition();


                    if (arInstruction) {

                        arInstruction.textContent =
                            "Analyzing image for a face...";
                    }


                    try {

                        await waitForImageLoad(
                            arUserImage
                        );


                        const ready =
                            await waitForFaceLandmarker();


                        if (
                            !ready ||
                            !faceLandmarker
                        ) {

                            if (arInstruction) {

                                arInstruction.textContent =
                                    "Face tracking is unavailable. You can position the product manually.";
                            }


                            return;
                        }


                        const result =
                            faceLandmarker.detect(
                                arUserImage
                            );


                        processUploadedImageFace(
                            result
                        );

                    }

                    catch (error) {

                        console.error(
                            "UPLOADED IMAGE AR ERROR:",
                            error
                        );


                        if (arInstruction) {

                            arInstruction.textContent =
                                "Could not analyze this image. You can position the product manually.";
                        }
                    }
                };


            reader.readAsDataURL(
                file
            );
        }
    );
}


// =========================================================
// WAIT FOR IMAGE LOAD
// =========================================================

function waitForImageLoad(
    image
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            if (!image) {

                reject(
                    new Error(
                        "Image element not found."
                    )
                );


                return;
            }


            if (
                image.complete &&
                image.naturalWidth > 0
            ) {

                resolve();

                return;
            }


            image.onload =
                () => resolve();


            image.onerror =
                () =>
                    reject(
                        new Error(
                            "Image could not be loaded."
                        )
                    );
        }
    );
}


// =========================================================
// PROCESS UPLOADED IMAGE
// =========================================================

function processUploadedImageFace(
    result
) {

    if (
        !result ||
        !result.faceLandmarks ||
        result.faceLandmarks.length === 0
    ) {

        lastFaceDetected =
            false;


        if (arInstruction) {

            arInstruction.textContent =
                "No face detected. You can drag and resize the product manually.";
        }


        return;
    }


    const landmarks =
        result.faceLandmarks[0];


    if (!landmarks) {
        return;
    }


    let minX =
        Infinity;

    let maxX =
        -Infinity;

    let minY =
        Infinity;

    let maxY =
        -Infinity;


    landmarks.forEach(
        point => {

            if (
                Number.isFinite(point.x) &&
                Number.isFinite(point.y)
            ) {

                minX =
                    Math.min(
                        minX,
                        point.x
                    );


                maxX =
                    Math.max(
                        maxX,
                        point.x
                    );


                minY =
                    Math.min(
                        minY,
                        point.y
                    );


                maxY =
                    Math.max(
                        maxY,
                        point.y
                    );
            }
        }
    );


    const imageWidth =
        arUserImage.clientWidth ||
        arUserImage.naturalWidth ||
        1;


    const imageHeight =
        arUserImage.clientHeight ||
        arUserImage.naturalHeight ||
        1;


    const faceWidth =
        (
            maxX -
            minX
        ) *
        imageWidth;


    const faceHeight =
        (
            maxY -
            minY
        ) *
        imageHeight;


    const faceCenterX =
        (
            minX +
            maxX
        ) /
        2;


    const faceCenterY =
        (
            minY +
            maxY
        ) /
        2;


    const imageX =
        (
            faceCenterX -
            0.5
        ) *
        imageWidth;


    const imageY =
        (
            faceCenterY -
            0.5
        ) *
        imageHeight;


    const anchor =
        getARAnchor(
            imageX,
            imageY,
            faceWidth,
            faceHeight
        );


    arPositionX =
        anchor.x;


    arPositionY =
        anchor.y;


    arScale =
        Math.max(
            0.25,
            Math.min(
                3,
                anchor.scale
            )
        );


    lastFaceDetected =
        true;


    updateARProduct();


    if (arInstruction) {

        arInstruction.textContent =
            "Face detected — product positioned automatically.";
    }
}


// =========================================================
// SET ACTIVE AR MODE
// =========================================================

function setActiveARMode(
    button
) {

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

    resetFaceSmoothing();


    arDragging =
        false;


    automaticTrackingEnabled =
        true;


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


    if (arUserImage) {

        arUserImage.src =
            "";

        arUserImage.style.display =
            "none";
    }


    if (arCamera) {

        arCamera.style.display =
            "none";
    }


    currentARMode =
        "camera";


    lastFaceDetected =
        false;
}


if (closeArModal) {

    closeArModal.addEventListener(
        "click",
        closeAR
    );
}


// =========================================================
// CLOSE AR ON BACKGROUND CLICK
// =========================================================

if (arModal) {

    arModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                arModal
            ) {

                closeAR();
            }
        }
    );
}


// =========================================================
// RESET AR POSITION
// =========================================================

function resetARPosition() {

    arScale =
        1;

    arPositionX =
        0;

    arPositionY =
        0;


    updateARProduct();
}


// =========================================================
// UPDATE AR PRODUCT
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

if (arZoomIn) {

    arZoomIn.addEventListener(
        "click",
        () => {

            automaticTrackingEnabled =
                false;


            arScale =
                Math.min(
                    3,
                    arScale + 0.1
                );


            updateARProduct();
        }
    );
}


// =========================================================
// ZOOM OUT
// =========================================================

if (arZoomOut) {

    arZoomOut.addEventListener(
        "click",
        () => {

            automaticTrackingEnabled =
                false;


            arScale =
                Math.max(
                    0.25,
                    arScale - 0.1
                );


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

    automaticTrackingEnabled =
        false;


    arPositionX +=
        x;

    arPositionY +=
        y;


    updateARProduct();
}


// =========================================================
// MOVE UP
// =========================================================

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


// =========================================================
// MOVE DOWN
// =========================================================

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


// =========================================================
// MOVE LEFT
// =========================================================

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


// =========================================================
// MOVE RIGHT
// =========================================================

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
// DRAG PRODUCT
// =========================================================

if (arProductOverlay) {

    arProductOverlay.style.cursor =
        "grab";

    arProductOverlay.style.touchAction =
        "none";


    arProductOverlay.addEventListener(
        "pointerdown",
        event => {

            arDragging =
                true;


            automaticTrackingEnabled =
                false;


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


    const stopDragging =
        event => {

            arDragging =
                false;


            try {

                if (
                    event.pointerId !== undefined
                ) {

                    arProductOverlay.releasePointerCapture(
                        event.pointerId
                    );
                }

            }

            catch (error) {

                // Ignore pointer capture errors.
            }


            arProductOverlay.style.cursor =
                "grab";
        };


    arProductOverlay.addEventListener(
        "pointerup",
        stopDragging
    );


    arProductOverlay.addEventListener(
        "pointercancel",
        stopDragging
    );
}


// =========================================================
// TRY AR
// =========================================================

if (tryOnBtn) {

    tryOnBtn.addEventListener(
        "click",
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


            await openAR();
        }
    );
}


// =========================================================
// LOGIN CHECK
// =========================================================

async function checkUserLogin() {

    try {

        const response =
            await fetch(
                "/api/users/me",
                {
                    method: "GET",

                    credentials:
                        "include",

                    cache:
                        "no-store"
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

            userLoggedIn =
                true;

            currentUser =
                data.user;

        }

        else {

            userLoggedIn =
                false;

            currentUser =
                null;
        }

    }

    catch (error) {

        console.error(
            "LOGIN CHECK ERROR:",
            error
        );


        userLoggedIn =
            false;

        currentUser =
            null;
    }


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

    if (!reviewLoginMessage) {
        return;
    }


    if (userLoggedIn) {

        reviewLoginMessage.style.display =
            "none";


        if (reviewForm) {

            reviewForm.style.display =
                "block";
        }

    }

    else {

        reviewLoginMessage.style.display =
            "flex";


        if (reviewForm) {

            reviewForm.style.display =
                "none";
        }
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


        if (reviewsSection) {

            reviewsSection.style.display =
                "none";
        }


        const response =
            await fetch(
                `/api/products/${encodeURIComponent(
                    productId
                )}`,
                {
                    method:
                        "GET",

                    credentials:
                        "include",

                    cache:
                        "no-store"
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
                "Invalid product response:",
                data
            );

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

function displayProduct(
    product
) {

    if (!product) {

        showError();

        return;
    }


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


    // =====================================================
    // PRODUCT INFORMATION
    // =====================================================

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


    // =====================================================
    // STOCK
    // =====================================================

    const stock =
        Number(
            product.stock || 0
        );


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


    // =====================================================
    // QUANTITY
    // =====================================================

    if (quantityInput) {

        quantityInput.min =
            "1";

        quantityInput.max =
            stock > 0
                ? String(stock)
                : "1";

        quantityInput.value =
            "1";
    }


    // =====================================================
    // CART BUTTONS
    // =====================================================

    if (addToCartBtn) {

        addToCartBtn.disabled =
            stock <= 0;
    }


    if (buyNowBtn) {

        buyNowBtn.disabled =
            stock <= 0;
    }


    // =====================================================
    // PRODUCT IMAGE
    // =====================================================

    setProductImage(
        product
    );
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
// QUANTITY DECREASE
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
// QUANTITY INCREASE
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
                    currentProduct?.stock ||
                    0
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
                    currentProduct?.stock ||
                    0
                );


            quantity =
                Math.max(
                    1,
                    quantity
                );


            if (
                stock > 0
            ) {

                quantity =
                    Math.min(
                        quantity,
                        stock
                    );
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

        window.location.href =
            "/login";

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


    if (
        !arModal ||
        !arModal.classList.contains(
            "active"
        )
    ) {

        document.body.style.overflow =
            "";
    }
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
                    quantityInput?.value
                ) || 1;


            const stock =
                Number(
                    currentProduct.stock ||
                    0
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
                            method:
                                "POST",

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
                    response.status ===
                    401
                ) {

                    userLoggedIn =
                        false;

                    currentUser =
                        null;

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
                    "ADD TO CART ERROR:",
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
                    quantityInput?.value
                ) || 1;


            const stock =
                Number(
                    currentProduct.stock ||
                    0
                );


            if (
                stock <= 0 ||
                quantity > stock
            ) {

                alert(
                    "Requested quantity is not available."
                );


                return;
            }


            try {

                const response =
                    await fetch(
                        "/api/cart/add",
                        {
                            method:
                                "POST",

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
                    response.status ===
                    401
                ) {

                    userLoggedIn =
                        false;

                    currentUser =
                        null;

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


                const labels = {

                    1:
                        "Poor",

                    2:
                        "Fair",

                    3:
                        "Good",

                    4:
                        "Very Good",

                    5:
                        "Excellent"
                };


                if (ratingText) {

                    ratingText.textContent =
                        labels[
                            selectedRating
                        ] ||
                        "Select a rating";
                }
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
// REVIEW IMAGE
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


            reader.readAsDataURL(
                file
            );
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


            const productId =
                Number(
                    currentProduct.id
                );


            if (
                !Number.isInteger(
                    productId
                ) ||
                productId <= 0
            ) {

                alert(
                    "Invalid product ID."
                );


                return;
            }


            const rating =
                Number(
                    reviewRating?.value
                );


            if (
                !Number.isInteger(
                    rating
                ) ||
                rating < 1 ||
                rating > 5
            ) {

                alert(
                    "Please select a rating."
                );


                return;
            }


            const text =
                reviewText?.value.trim() ||
                "";


            if (!text) {

                alert(
                    "Please write your review."
                );


                return;
            }


            if (
                text.length >
                1000
            ) {

                alert(
                    "Review must be 1000 characters or less."
                );


                return;
            }


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


            const REVIEW_SUBMIT_URL =
                `/api/reviews/product/${encodeURIComponent(
                    productId
                )}`;


            if (
                reviewImage?.files?.length
            ) {

                formData.append(
                    "image",
                    reviewImage.files[0]
                );
            }


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

                const response =
                    await fetch(
                        REVIEW_SUBMIT_URL,
                        {
                            method:
                                "POST",

                            credentials:
                                "include",

                            body:
                                formData
                        }
                    );


                let data =
                    null;


                try {

                    data =
                        await response.json();

                }

                catch (error) {

                    console.error(
                        "REVIEW JSON ERROR:",
                        error
                    );
                }


                if (
                    response.status ===
                    401
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


                if (
                    response.status ===
                    404
                ) {

                    alert(
                        data?.message ||
                        "Review API route was not found."
                    );


                    return;
                }


                if (
                    !response.ok ||
                    !data ||
                    data.success !== true
                ) {

                    alert(
                        data?.message ||
                        "Failed to submit review."
                    );


                    return;
                }


                alert(
                    "Review submitted successfully! ⭐"
                );


                resetReviewForm();


                await loadReviews(
                    productId
                );


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

async function loadReviews(
    productId
) {

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

        const response =
            await fetch(
                `/api/reviews/product/${encodeURIComponent(
                    productId
                )}`,
                {
                    method:
                        "GET",

                    credentials:
                        "include",

                    cache:
                        "no-store"
                }
            );


        let data =
            null;


        try {

            data =
                await response.json();

        }

        catch (error) {

            console.error(
                "REVIEW RESPONSE ERROR:",
                error
            );
        }


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
            Array.isArray(
                data.reviews
            )
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
        Number(
            apiAverage
        );


    let count =
        Number(
            apiCount
        );


    if (
        !Number.isFinite(
            average
        )
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
                            review.rating ||
                            0
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
        !Number.isFinite(
            count
        )
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
        Math.min(
            5,
            Math.max(
                0,
                Math.round(
                    Number(
                        review.rating ||
                        0
                    )
                )
            )
        );


    const starsHTML =
        "★".repeat(
            rating
        ) +
        "☆".repeat(
            5 -
            rating
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
                        year:
                            "numeric",

                        month:
                            "short",

                        day:
                            "numeric"
                    }
                );
        }
    }


    const username =
        escapeHTML(
            review.username ||
            review.name ||
            "Customer"
        );


    const reviewContent =
        escapeHTML(
            review.review_text ||
            review.comment ||
            ""
        );


    let imageHTML =
        "";


    let reviewImageURL =
        review.image_url ||
        review.image ||
        review.review_image ||
        null;


    /*
     * Fix review image paths too.
     */
    if (reviewImageURL) {

        reviewImageURL =
            String(
                reviewImageURL
            ).replace(
                /\\/g,
                "/"
            );


        if (
            !reviewImageURL.startsWith(
                "http://"
            ) &&
            !reviewImageURL.startsWith(
                "https://"
            ) &&
            !reviewImageURL.startsWith(
                "data:image/"
            ) &&
            !reviewImageURL.startsWith("/")
        ) {

            reviewImageURL =
                `/${reviewImageURL}`;
        }


        imageHTML = `

            <div class="review-image">

                <img
                    src="${escapeAttribute(
                        reviewImageURL
                    )}"
                    alt="Customer review image"
                    loading="lazy"
                    onerror="this.parentElement.style.display='none';"
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
                    method:
                        "GET",

                    credentials:
                        "include",

                    cache:
                        "no-store"
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

function updateProductInformation(
    product
) {

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
        Number(
            product.stock || 0
        );


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
                ? String(stock)
                : "1";


        if (
            Number(quantityInput.value) >
            stock &&
            stock > 0
        ) {

            quantityInput.value =
                stock;
        }
    }


    if (addToCartBtn) {

        addToCartBtn.disabled =
            stock <= 0;
    }


    if (buyNowBtn) {

        buyNowBtn.disabled =
            stock <= 0;
    }


    // =====================================================
    // IMPORTANT:
    // UPDATE IMAGE AFTER PRODUCT REFRESH
    // =====================================================

    setProductImage(
        product
    );
}


// =========================================================
// ESCAPE KEY
// =========================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Escape"
        ) {

            return;
        }


        if (
            arModal &&
            arModal.classList.contains(
                "active"
            )
        ) {

            closeAR();

            return;
        }


        hideLoginModal();
    }
);


// =========================================================
// CLOSE LOGIN MODAL OUTSIDE
// =========================================================

if (loginModal) {

    loginModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                loginModal
            ) {

                hideLoginModal();
            }
        }
    );
}


// =========================================================
// MEDIAPIPE READY EVENT
// =========================================================

window.addEventListener(
    "mediapipe-ready",
    async () => {

        console.log(
            "MediaPipe library is ready."
        );


        await initializeFaceLandmarker();
    }
);


// =========================================================
// MEDIAPIPE ALREADY LOADED
// =========================================================

if (
    window.FaceLandmarker &&
    window.FilesetResolver
) {

    initializeFaceLandmarker();
}


// =========================================================
// INITIALIZE APPLICATION
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


    if (!productId) {

        showError();

        return;
    }


    await checkUserLogin();


    await loadProduct();
}


// =========================================================
// START APPLICATION
// =========================================================

initialize();