
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
// PATHS
// =========================================================



const frontendPath = path.join(
    __dirname,
    "../frontend"
);

const pagesPath = path.join(
    frontendPath,
    "pages"
);

const frontendImagesPath = path.join(
    frontendPath,
    "images"
);

const uploadsPath = path.join(
    __dirname,
    "uploads"
);


// =========================================================
// MIDDLEWARE
// =========================================================

// JSON body
app.use(
    express.json({
        limit: "10mb"
    })
);


// Form body
app.use(
    express.urlencoded({
        extended: true,
        limit: "10mb"
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
                24 *
                60 *
                60 *
                1000

        }

    })
);


// =========================================================
// STATIC FRONTEND
// =========================================================
//
// This serves:
//
// frontend/css/...
// frontend/js/...
// frontend/images/...
//
// Example:
//
// frontend/images/products/glasses.jpg
//
// Browser:
//
// http://localhost:3000/images/products/glasses.jpg
//
// =========================================================

app.use(
    express.static(
        frontendPath
    )
);


// =========================================================
// EXPLICIT IMAGE ROUTE
// =========================================================
//
// This guarantees that:
//
// /images/products/filename.jpg
//
// maps to:
//
// frontend/images/products/filename.jpg
//
// =========================================================

app.use(
    "/images",
    express.static(
        frontendImagesPath
    )
);


// =========================================================
// BACKEND UPLOADS
// =========================================================
//
// If you later use backend/uploads:
//
// backend/uploads/products/example.jpg
//
// Browser:
//
// /uploads/products/example.jpg
//
// =========================================================

app.use(
    "/uploads",
    express.static(
        uploadsPath
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
// PUBLIC PRODUCT API
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
// GET /
// =========================================================

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                pagesPath,
                "index.html"
            ),
            (error) => {

                if (error) {

                    console.error(
                        "HOME PAGE ERROR:",
                        error
                    );

                    if (!res.headersSent) {

                        res.status(404).send(
                            "Home page not found."
                        );

                    }

                }

            }
        );

    }
);


// =========================================================
// LOGIN
// GET /login
// =========================================================

app.get(
    "/login",
    (req, res) => {

        res.sendFile(
            path.join(
                pagesPath,
                "login.html"
            ),
            (error) => {

                if (error) {

                    console.error(
                        "LOGIN PAGE ERROR:",
                        error
                    );

                    if (!res.headersSent) {

                        res.status(404).send(
                            "Login page not found."
                        );

                    }

                }

            }
        );

    }
);


// =========================================================
// REGISTER
// GET /register
// =========================================================

app.get(
    "/register",
    (req, res) => {

        res.sendFile(
            path.join(
                pagesPath,
                "register.html"
            ),
            (error) => {

                if (error) {

                    console.error(
                        "REGISTER PAGE ERROR:",
                        error
                    );

                    if (!res.headersSent) {

                        res.status(404).send(
                            "Register page not found."
                        );

                    }

                }

            }
        );

    }
);


// =========================================================
// PRODUCTS
// GET /products
// =========================================================

app.get(
    "/products",
    (req, res) => {

        res.sendFile(
            path.join(
                pagesPath,
                "products.html"
            ),
            (error) => {

                if (error) {

                    console.error(
                        "PRODUCTS PAGE ERROR:",
                        error
                    );

                    if (!res.headersSent) {

                        res.status(404).send(
                            "Products page not found."
                        );

                    }

                }

            }
        );

    }
);


// =========================================================
// PRODUCT DETAILS
// GET /product_details.html
// =========================================================

app.get(
    "/product_details.html",
    (req, res) => {

        res.sendFile(
            path.join(
                pagesPath,
                "product_details.html"
            ),
            (error) => {

                if (error) {

                    console.error(
                        "PRODUCT DETAILS ERROR:",
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
// PRODUCT DETAILS
// GET /product_details
// =========================================================

app.get(
    "/product_details",
    (req, res) => {

        res.sendFile(
            path.join(
                pagesPath,
                "product_details.html"
            ),
            (error) => {

                if (error) {

                    console.error(
                        "PRODUCT DETAILS ERROR:",
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
// HYPHEN PRODUCT DETAILS
// GET /product-details.html
// =========================================================

app.get(
    "/product-details.html",
    (req, res) => {

        const queryString =
            new URLSearchParams(
                req.query
            ).toString();

        const redirectUrl =
            queryString
                ? `/product_details.html?${queryString}`
                : "/product_details.html";

        res.redirect(
            redirectUrl
        );

    }
);


// =========================================================
// HYPHEN PRODUCT DETAILS
// GET /product-details
// =========================================================

app.get(
    "/product-details",
    (req, res) => {

        const queryString =
            new URLSearchParams(
                req.query
            ).toString();

        const redirectUrl =
            queryString
                ? `/product_details.html?${queryString}`
                : "/product_details.html";

        res.redirect(
            redirectUrl
        );

    }
);


// =========================================================
// CART
// GET /cart
// =========================================================

app.get(
    "/cart",
    (req, res) => {

        res.sendFile(
            path.join(
                pagesPath,
                "cart.html"
            ),
            (error) => {

                if (error) {

                    console.error(
                        "CART PAGE ERROR:",
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
// GET /services
// =========================================================

app.get(
    "/services",
    (req, res) => {

        res.sendFile(
            path.join(
                pagesPath,
                "services.html"
            ),
            (error) => {

                if (error) {

                    console.error(
                        "SERVICES PAGE ERROR:",
                        error
                    );

                    if (!res.headersSent) {

                        res.status(404).send(
                            "Services page not found."
                        );

                    }

                }

            }
        );

    }
);


// =========================================================
// ABOUT
// GET /about
// =========================================================

app.get(
    "/about",
    (req, res) => {

        res.sendFile(
            path.join(
                pagesPath,
                "about.html"
            ),
            (error) => {

                if (error) {

                    console.error(
                        "ABOUT PAGE ERROR:",
                        error
                    );

                    if (!res.headersSent) {

                        res.status(404).send(
                            "About page not found."
                        );

                    }

                }

            }
        );

    }
);


// =========================================================
// PROFILE
// GET /profile
// =========================================================

app.get(
    "/profile",
    (req, res) => {

        res.sendFile(
            path.join(
                pagesPath,
                "profile.html"
            ),
            (error) => {

                if (error) {

                    console.error(
                        "PROFILE PAGE ERROR:",
                        error
                    );

                    if (!res.headersSent) {

                        res.status(404).send(
                            "Profile page not found."
                        );

                    }

                }

            }
        );

    }
);


// =========================================================
// ADMIN
// GET /admin
// =========================================================

app.get(
    "/admin",
    (req, res) => {

        res.sendFile(
            path.join(
                pagesPath,
                "admin.html"
            ),
            (error) => {

                if (error) {

                    console.error(
                        "ADMIN PAGE ERROR:",
                        error
                    );

                    if (!res.headersSent) {

                        res.status(404).send(
                            "Admin page not found."
                        );

                    }

                }

            }
        );

    }
);


// =========================================================
// API 404
// =========================================================

app.use(
    "/api",
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "API endpoint not found."

        });

    }
);


// =========================================================
// GENERAL 404
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
            "SERVER ERROR:",
            err
        );

        if (res.headersSent) {

            return next(err);

        }

        res.status(500).json({

            success: false,

            message:
                "Internal server error."

        });

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

        console.log(
            "Frontend:",
            frontendPath
        );

        console.log(
            "Pages:",
            pagesPath
        );

        console.log(
            "Images:",
            frontendImagesPath
        );

        console.log(
            "Uploads:",
            uploadsPath
        );

        console.log(
            "========================================"
        );

    }
);
