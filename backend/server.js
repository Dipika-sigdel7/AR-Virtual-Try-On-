require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();

const PORT =
    process.env.PORT || 3000;


/* =========================================================
   PATHS
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
   MIDDLEWARE
========================================================= */

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);


/* =========================================================
   SESSION
   IMPORTANT:
   SESSION MUST COME BEFORE API ROUTES
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

app.use(
    express.static(
        frontendPath
    )
);

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

const productRoutes =
    require("./routes/productRoutes");

const adminProductRoutes =
    require("./routes/adminProductRoutes");

const userRoutes =
    require("./routes/userRoutes");

const cartRoutes =
    require("./routes/cartRoutes");


/* =========================================================
   USER ROUTES
========================================================= */

app.use(
    "/api/users",
    userRoutes
);


/* =========================================================
   PRODUCT ROUTES
========================================================= */

app.use(
    "/api/products",
    productRoutes
);


/* =========================================================
   ADMIN PRODUCT ROUTES
========================================================= */

app.use(
    "/api/admin/products",
    adminProductRoutes
);


/* =========================================================
   CART ROUTES
   SESSION IS ALREADY ACTIVE HERE
========================================================= */

app.use(
    "/api/cart",
    cartRoutes
);


/* =========================================================
   PAGE ROUTES
========================================================= */

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
            `Server running on http://localhost:${PORT}`
        );

    }
);