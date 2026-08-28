require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();

const PORT = process.env.PORT || 3000;


/* =========================================================
   FRONTEND PATHS
========================================================= */

const frontendPath = path.join(__dirname, "../frontend");
const pagesPath = path.join(frontendPath, "pages");


/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(express.json());

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

            // Keep login for 24 hours
            maxAge: 24 * 60 * 60 * 1000
        }
    })
);


/* =========================================================
   STATIC FILES
========================================================= */

app.use(
    express.static(frontendPath)
);

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

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            pagesPath,
            "index.html"
        )
    );

});


/* =========================================================
   LOGIN PAGE
========================================================= */

app.get("/login", (req, res) => {

    /*
     * If user is already logged in,
     * do NOT show the login form.
     *
     * Send them to their profile.
     */

    if (req.session.user) {

        return res.redirect("/profile");

    }


    res.sendFile(
        path.join(
            pagesPath,
            "login.html"
        )
    );

});


/* =========================================================
   REGISTER PAGE
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
   PROFILE PAGE
========================================================= */

app.get("/profile", (req, res) => {

    /*
     * User must be logged in.
     */

    if (!req.session.user) {

        return res.redirect("/login");

    }


    res.sendFile(
        path.join(
            pagesPath,
            "profile.html"
        )
    );

});


/* =========================================================
   PRODUCTS PAGE
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
   SERVICES PAGE
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
   ABOUT PAGE
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
   ADMIN PAGE
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