
// =========================================================
// AR E-COMMERCE
// PRODUCT DETAILS PAGE
// PRODUCT + CART + REVIEWS + AUTOMATIC AR FACE TRACKING
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
// =========================================================
// AR TRY-ON
// =========================================================
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
// FACE TRACKING STATE
// =========================================================

let faceLandmarker = null;

let faceTrackingReady = false;

let arAnimationFrame = null;

let lastFaceDetected = false;

let mediaPipeInitializationStarted = false;

let lastVideoTime = -1;


// =========================================================
// FACE TRACKING SMOOTHING
// =========================================================

let smoothedFaceX = null;

let smoothedFaceY = null;

let smoothedFaceWidth = null;

const FACE_SMOOTHING =
    0.25;


// =========================================================
// AR MODE
// =========================================================

let currentARMode =
    "camera";


// =========================================================
// GET AR PRODUCT IMAGE
// =========================================================

function getARProductImage() {

    if (
        currentProduct &&
        currentProduct.image
    ) {

        return currentProduct.image;

    }


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
// GET PRODUCT CATEGORY
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
                    faceHeight * 0.12,
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


    arModal.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";


    currentARMode =
        "camera";


    resetARPosition();

    resetFaceSmoothing();


    // =====================================================
    // PRODUCT IMAGE
    // =====================================================

    const productARImage =
        getARProductImage();


    if (
        productARImage &&
        arProductImage
    ) {

        arProductImage.src =
            productARImage;

        arProductOverlay.style.display =
            "block";

    }

    else {

        if (arProductOverlay) {

            arProductOverlay.style.display =
                "none";

        }

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
// START AR CAMERA
// =========================================================

async function startARCamera() {

    stopARCamera();

    stopFaceTracking();

    resetFaceSmoothing();

    currentARMode =
        "camera";


    try {

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            throw new Error(
                "Camera API is not supported by this browser."
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
                "AR camera element was not found."
            );

        }


        arCamera.srcObject =
            arCameraStream;


        arCamera.style.display =
            "block";


        arUserImage.style.display =
            "none";


        arCamera.onloadedmetadata =
            async () => {

                try {

                    await arCamera.play();

                }

                catch (playError) {

                    console.warn(
                        "Camera autoplay warning:",
                        playError
                    );

                }


                arInstruction.textContent =
                    "Detecting your face...";


                await waitForFaceLandmarker();

                startFaceTracking();

            };


        setActiveARMode(
            startCameraBtn
        );

    }

    catch (error) {

        console.error(
            "AR CAMERA ERROR:",
            error
        );


        if (arCamera) {

            arCamera.style.display =
                "none";

        }


        arInstruction.textContent =
            "Camera access was blocked. You can upload an image instead.";

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

        await initializeFaceLandmarker();

        return faceTrackingReady;

    }


    return new Promise(
        resolve => {

            let finished =
                false;


            const finish =
                async () => {

                    if (finished) {

                        return;

                    }


                    finished = true;


                    window.removeEventListener(
                        "mediapipe-ready",
                        finish
                    );


                    await initializeFaceLandmarker();


                    resolve(
                        faceTrackingReady
                    );

                };


            window.addEventListener(
                "mediapipe-ready",
                finish,
                {
                    once: true
                }
            );


            // Safety timeout

            setTimeout(
                async () => {

                    if (finished) {

                        return;

                    }


                    if (
                        window.FaceLandmarker &&
                        window.FilesetResolver
                    ) {

                        await finish();

                    }

                    else {

                        finished = true;


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
// INITIALIZE MEDIAPIPE FACE LANDMARKER
// =========================================================

async function initializeFaceLandmarker() {

    if (faceTrackingReady) {

        return true;

    }


    if (mediaPipeInitializationStarted) {

        return faceTrackingReady;

    }


    mediaPipeInitializationStarted =
        true;


    try {

        if (
            !window.FaceLandmarker ||
            !window.FilesetResolver
        ) {

            console.error(
                "MediaPipe has not loaded yet."
            );

            mediaPipeInitializationStarted =
                false;

            return false;

        }


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


        mediaPipeInitializationStarted =
            false;


        console.log(
            "MediaPipe Face Landmarker initialized successfully."
        );


        return true;

    }

    catch (error) {

        mediaPipeInitializationStarted =
            false;

        faceTrackingReady =
            false;

        faceLandmarker =
            null;


        console.error(
            "Failed to initialize Face Landmarker:",
            error
        );


        return false;

    }

}


// =========================================================
// START FACE TRACKING
// =========================================================

function startFaceTracking() {

    if (!faceTrackingReady) {

        console.warn(
            "Face tracking is not ready."
        );

        return;

    }


    if (!arCamera) {

        return;

    }


    if (
        arCamera.readyState <
        HTMLMediaElement.HAVE_CURRENT_DATA
    ) {

        setTimeout(
            startFaceTracking,
            100
        );

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

                try {

                    const currentVideoTime =
                        arCamera.currentTime;


                    if (
                        currentVideoTime !==
                        lastVideoTime
                    ) {

                        const result =
                            faceLandmarker.detectForVideo(
                                arCamera,
                                performance.now()
                            );


                        lastVideoTime =
                            currentVideoTime;


                        processFaceResult(
                            result
                        );

                    }

                }

                catch (error) {

                    console.error(
                        "FACE TRACKING ERROR:",
                        error
                    );

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
// PROCESS FACE RESULT
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


    lastFaceDetected =
        true;


    // =====================================================
    // FIND FACE BOUNDING BOX
    // =====================================================

    let minX = 1;

    let maxX = 0;

    let minY = 1;

    let maxY = 0;


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


    const faceWidthNormalized =
        maxX -
        minX;


    const faceHeightNormalized =
        maxY -
        minY;


    if (
        faceWidthNormalized <= 0 ||
        faceHeightNormalized <= 0
    ) {

        return;

    }


    // =====================================================
    // CAMERA VIEW DIMENSIONS
    // =====================================================

    const viewerWidth =
        arCamera.clientWidth ||
        arCamera.videoWidth ||
        1;


    const viewerHeight =
        arCamera.clientHeight ||
        arCamera.videoHeight ||
        1;


    // =====================================================
    // MIRROR THE X COORDINATE
    // =====================================================

    const faceCenterXNormalized =
        (
            minX +
            maxX
        ) /
        2;


    const faceCenterYNormalized =
        (
            minY +
            maxY
        ) /
        2;


    const mirroredX =
        1 -
        faceCenterXNormalized;


    const rawFaceX =
        (
            mirroredX -
            0.5
        ) *
        viewerWidth;


    const rawFaceY =
        (
            faceCenterYNormalized -
            0.5
        ) *
        viewerHeight;


    const rawFaceWidth =
        faceWidthNormalized *
        viewerWidth;


    const rawFaceHeight =
        faceHeightNormalized *
        viewerHeight;


    // =====================================================
    // SMOOTH TRACKING
    // =====================================================

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
            rawFaceWidth
        );


    // =====================================================
    // GET PRODUCT ANCHOR
    // =====================================================

    const anchor =
        getARAnchor(
            smoothedFaceX,
            smoothedFaceY,
            smoothedFaceWidth,
            rawFaceHeight
        );


    // =====================================================
    // AUTOMATIC POSITION
    // =====================================================

    if (!arDragging) {

        arPositionX =
            anchor.x;


        arPositionY =
            anchor.y;


        // =================================================
        // AUTOMATIC SCALE
        // =================================================

        const automaticScale =
            Math.max(
                0.3,
                Math.min(
                    3,
                    anchor.scale
                )
            );


        arScale =
            automaticScale;


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


    if (!arCameraStream) {

        if (arCamera) {

            arCamera.srcObject =
                null;

        }

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


    if (arCamera) {

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

                arImageInput.value =
                    "";

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                async function(event) {

                    stopARCamera();

                    stopFaceTracking();

                    resetFaceSmoothing();


                    currentARMode =
                        "image";


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


                    // =================================================
                    // WAIT FOR IMAGE TO LOAD
                    // =================================================

                    try {

                        await waitForImageLoad(
                            arUserImage
                        );

                    }

                    catch (error) {

                        console.error(
                            "IMAGE LOAD ERROR:",
                            error
                        );

                        if (arInstruction) {

                            arInstruction.textContent =
                                "Unable to load the selected image.";

                        }

                        return;

                    }


                    // =================================================
                    // INITIALIZE MEDIAPIPE
                    // =================================================

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


                    // =================================================
                    // DETECT FACE FROM IMAGE
                    // =================================================

                    try {

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
                            "UPLOADED IMAGE FACE ERROR:",
                            error
                        );


                        if (arInstruction) {

                            arInstruction.textContent =
                                "Could not detect a face. You can position the product manually.";

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
// PROCESS UPLOADED IMAGE FACE
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


    let minX = 1;

    let maxX = 0;

    let minY = 1;

    let maxY = 0;


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


    const viewerWidth =
        arUserImage.clientWidth ||
        arUserImage.naturalWidth ||
        1;


    const viewerHeight =
        arUserImage.clientHeight ||
        arUserImage.naturalHeight ||
        1;


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


    const faceWidth =
        (
            maxX -
            minX
        ) *
        viewerWidth;


    const faceHeight =
        (
            maxY -
            minY
        ) *
        viewerHeight;


    // =====================================================
    // IMAGE X POSITION
    // =====================================================

    const imageX =
        (
            faceCenterX -
            0.5
        ) *
        viewerWidth;


    const imageY =
        (
            faceCenterY -
            0.5
        ) *
        viewerHeight;


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
            0.3,
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
// CLOSE AR WHEN CLICKING BACKGROUND
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

            arScale +=
                0.1;


            if (
                arScale >
                3
            ) {

                arScale =
                    3;

            }


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

            arScale -=
                0.1;


            if (
                arScale <
                0.3
            ) {

                arScale =
                    0.3;

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
// DRAG PRODUCT WITH MOUSE / TOUCH
// =========================================================

if (arProductOverlay) {

    arProductOverlay.addEventListener(
        "pointerdown",
        event => {

            arDragging =
                true;


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

            arDragging =
                false;


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

            arDragging =
                false;


            arProductOverlay.style.cursor =
                "grab";

        }
    );

}


// =========================================================
// TRY AR BUTTON
// =========================================================
// IMPORTANT:
// There is ONLY ONE handler now.
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
// =========================================================
// LOGIN
// =========================================================
// =========================================================


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
// =========================================================
// PRODUCT
// =========================================================
// =========================================================


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

function displayProduct(
    product
) {

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
        Number(
            product.stock || 0
        );


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


            if (
                quantity < 1
            ) {

                quantity =
                    1;

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


// =========================================================
// =========================================================
// LOGIN MODAL
// =========================================================
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
// =========================================================
// CART
// =========================================================
// =========================================================


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


            const stock =
                Number(
                    currentProduct.stock || 0
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
// =========================================================
// REVIEWS
// =========================================================
// =========================================================


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
                    reviewRating.value
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
                reviewText.value.trim();


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

                const reviewUrl =
                    `/api/reviews/product/${encodeURIComponent(
                        productId
                    )}`;


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


                let data =
                    null;


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


                if (
                    response.status === 404
                ) {

                    const message =
                        data?.message ||
                        "Review endpoint was not found. Check the server route.";


                    alert(
                        `Failed to submit review.\n\nServer returned 404.\n${message}`
                    );


                    return;

                }


                if (
                    !response.ok ||
                    !data ||
                    data.success !== true
                ) {

                    const message =
                        data?.message ||
                        `Server returned ${response.status}.`;


                    alert(
                        `Failed to submit review.\n\n${message}`
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

        const reviewUrl =
            `/api/reviews/product/${encodeURIComponent(
                productId
            )}`;


        const response =
            await fetch(
                reviewUrl,
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store"
                }
            );


        let data =
            null;


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

        if (
            reviews.length > 0
        ) {

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
        !Number.isFinite(
            count
        )
    ) {

        count =
            reviews.length;

    }


    if (reviewAverage) {

        reviewAverage.textContent =
            average.toFixed(
                1
            );

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
                        review.rating || 0
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

function updateProductInformation(
    product
) {

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
        Number(
            product.stock || 0
        );


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

            if (
                arModal &&
                arModal.classList.contains(
                    "active"
                )
            ) {

                closeAR();

            }


            hideLoginModal();

        }

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


        // Initialize in the background.
        // AR does not have to wait for page load.

        await initializeFaceLandmarker();

    }
);


// =========================================================
// IF MEDIAPIPE IS ALREADY AVAILABLE
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


    console.log(
        "PRODUCT ID:",
        productId
    );


    if (!productId) {

        showError();

        return;

    }


    // =====================================================
    // CHECK LOGIN
    // =====================================================

    await checkUserLogin();


    // =====================================================
    // LOAD PRODUCT + REVIEWS
    // =====================================================

    await loadProduct();

}


// =========================================================
// START APPLICATION
// =========================================================

initialize();
