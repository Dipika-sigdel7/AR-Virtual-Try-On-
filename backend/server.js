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

// Parse JSON
app.use(express.json());

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
            maxAge: 24 * 60 * 60 * 1000
        }
    })
);


/* =========================================================
   STATIC FILES
========================================================= */

// Frontend static files
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

// Home
app.get("/", (req, res) => {
    res.sendFile(
        path.join(pagesPath, "index.html")
    );
});


// Login
app.get("/login", (req, res) => {
    res.sendFile(
        path.join(pagesPath, "login.html")
    );
});


// Register
app.get("/register", (req, res) => {
    res.sendFile(
        path.join(pagesPath, "register.html")
    );
});


// Products
app.get("/products", (req, res) => {
    res.sendFile(
        path.join(pagesPath, "products.html")
    );
});


// Services
app.get("/services", (req, res) => {
    res.sendFile(
        path.join(pagesPath, "services.html")
    );
});


// About
app.get("/about", (req, res) => {
    res.sendFile(
        path.join(pagesPath, "about.html")
    );
});


// Admin
app.get("/admin", (req, res) => {
    res.sendFile(
        path.join(pagesPath, "admin.html")
    );
});


/* =========================================================
   PROFILE PAGE
========================================================= */

app.get("/profile", (req, res) => {

    if (!req.session.user) {
        return res.redirect("/login");
    }

    res.sendFile(
        path.join(pagesPath, "profile.html")
    );
});


/* =========================================================
   LOGGED-IN USER CHECK
========================================================= */

app.get("/api/auth/me", (req, res) => {

    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: "User is not logged in"
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

app.post("/api/auth/logout", (req, res) => {

    req.session.destroy((error) => {

        if (error) {
            console.error(
                "Logout error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Logout failed"
            });
        }

        res.clearCookie("connect.sid");

        res.json({
            success: true,
            message: "Logged out successfully"
        });
    });
});


/* =========================================================
   404
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
        `Server running on http://localhost:${PORT}`
    );

});