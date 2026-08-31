// =========================================================
// AR E-COMMERCE
// PUBLIC PRODUCTS ROUTES
// PRODUCTS + IMAGES + CATEGORIES
// =========================================================

const express = require("express");
const db = require("../config/db");

const router = express.Router();


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
                p.stock,
                p.rating,
                p.is_available,
                p.created_at,

                c.id AS category_id,
                c.name AS category_name,

                (
                    SELECT pi.image
                    FROM product_images pi
                    WHERE pi.product_id = p.id
                    ORDER BY pi.id ASC
                    LIMIT 1
                ) AS image

            FROM products p

            LEFT JOIN categories c
                ON p.category_id = c.id

            WHERE p.is_available = 1

            ORDER BY p.created_at DESC
        `);


        // =====================================================
        // FORMAT PRODUCTS
        // =====================================================

        const formattedProducts = products.map((product) => {

            let image = product.image || null;


            // -------------------------------------------------
            // CLEAN IMAGE VALUE
            // -------------------------------------------------

            if (image) {

                image = String(image).trim();

            }


            return {

                id: product.id,

                name: product.name,

                description:
                    product.description || "",

                price:
                    Number(product.price || 0),

                stock:
                    Number(product.stock || 0),

                rating:
                    Number(product.rating || 0),

                is_available:
                    Number(product.is_available || 0),

                created_at:
                    product.created_at,

                category_id:
                    product.category_id,

                category_name:
                    product.category_name || "",

                image:
                    image

            };

        });


        // =====================================================
        // SEND RESPONSE
        // =====================================================

        return res.json({

            success: true,

            products: formattedProducts

        });

    }

    catch (error) {

        console.error(
            "================================================="
        );

        console.error(
            "GET ALL PRODUCTS ERROR"
        );

        console.error(
            error
        );

        console.error(
            "================================================="
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load products.",

            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined

        });

    }

});


// =========================================================
// GET ALL CATEGORIES
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


        return res.json({

            success: true,

            categories: categories || []

        });

    }

    catch (error) {

        console.error(
            "GET CATEGORIES ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load categories."

        });

    }

});


// =========================================================
// GET SINGLE PRODUCT
// GET /api/products/:id
// =========================================================

router.get("/:id", async (req, res) => {

    try {

        const productId =
            Number(req.params.id);


        // =====================================================
        // VALIDATE PRODUCT ID
        // =====================================================

        if (
            !Number.isInteger(productId) ||
            productId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid product ID."

            });

        }


        // =====================================================
        // GET PRODUCT
        // =====================================================

        const [products] =
            await db.execute(
                `
                SELECT
                    p.id,
                    p.name,
                    p.description,
                    p.price,
                    p.stock,
                    p.rating,
                    p.is_available,
                    p.created_at,

                    c.id AS category_id,
                    c.name AS category_name,

                    (
                        SELECT pi.image
                        FROM product_images pi
                        WHERE pi.product_id = p.id
                        ORDER BY pi.id ASC
                        LIMIT 1
                    ) AS image

                FROM products p

                LEFT JOIN categories c
                    ON p.category_id = c.id

                WHERE p.id = ?

                LIMIT 1
                `,
                [productId]
            );


        // =====================================================
        // PRODUCT NOT FOUND
        // =====================================================

        if (
            !products ||
            products.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Product not found."

            });

        }


        // =====================================================
        // FORMAT PRODUCT
        // =====================================================

        const product =
            products[0];


        let image =
            product.image || null;


        if (image) {

            image =
                String(image).trim();

        }


        const formattedProduct = {

            id:
                product.id,

            name:
                product.name,

            description:
                product.description || "",

            price:
                Number(product.price || 0),

            stock:
                Number(product.stock || 0),

            rating:
                Number(product.rating || 0),

            is_available:
                Number(product.is_available || 0),

            created_at:
                product.created_at,

            category_id:
                product.category_id,

            category_name:
                product.category_name || "",

            image:
                image

        };


        // =====================================================
        // SEND PRODUCT
        // =====================================================

        return res.json({

            success: true,

            product:
                formattedProduct

        });

    }

    catch (error) {

        console.error(
            "================================================="
        );

        console.error(
            "GET SINGLE PRODUCT ERROR"
        );

        console.error(
            error
        );

        console.error(
            "================================================="
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load product.",

            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined

        });

    }

});


// =========================================================
// EXPORT ROUTER
// =========================================================

module.exports = router;