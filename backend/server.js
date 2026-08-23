const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;


/* =========================================
   ROUTES
========================================= */

const adminProductRoutes =
    require("./routes/adminProductRoutes");

const productRoutes =
    require("./routes/productRoutes");


/* =========================================
   MIDDLEWARE
========================================= */

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


/* =========================================
   FRONTEND PATHS
========================================= */

const frontendPath =
    path.join(__dirname, "../frontend");

const pagesPath =
    path.join(frontendPath, "pages");


/* =========================================
   STATIC FRONTEND FILES
========================================= */

app.use(
    express.static(frontendPath)
);


/* =========================================
   PRODUCT IMAGE UPLOADS
========================================= */

app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);


/* =========================================
   API ROUTES
========================================= */

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


/* =========================================
   PAGES
========================================= */

// Home
app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            pagesPath,
            "index.html"
        )
    );

});


// Products
app.get("/products", (req, res) => {

    res.sendFile(
        path.join(
            pagesPath,
            "products.html"
        )
    );

});


// Admin Dashboard
app.get("/admin", (req, res) => {

    res.sendFile(
        path.join(
            pagesPath,
            "admin.html"
        )
    );

});


// Services
app.get("/services", (req, res) => {

    res.sendFile(
        path.join(
            pagesPath,
            "services.html"
        )
    );

});


// About
app.get("/about", (req, res) => {

    res.sendFile(
        path.join(
            pagesPath,
            "about.html"
        )
    );

});


/* =========================================
   START SERVER
========================================= */

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});