const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;


/* =========================================
   ROUTES
========================================= */
const adminProductRoutes = require("./routes/adminProductRoutes");
const productRoutes = require("./routes/productRoutes");


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
   API ROUTES
========================================= */
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/products", productRoutes);


/* =========================================
   STATIC ASSETS (css/js served from /css, /js)
========================================= */

const frontendPath = path.join(__dirname, "../frontend");
const pagesPath = path.join(frontendPath, "pages");

app.use(express.static(frontendPath));


/* =========================================
   PAGES
========================================= */

app.get("/", (req, res) => {
    res.sendFile(path.join(pagesPath, "index.html"));
});

app.get("/products", (req, res) => {
    res.sendFile(path.join(pagesPath, "products.html"));
});

app.get("/services", (req, res) => {
    res.sendFile(path.join(pagesPath, "services.html"));
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(pagesPath, "about.html"));
});


/* =========================================
   START SERVER
========================================= */

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
