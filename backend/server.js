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

// Parse JSON
app.use(
    express.json()
);


// Parse form data
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
// STATIC FRONTEND FILES
// =========================================================

app.use(
    express.static(
        frontendPath
    )
);


// =========================================================
// UPLOADED PRODUCT IMAGES
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
// IMPORT API ROUTES
// =========================================================

const userRoutes =
    require("./routes/userRoutes");

const productRoutes =
    require("./routes/productRoutes");

const adminProductRoutes =
    require("./routes/adminProductRoutes");

const cartRoutes =
    require("./routes/cartRoutes");


// =========================================================
// USER API ROUTES
// =========================================================

/*
    POST /api/users/register
    POST /api/users/login
    GET  /api/users/me
    POST /api/users/logout
*/

app.use(
    "/api/users",
    userRoutes
);


// =========================================================
// PRODUCT API ROUTES
// =========================================================

/*
    GET /api/products
    GET /api/products/:id
*/

app.use(
    "/api/products",
    productRoutes
);


// =========================================================
// ADMIN PRODUCT API ROUTES
// =========================================================

/*
    GET    /api/admin/products
    POST   /api/admin/products
    PUT    /api/admin/products/:id
    DELETE /api/admin/products/:id
*/

app.use(
    "/api/admin/products",
    adminProductRoutes
);


// =========================================================
// CART API ROUTES
// =========================================================

/*
    GET    /api/cart
    POST   /api/cart/add
    DELETE /api/cart/:cartItemId
    DELETE /api/cart
*/

app.use(
    "/api/cart",
    cartRoutes
);


// =========================================================
// PAGE ROUTES
// =========================================================


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
//
// Supports:
//
// /product_details.html?id=1
// /product_details?id=1
// /product-details?id=1
//
// Actual file:
//
// frontend/pages/product_details.html
//
// =========================================================

app.get(
    [
        "/product_details.html",
        "/product_details",
        "/product-details"
    ],
    (req, res) => {

        const productDetailsPage =
            path.join(
                pagesPath,
                "product_details.html"
            );

        res.sendFile(
            productDetailsPage,
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
// CART PAGE
// =========================================================

app.get(
    "/cart",
    (req, res) => {

        res.sendFile(
            path.join(
                pagesPath,
                "cart.html"
            ),
            error => {

                if (error) {

                    console.error(
                        "Cart page error:",
                        error
                    );

                    if (!res.headersSent) {

                        res.status(404).send(
                            "Cart page not found."
                        );

                    }

                }

            }
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

        console.log(
            "404 - Page not found:",
            req.method,
            req.originalUrl
        );

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