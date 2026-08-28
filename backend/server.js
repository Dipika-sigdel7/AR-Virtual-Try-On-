// =========================================================
// AR E-COMMERCE
// EXPRESS SERVER
// SESSION + USER + PRODUCT + CART
// =========================================================

require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();

const PORT =
    process.env.PORT || 3000;


/* =========================================================
   FRONTEND PATHS
========================================================= */

const frontendPath =
    path.join(
        __dirname,
        "../frontend"
    );

const pagesPath =
    path.join(
        frontendPath,
        "pages"
    );


/* =========================================================
   BASIC MIDDLEWARE
========================================================= */

/*
 * Parse JSON requests.
 *
 * Example:
 * POST /api/cart/add
 * Content-Type: application/json
 */

app.use(
    express.json()
);


/*
 * Parse normal form data.
 */

app.use(
    express.urlencoded({
        extended: true
    })
);


/* =========================================================
   SESSION
========================================================= */

/*
 * IMPORTANT:
 *
 * Session MUST be created before
 * userRoutes and cartRoutes.
 *
 * This allows:
 *
 * req.session.user
 *
 * to be available inside:
 *
 * /api/users
 * /api/cart
 */

app.use(
    session({

        secret:
            process.env.SESSION_SECRET ||
            "ar-ecommerce-secret-key",

        resave: false,

        saveUninitialized: false,

        cookie: {

            /*
             * Prevent JavaScript from
             * reading the session cookie.
             */

            httpOnly: true,


            /*
             * You are running locally
             * with HTTP.
             *
             * Therefore secure must
             * remain false.
             */

            secure: false,


            /*
             * Keep login session for
             * 24 hours.
             */

            maxAge:
                24 * 60 * 60 * 1000

        }

    })
);


/* =========================================================
   STATIC FRONTEND FILES
========================================================= */

app.use(
    express.static(
        frontendPath
    )
);


/* =========================================================
   UPLOADED PRODUCT IMAGES
========================================================= */

app.use(
    "/uploads",
    express.static(
        path.join(
            __dirname,
            "uploads"
        )
    )
);


/* =========================================================
   IMPORT API ROUTES
========================================================= */

const userRoutes =
    require("./routes/userRoutes");


const productRoutes =
    require("./routes/productRoutes");


const adminProductRoutes =
    require("./routes/adminProductRoutes");


const cartRoutes =
    require("./routes/cartRoutes");


/* =========================================================
   USER API
========================================================= */

/*
 * Login:
 *
 * POST /api/users/login
 *
 * Register:
 *
 * POST /api/users/register
 *
 * Check login:
 *
 * GET /api/users/me
 *
 * Logout:
 *
 * POST /api/users/logout
 */

app.use(
    "/api/users",
    userRoutes
);


/* =========================================================
   PRODUCT API
========================================================= */

/*
 * GET:
 *
 * /api/products
 */

app.use(
    "/api/products",
    productRoutes
);


/* =========================================================
   ADMIN PRODUCT API
========================================================= */

/*
 * Admin product routes:
 *
 * /api/admin/products
 */

app.use(
    "/api/admin/products",
    adminProductRoutes
);


/* =========================================================
   CART API
========================================================= */

/*
 * IMPORTANT:
 *
 * These routes use req.session.user.
 *
 * GET:
 * /api/cart
 *
 * POST:
 * /api/cart/add
 *
 * DELETE:
 * /api/cart/:cartItemId
 *
 * DELETE:
 * /api/cart
 *
 * Because session middleware is above,
 * req.session.user will be available.
 */

app.use(
    "/api/cart",
    cartRoutes
);


/* =========================================================
   PAGE ROUTES
========================================================= */


/* -------------------------
   HOME
------------------------- */

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                pagesPath,
                "index.html"
            )
        );

    }
);


/* -------------------------
   LOGIN
------------------------- */

app.get(
    "/login",
    (req, res) => {

        res.sendFile(
            path.join(
                pagesPath,
                "login.html"
            )
        );

    }
);


/* -------------------------
   REGISTER
------------------------- */

app.get(
    "/register",
    (req, res) => {

        res.sendFile(
            path.join(
                pagesPath,
                "register.html"
            )
        );

    }
);


/* -------------------------
   PRODUCTS
------------------------- */

app.get(
    "/products",
    (req, res) => {

        res.sendFile(
            path.join(
                pagesPath,
                "products.html"
            )
        );

    }
);


/* -------------------------
   SERVICES
------------------------- */

app.get(
    "/services",
    (req, res) => {

        res.sendFile(
            path.join(
                pagesPath,
                "services.html"
            )
        );

    }
);


/* -------------------------
   ABOUT
------------------------- */

app.get(
    "/about",
    (req, res) => {

        res.sendFile(
            path.join(
                pagesPath,
                "about.html"
            )
        );

    }
);


/* -------------------------
   PROFILE
------------------------- */

app.get(
    "/profile",
    (req, res) => {

        res.sendFile(
            path.join(
                pagesPath,
                "profile.html"
            )
        );

    }
);


/* -------------------------
   ADMIN
------------------------- */

app.get(
    "/admin",
    (req, res) => {

        res.sendFile(
            path.join(
                pagesPath,
                "admin.html"
            )
        );

    }
);


/* =========================================================
   404
========================================================= */

app.use(
    (req, res) => {

        res.status(404).send(
            "Page not found"
        );

    }
);


/* =========================================================
   START SERVER
========================================================= */

app.listen(
    PORT,
    () => {

        console.log(
            "========================================"
        );

        console.log(
            "AR E-Commerce Server Started"
        );

        console.log(
            `http://localhost:${PORT}`
        );

        console.log(
            "========================================"
        );

    }
);