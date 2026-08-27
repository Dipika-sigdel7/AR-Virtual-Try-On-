require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();

const PORT = process.env.PORT || 3000;


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

if (!process.env.SESSION_SECRET) {

    console.error(
        "ERROR: SESSION_SECRET is missing from .env"
    );

    process.exit(1);
}


app.use(
    session({

        secret: process.env.SESSION_SECRET,

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
   ROUTES
========================================================= */

const adminProductRoutes =
    require("./routes/adminProductRoutes");


const productRoutes =
    require("./routes/productRoutes");


const userRoutes =
    require("./routes/userRoutes");


/* =========================================================
   USER API
========================================================= */

app.use(
    "/api/users",
    userRoutes
);


/* =========================================================
   STATIC FRONTEND FILES
========================================================= */

app.use(
    express.static(frontendPath)
);


/* =========================================================
   PRODUCT IMAGE UPLOADS
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
   API ROUTES
========================================================= */

// Admin product management

app.use(
    "/api/admin/products",
    adminProductRoutes
);


// Public product API

app.use(
    "/api/products",
    productRoutes
);


/* =========================================================
   PAGE ROUTES
========================================================= */


/* -------------------------
   HOME
------------------------- */

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            pagesPath,
            "index.html"
        )
    );

});


/* -------------------------
   PRODUCTS
------------------------- */

app.get("/products", (req, res) => {

    res.sendFile(
        path.join(
            pagesPath,
            "products.html"
        )
    );

});


/* -------------------------
   LOGIN
------------------------- */

app.get("/login", (req, res) => {

    res.sendFile(
        path.join(
            pagesPath,
            "login.html"
        )
    );

});


// register
app.get("/register", (req, res) => {
    res.sendFile(
        path.join(pagesPath, "register.html")
    );
});


/* -------------------------
   ADMIN
------------------------- */

app.get("/admin", (req, res) => {

    res.sendFile(
        path.join(
            pagesPath,
            "admin.html"
        )
    );

});


/* -------------------------
   SERVICES
------------------------- */

app.get("/services", (req, res) => {

    res.sendFile(
        path.join(
            pagesPath,
            "services.html"
        )
    );

});


/* -------------------------
   ABOUT
------------------------- */

app.get("/about", (req, res) => {

    res.sendFile(
        path.join(
            pagesPath,
            "about.html"
        )
    );

});


/* =========================================================
   404 HANDLER
========================================================= */

app.use((req, res) => {

    res.status(404).send(
        "Page not found"
    );

});


/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

    console.log(
        `Login page: http://localhost:${PORT}/login`
    );

});