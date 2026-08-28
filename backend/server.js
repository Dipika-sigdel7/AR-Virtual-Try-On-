
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
    path.join(__dirname, "../frontend");

const pagesPath =
    path.join(frontendPath, "pages");


/* =========================================================
   MIDDLEWARE
========================================================= */

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


/* =========================================================
   SESSION
========================================================= */

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

            maxAge:
                24 * 60 * 60 * 1000

        }

    })
);


/* =========================================================
   STATIC FILES
========================================================= */

// Frontend files
app.use(
    express.static(frontendPath)
);


// Uploaded product images
app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);


/* =========================================================
   API ROUTES
========================================================= */

const productRoutes =
    require("./routes/productRoutes");

const adminProductRoutes =
    require("./routes/adminProductRoutes");

const userRoutes =
    require("./routes/userRoutes");


app.use(
    "/api/products",
    productRoutes
);


app.use(
    "/api/admin/products",
    adminProductRoutes
);


app.use(
    "/api/users",
    userRoutes
);


/* =========================================================
   PAGE ROUTES
========================================================= */


/* =========================================================
   HOME
========================================================= */

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            pagesPath,
            "index.html"
        )
    );

});


/* =========================================================
   LOGIN
========================================================= */

app.get("/login", (req, res) => {

    res.sendFile(
        path.join(
            pagesPath,
            "login.html"
        )
    );

});


/* =========================================================
   REGISTER
========================================================= */

app.get("/register", (req, res) => {

    res.sendFile(
        path.join(
            pagesPath,
            "register.html"
        )
    );

});


/* =========================================================
   PRODUCTS
========================================================= */

app.get("/products", (req, res) => {

    res.sendFile(
        path.join(
            pagesPath,
            "products.html"
        )
    );

});


/* =========================================================
   SERVICES
========================================================= */

app.get("/services", (req, res) => {

    res.sendFile(
        path.join(
            pagesPath,
            "services.html"
        )
    );

});


/* =========================================================
   ABOUT
========================================================= */

app.get("/about", (req, res) => {

    res.sendFile(
        path.join(
            pagesPath,
            "about.html"
        )
    );

});


/* =========================================================
   ADMIN
========================================================= */

app.get("/admin", (req, res) => {

    res.sendFile(
        path.join(
            pagesPath,
            "admin.html"
        )
    );

});


/* =========================================================
   IMPORTANT
=========================================================

   There is NO /profile route.

   The user profile is displayed as a popup
   inside index.html.

   Therefore we DO NOT need:

       frontend/pages/profile.html

========================================================= */


/* =========================================================
   LOGGED-IN USER
========================================================= */

app.get("/api/auth/me", (req, res) => {

    if (!req.session.user) {

        return res.status(401).json({

            success: false,

            message:
                "User is not logged in"

        });

    }


    res.json({

        success: true,

        user: req.session.user

    });

});


/* =========================================================
   LOGOUT
========================================================= */

app.post(
    "/api/auth/logout",
    (req, res) => {

        req.session.destroy(
            (error) => {

                if (error) {

                    console.error(
                        "Logout error:",
                        error
                    );


                    return res.status(500).json({

                        success: false,

                        message:
                            "Logout failed"

                    });

                }


                res.clearCookie(
                    "connect.sid"
                );


                res.json({

                    success: true,

                    message:
                        "Logged out successfully"

                });

            }
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
            `Server running on http://localhost:${PORT}`
        );

    }
);

