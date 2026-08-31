// =========================================================
// AR E-COMMERCE
// PUBLIC PRODUCTS ROUTES
// PRODUCT + IMAGES + CATEGORIES
// =========================================================

const express = require("express");
const db = require("../config/db");

const router = express.Router();


// =========================================================
// IMAGE URL HELPER
// =========================================================

function formatImageUrl(image) {

    if (image === null || image === undefined) {
        return null;
    }

    image = String(image).trim();

    if (image === "") {
        return null;
    }

    // -----------------------------------------------------
    // Already a full URL
    // -----------------------------------------------------

    if (
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {
        return image;
    }

    // -----------------------------------------------------
    // Normalize Windows path
    // -----------------------------------------------------

    image = image.replace(/\\/g, "/");

    // -----------------------------------------------------
    // If path already contains /uploads/
    // Example:
    // uploads/products/glasses.jpg
    // /uploads/products/glasses.jpg
    // C:/project/uploads/products/glasses.jpg
    // -----------------------------------------------------

    const uploadsIndex = image.indexOf("uploads/");

    if (uploadsIndex !== -1) {

        return "/" + image.substring(uploadsIndex);

    }

    // -----------------------------------------------------
    // Already starts with /
    // -----------------------------------------------------

    if (image.startsWith("/")) {
        return image;
    }

    // -----------------------------------------------------
    // Database contains only filename
    // Example:
    // glasses.jpg
    // -----------------------------------------------------

    return `/uploads/products/${image}`;
}


// =========================================================
// GET ALL PRODUCTS
// GET /api/products
// =========================================================

router.get("/", async (req, res) => {

    try {

        const [products] = await db.execute(`

            SELECT

                p.id,
                p.name,
                p.description,
                p.price,

                (
                    SELECT pi.image_url
                    FROM product_images pi
                    WHERE pi.product_id = p.id
                    ORDER BY
                        pi.is_primary DESC,
                        pi.id ASC
                    LIMIT 1
                ) AS image,

                p.stock,
                p.rating,
                p.is_available,
                p.created_at,

                c.id AS category_id,
                c.name AS category_name

            FROM products p

            LEFT JOIN categories c
                ON p.category_id = c.id

            WHERE p.is_available = 1

            ORDER BY p.created_at DESC

        `);


        const formattedProducts = products.map(product => ({

            id: product.id,

            name: product.name,

            description: product.description,

            price: Number(product.price),

            image: formatImageUrl(product.image),

            stock: Number(product.stock),

            rating: Number(product.rating || 0),

            is_available:
                Number(product.is_available) === 1,

            created_at: product.created_at,

            category_id: product.category_id,

            category_name: product.category_name

        }));


        console.log(
            "PUBLIC PRODUCTS:",
            formattedProducts
        );


        return res.status(200).json({

            success: true,

            products: formattedProducts

        });

    }

    catch (error) {

        console.error(
            "GET PRODUCTS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to load products."

        });

    }

});


// =========================================================
// GET CATEGORIES
// GET /api/products/categories
// =========================================================

router.get("/categories", async (req, res) => {

    try {

        const [categories] = await db.execute(`

            SELECT
                id,
                name,
                description

            FROM categories

            ORDER BY name ASC

        `);


        return res.status(200).json({

            success: true,

            categories: categories

        });

    }

    catch (error) {

        console.error(
            "GET CATEGORIES ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to load categories."

        });

    }

});


// =========================================================
// GET SINGLE PRODUCT
// GET /api/products/:id
// =========================================================

router.get("/:id", async (req, res) => {

    try {

        const productId = Number(req.params.id);


        // --------------------------------------------------
        // Validate ID
        // --------------------------------------------------

        if (
            !Number.isInteger(productId) ||
            productId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message: "Invalid product ID."

            });

        }


        // --------------------------------------------------
        // Get product
        // --------------------------------------------------

        const [products] = await db.execute(`

            SELECT

                p.id,
                p.name,
                p.description,
                p.price,

                (
                    SELECT pi.image_url
                    FROM product_images pi
                    WHERE pi.product_id = p.id
                    ORDER BY
                        pi.is_primary DESC,
                        pi.id ASC
                    LIMIT 1
                ) AS image,

                p.stock,
                p.rating,
                p.is_available,
                p.created_at,

                c.id AS category_id,
                c.name AS category_name

            FROM products p

            LEFT JOIN categories c
                ON p.category_id = c.id

            WHERE p.id = ?

            LIMIT 1

        `, [productId]);


        // --------------------------------------------------
        // Product not found
        // --------------------------------------------------

        if (products.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }


        // --------------------------------------------------
        // Format product
        // --------------------------------------------------

        const product = {

            id: products[0].id,

            name: products[0].name,

            description: products[0].description,

            price: Number(products[0].price),

            image:
                formatImageUrl(
                    products[0].image
                ),

            stock:
                Number(products[0].stock),

            rating:
                Number(products[0].rating || 0),

            is_available:
                Number(products[0].is_available) === 1,

            created_at:
                products[0].created_at,

            category_id:
                products[0].category_id,

            category_name:
                products[0].category_name

        };


        // --------------------------------------------------
        // Get ALL images
        // --------------------------------------------------

        const [images] = await db.execute(`

            SELECT

                id,
                image_url,
                is_primary

            FROM product_images

            WHERE product_id = ?

            ORDER BY
                is_primary DESC,
                id ASC

        `, [productId]);


        product.images = images.map(image => ({

            id: image.id,

            image:
                formatImageUrl(
                    image.image_url
                ),

            is_primary:
                Number(image.is_primary) === 1

        }));


        // --------------------------------------------------
        // Response
        // --------------------------------------------------

        return res.status(200).json({

            success: true,

            product: product

        });

    }

    catch (error) {

        console.error(
            "GET SINGLE PRODUCT ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to load product."

        });

    }

});


// =========================================================
// EXPORT ROUTER
// =========================================================

module.exports = router;