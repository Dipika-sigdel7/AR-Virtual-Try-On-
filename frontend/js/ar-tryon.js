import {
    FaceLandmarker,
    FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/+esm";


// =====================================================
// ELEMENTS
// =====================================================

const video = document.getElementById("camera");

const canvas = document.getElementById("arCanvas");

const ctx = canvas.getContext("2d");

const loading = document.getElementById("loading");

const noFace = document.getElementById("noFace");

const productPreview =
    document.getElementById("productPreview");

const productName =
    document.getElementById("productName");

const switchCamera =
    document.getElementById("switchCamera");

const backBtn =
    document.getElementById("backBtn");


// =====================================================
// VARIABLES
// =====================================================

let faceLandmarker = null;

let cameraStream = null;

let facingMode = "user";

let glassesImage = new Image();

let animationFrame = null;


// =====================================================
// GET PRODUCT FROM URL
// =====================================================

const params = new URLSearchParams(
    window.location.search
);

const productImage =
    params.get("image");

const product = params.get("name");


// =====================================================
// PRODUCT INFORMATION
// =====================================================

if (product) {

    productName.textContent =
        decodeURIComponent(product);

}

if (productImage) {

    const imageUrl =
        decodeURIComponent(productImage);

    glassesImage.src = imageUrl;

    productPreview.src = imageUrl;

}


// =====================================================
// INITIALIZE MEDIAPIPE
// =====================================================

async function initializeFaceLandmarker() {

    try {

        const vision =
            await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm"
            );


        faceLandmarker =
            await FaceLandmarker.createFromOptions(
                vision,
                {

                    baseOptions: {

                        modelAssetPath:
                            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",

                        delegate: "GPU"

                    },

                    runningMode: "VIDEO",

                    numFaces: 1,

                    minFaceDetectionConfidence: 0.5,

                    minFacePresenceConfidence: 0.5,

                    minTrackingConfidence: 0.5,

                    outputFaceBlendshapes: false,

                    outputFacialTransformationMatrixes: false

                }
            );


        console.log(
            "Face Landmarker initialized"
        );

    }

    catch (error) {

        console.error(
            "Face Landmarker error:",
            error
        );

        alert(
            "Unable to initialize face tracking."
        );

    }

}


// =====================================================
// START CAMERA
// =====================================================

async function startCamera() {

    try {

        if (cameraStream) {

            cameraStream
                .getTracks()
                .forEach(track => track.stop());

        }


        cameraStream =
            await navigator.mediaDevices.getUserMedia({

                video: {

                    facingMode: facingMode,

                    width: {
                        ideal: 1280
                    },

                    height: {
                        ideal: 720
                    }

                },

                audio: false

            });


        video.srcObject =
            cameraStream;


        await video.play();


        resizeCanvas();


        loading.style.display =
            "none";


        startFaceTracking();

    }

    catch (error) {

        console.error(
            "Camera error:",
            error
        );

        loading.innerHTML = `
            <p>❌ Camera access denied</p>
            <small>
                Please allow camera permission
                in your browser.
            </small>
        `;

    }

}


// =====================================================
// RESIZE CANVAS
// =====================================================

function resizeCanvas() {

    canvas.width =
        video.videoWidth;

    canvas.height =
        video.videoHeight;

}


video.addEventListener(
    "loadedmetadata",
    resizeCanvas
);

window.addEventListener(
    "resize",
    resizeCanvas
);


// =====================================================
// FACE TRACKING
// =====================================================

function startFaceTracking() {

    if (!faceLandmarker) {

        return;

    }


    async function detect() {

        if (
            video.readyState >= 2 &&
            video.videoWidth > 0
        ) {

            const now =
                performance.now();


            const results =
                faceLandmarker.detectForVideo(
                    video,
                    now
                );


            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );


            if (
                results.faceLandmarks &&
                results.faceLandmarks.length > 0
            ) {

                noFace.style.display =
                    "none";


                const landmarks =
                    results.faceLandmarks[0];


                drawGlasses(
                    landmarks
                );

            }

            else {

                noFace.style.display =
                    "block";

            }

        }


        animationFrame =
            requestAnimationFrame(detect);

    }


    detect();

}


// =====================================================
// DRAW GLASSES
// =====================================================

function drawGlasses(landmarks) {

    if (
        !glassesImage.complete ||
        glassesImage.naturalWidth === 0
    ) {

        return;

    }


    /*
        MediaPipe face landmark indexes

        33  = left eye outer area
        133 = left eye inner area

        362 = right eye inner area
        263 = right eye outer area

        168 = nose bridge area
    */


    const leftEye =
        getPoint(
            landmarks[33]
        );


    const rightEye =
        getPoint(
            landmarks[263]
        );


    const nose =
        getPoint(
            landmarks[168]
        );


    // -------------------------------------------------
    // CENTER BETWEEN EYES
    // -------------------------------------------------

    const centerX =
        (leftEye.x + rightEye.x) / 2;

    const centerY =
        (leftEye.y + rightEye.y) / 2;


    // -------------------------------------------------
    // DISTANCE BETWEEN EYES
    // -------------------------------------------------

    const eyeDistance =
        Math.sqrt(

            Math.pow(
                rightEye.x - leftEye.x,
                2
            )

            +

            Math.pow(
                rightEye.y - leftEye.y,
                2
            )

        );


    // -------------------------------------------------
    // GLASSES SIZE
    // -------------------------------------------------

    /*
        The glasses width is based
        on distance between the eyes.

        This means:

        face closer → glasses larger

        face farther → glasses smaller
    */

    const glassesWidth =
        eyeDistance * 2.6;


    const aspectRatio =
        glassesImage.naturalHeight /
        glassesImage.naturalWidth;


    const glassesHeight =
        glassesWidth * aspectRatio;


    // -------------------------------------------------
    // ROTATION
    // -------------------------------------------------

    const angle =
        Math.atan2(

            rightEye.y - leftEye.y,

            rightEye.x - leftEye.x

        );


    // -------------------------------------------------
    // POSITION
    // -------------------------------------------------

    /*
        Move glasses slightly upward
        because the eye landmarks are
        around the center of the glasses.
    */

    const x =
        centerX - glassesWidth / 2;


    const y =
        centerY - glassesHeight * 0.45;


    // -------------------------------------------------
    // DRAW
    // -------------------------------------------------

    ctx.save();


    ctx.translate(
        centerX,
        centerY
    );


    ctx.rotate(angle);


    ctx.drawImage(

        glassesImage,

        -glassesWidth / 2,

        -glassesHeight * 0.45,

        glassesWidth,

        glassesHeight

    );


    ctx.restore();

}


// =====================================================
// CONVERT LANDMARK
// =====================================================

function getPoint(landmark) {

    return {

        x:
            landmark.x *
            canvas.width,

        y:
            landmark.y *
            canvas.height

    };

}


// =====================================================
// SWITCH CAMERA
// =====================================================

switchCamera.addEventListener(
    "click",
    async () => {

        facingMode =
            facingMode === "user"
                ? "environment"
                : "user";


        await startCamera();

    }
);


// =====================================================
// BACK BUTTON
// =====================================================

backBtn.addEventListener(
    "click",
    () => {

        if (cameraStream) {

            cameraStream
                .getTracks()
                .forEach(track =>
                    track.stop()
                );

        }


        window.history.back();

    }
);


// =====================================================
// INITIALIZE
// =====================================================

async function initialize() {

    loading.style.display =
        "block";


    await initializeFaceLandmarker();

    await startCamera();

}


initialize();