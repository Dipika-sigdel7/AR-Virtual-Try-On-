// =========================================================
// AR E-COMMERCE
// PUBLIC PRODUCTS ROUTES
// PRODUCT + IMAGE
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

                /* GET IMAGE FROM product_images TABLE */
                (
                    SELECT pi.image
                    FROM product_images pi
                    WHERE pi.product_id = p.id
                    ORDER BY pi.id ASC
                    LIMIT 1
                ) AS image,

                p.stock,
                p.rating,
                p.is_available,
                p.created_at,

                c.id AS category_id,
                c.name AS category_name

            FROM products p

            INNER JOIN categories c
                ON p.category_id = c.id

            WHERE p.is_available = 1

            ORDER BY p.created_at DESC
        `);


        // -------------------------------------------------
        // FIX IMAGE FORMAT
        // -------------------------------------------------

        const formattedProducts = products.map(product => {

            let image = product.image;


            // If no image exists
            if (!image) {

                image = null;

            }


            // If database already stores complete URL
            // keep it unchanged.
            //
            // Otherwise frontend can use the returned path.

            return {
                ...product,
                image: image
            };

        });


        res.json({

            success: true,

            products: formattedProducts

        });

    }

    catch (error) {

        console.error(
            "GET PRODUCTS ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to load products."

        });

    }

});


// =========================================================
// GET CATEGORIES
// GET /api/products/categories
// =========================================================

router.get(
    "/categories",
    async (req, res) => {

        try {

            const [categories] =
                await db.execute(`
                    SELECT
                        id,
                        name,
                        description

                    FROM categories

                    ORDER BY name ASC
                `);


            res.json({

                success: true,

                categories: categories

            });

        }

        catch (error) {

            console.error(
                "GET CATEGORIES ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to load categories."

            });

        }

    }
);


// =========================================================
// GET SINGLE PRODUCT
// GET /api/products/:id
// =========================================================

router.get(
    "/:id",
    async (req, res) => {

        try {

            const productId =
                Number(
                    req.params.id
                );


            // -------------------------------------------------
            // VALIDATE ID
            // -------------------------------------------------

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


            // -------------------------------------------------
            // GET PRODUCT
            // -------------------------------------------------

            const [products] =
                await db.execute(
                    `
                    SELECT
                        p.id,
                        p.name,
                        p.description,
                        p.price,

                        /* GET IMAGE FROM product_images */
                        (
                            SELECT pi.image
                            FROM product_images pi
                            WHERE pi.product_id = p.id
                            ORDER BY pi.id ASC
                            LIMIT 1
                        ) AS image,

                        p.stock,
                        p.rating,
                        p.is_available,
                        p.created_at,

                        c.id AS category_id,
                        c.name AS category_name

                    FROM products p

                    INNER JOIN categories c
                        ON p.category_id = c.id

                    WHERE p.id = ?
                    `,
                    [productId]
                );


            // -------------------------------------------------
            // PRODUCT NOT FOUND
            // -------------------------------------------------

            if (
                products.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Product not found."

                });

            }


            // -------------------------------------------------
            // PRODUCT
            // -------------------------------------------------

            const product =
                products[0];


            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            res.json({

                success: true,

                product: product

            });

        }

        catch (error) {

            console.error(
                "GET PRODUCT ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to load product."

            });

        }

    }
);


module.exports = router;