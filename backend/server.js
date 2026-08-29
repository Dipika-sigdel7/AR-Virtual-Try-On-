// =========================================================
// AR E-COMMERCE
// EXPRESS SERVER
// SESSION + USER + PRODUCT + CART
// =========================================================

require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");
const fs = require("fs");

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

const uploadsPath = path.join(
    __dirname,
    "uploads"
);

app.use(
    "/uploads",
    express.static(
        uploadsPath
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

app.use(
    "/api/users",
    userRoutes
);


// =========================================================
// PRODUCT API ROUTES
// =========================================================

app.use(
    "/api/products",
    productRoutes
);


// =========================================================
// ADMIN PRODUCT API ROUTES
// =========================================================

app.use(
    "/api/admin/products",
    adminProductRoutes
);


// =========================================================
// CART API ROUTES
// =========================================================

app.use(
    "/api/cart",
    cartRoutes
);


// =========================================================
// HELPER FUNCTION
// =========================================================

function sendPage(
    res,
    pageName
) {

    const filePath =
        path.join(
            pagesPath,
            pageName
        );


    // Check whether the file exists
    if (!fs.existsSync(filePath)) {

        console.error(
            `Page not found: ${filePath}`
        );

        return res
            .status(404)
            .send(
                `Page "${pageName}" not found inside frontend/pages`
            );
    }


    res.sendFile(
        filePath,
        error => {

            if (error) {

                console.error(
                    `Error loading ${pageName}:`,
                    error
                );

                if (!res.headersSent) {

                    res
                        .status(500)
                        .send(
                            `Unable to load ${pageName}`
                        );
                }
            }
        }
    );
}


// =========================================================
// PAGE ROUTES
// =========================================================


// =========================================================
// HOME
// =========================================================

app.get(
    "/",
    (req, res) => {

        sendPage(
            res,
            "index.html"
        );

    }
);


// =========================================================
// LOGIN
// =========================================================

app.get(
    "/login",
    (req, res) => {

        sendPage(
            res,
            "login.html"
        );

    }
);


// =========================================================
// REGISTER
// =========================================================

app.get(
    "/register",
    (req, res) => {

        sendPage(
            res,
            "register.html"
        );

    }
);


// =========================================================
// PRODUCTS
// =========================================================

app.get(
    "/products",
    (req, res) => {

        sendPage(
            res,
            "products.html"
        );

    }
);


// =========================================================
// PRODUCT DETAILS
// WITH .HTML
// =========================================================

app.get(
    "/product-details.html",
    (req, res) => {

        sendPage(
            res,
            "product-details.html"
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

        sendPage(
            res,
            "product-details.html"
        );

    }
);


// =========================================================
// SERVICES
// =========================================================

app.get(
    "/services",
    (req, res) => {

        sendPage(
            res,
            "services.html"
        );

    }
);


// =========================================================
// ABOUT
// =========================================================

app.get(
    "/about",
    (req, res) => {

        sendPage(
            res,
            "about.html"
        );

    }
);


// =========================================================
// PROFILE
// =========================================================

app.get(
    "/profile",
    (req, res) => {

        sendPage(
            res,
            "profile.html"
        );

    }
);


// =========================================================
// ADMIN
// =========================================================

app.get(
    "/admin",
    (req, res) => {

        sendPage(
            res,
            "admin.html"
        );

    }
);


// =========================================================
// 404
// =========================================================

app.use(
    (req, res) => {

        res
            .status(404)
            .send(
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

        res
            .status(500)
            .send(
                "Internal server error"
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

        console.log(
            `Frontend: ${frontendPath}`
        );

        console.log(
            `Pages:    ${pagesPath}`
        );

        console.log(
            `Uploads:  ${uploadsPath}`
        );

    }
);