// =========================================================
// AR E-COMMERCE
// EXPRESS SERVER
// SESSION + USER + PRODUCT + CART + REVIEWS
// =========================================================

require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();

const PORT = process.env.PORT || 3000;


// =========================================================
// FRONTEND PATHS
// =========================================================

const frontendPath = path.join(
    __dirname,
    "../frontend"
);

const pagesPath = path.join(
    frontendPath,
    "pages"
);


// =========================================================
// MIDDLEWARE
// =========================================================

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


// =========================================================
// SESSION
// =========================================================

app.use(
    session({

        secret:
            process.env.SESSION_SECRET ||
            "ar-ecommerce-secret-key",

        resave: false,

        saveUninitialized: false,

        cookie: {

            httpOnly: true,

            secure: false,

            sameSite: "lax",

            maxAge:
                24 * 60 * 60 * 1000

        }

    })
);


// =========================================================
// STATIC FRONTEND
// =========================================================

app.use(
    express.static(frontendPath)
);


// =========================================================
// PRODUCT UPLOADS
// =========================================================

app.use(
    "/uploads",
    express.static(
        path.join(
            __dirname,
            "uploads"
        )
    )
);


// =========================================================
// IMPORT ROUTES
// =========================================================

const userRoutes =
    require("./routes/userRoutes");

const productRoutes =
    require("./routes/productRoutes");

const adminProductRoutes =
    require("./routes/adminProductRoutes");

const cartRoutes =
    require("./routes/cartRoutes");

const reviewRoutes =
    require("./routes/reviewRoutes");


// =========================================================
// USER API
// =========================================================

app.use(
    "/api/users",
    userRoutes
);


// =========================================================
// PRODUCT API
// =========================================================

app.use(
    "/api/products",
    productRoutes
);


// =========================================================
// ADMIN PRODUCT API
// =========================================================

app.use(
    "/api/admin/products",
    adminProductRoutes
);


// =========================================================
// CART API
// =========================================================

app.use(
    "/api/cart",
    cartRoutes
);


// =========================================================
// REVIEW API
// =========================================================

app.use(
    "/api/reviews",
    reviewRoutes
);


// =========================================================
// HOME
// =========================================================

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


// =========================================================
// LOGIN
// =========================================================

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


// =========================================================
// REGISTER
// =========================================================

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


// =========================================================
// PRODUCTS
// =========================================================

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


// =========================================================
// PRODUCT DETAILS
// =========================================================
// URL:
// /product-details.html?id=1
//
// ACTUAL FILE:
// frontend/pages/product_details.html
// =========================================================

app.get(
    "/product-details.html",
    (req, res) => {

        res.sendFile(
            path.join(
                pagesPath,
                "product_details.html"
            ),
            error => {

                if (error) {

                    console.error(
                        "Product details page error:",
                        error
                    );

                    if (!res.headersSent) {

                        res.status(404).send(
                            "Product details page not found."
                        );

                    }

                }

            }
        );

    }
);


// =========================================================
// PRODUCT DETAILS WITHOUT .HTML
// =========================================================
// Example:
// /product-details?id=1
// =========================================================

app.get(
    "/product-details",
    (req, res) => {

        res.sendFile(
            path.join(
                pagesPath,
                "product_details.html"
            )
        );

    }
);


// =========================================================
// OLD UNDERSCORE URL SUPPORT
// =========================================================
// /product_details.html?id=1
//        ↓
// /product-details.html?id=1
// =========================================================

app.get(
    "/product_details.html",
    (req, res) => {

        const queryString =
            new URLSearchParams(
                req.query
            ).toString();

        const redirectUrl =
            queryString
                ? `/product-details.html?${queryString}`
                : "/product-details.html";

        res.redirect(
            redirectUrl
        );

    }
);


// =========================================================
// OLD UNDERSCORE URL SUPPORT
// =========================================================
// /product_details?id=1
//        ↓
// /product-details.html?id=1
// =========================================================

app.get(
    "/product_details",
    (req, res) => {

        const queryString =
            new URLSearchParams(
                req.query
            ).toString();

        const redirectUrl =
            queryString
                ? `/product-details.html?${queryString}`
                : "/product-details.html";

        res.redirect(
            redirectUrl
        );

    }
);


// =========================================================
// CART
// =========================================================

app.get(
    "/cart",
    (req, res) => {

        res.sendFile(
            path.join(
                pagesPath,
                "cart.html"
            )
        );

    }
);


// =========================================================
// SERVICES
// =========================================================

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


// =========================================================
// ABOUT
// =========================================================

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


// =========================================================
// PROFILE
// =========================================================

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


// =========================================================
// ADMIN
// =========================================================

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


// =========================================================
// 404
// =========================================================

app.use(
    (req, res) => {

        res.status(404).send(
            "Page not found"
        );

    }
);


// =========================================================
// ERROR HANDLER
// =========================================================

app.use(
    (err, req, res, next) => {

        console.error(
            "Server Error:",
            err
        );

        if (!res.headersSent) {

            res.status(500).send(
                "Internal server error"
            );

        }

    }
);


// =========================================================
// START SERVER
// =========================================================

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