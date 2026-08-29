
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


// =========================================================
// FRONTEND PATHS
// =========================================================

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


// =========================================================
// MIDDLEWARE
// =========================================================

// Parse JSON requests

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

app.get(
    "/product-details.html",
    (req, res) => {

        res.sendFile(
            path.join(
                pagesPath,
                "product-details.html"
            ),
            error => {

                if (error) {

                    console.error(
                        "Product details page error:",
                        error
                    );


                    res.status(404).send(
                        "Product details page not found. " +
                        "Make sure product-details.html exists inside frontend/pages."
                    );

                }

            }
        );

    }
);


// =========================================================
// PRODUCT DETAILS
// WITHOUT .HTML
// =========================================================

app.get(
    "/product-details",
    (req, res) => {

        res.sendFile(
            path.join(
                pagesPath,
                "product-details.html"
            ),
            error => {

                if (error) {

                    console.error(
                        "Product details page error:",
                        error
                    );


                    res.status(404).send(
                        "Product details page not found. " +
                        "Make sure product-details.html exists inside frontend/pages."
                    );

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

        res.status(404).send(
            "Page not found"
        );

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
