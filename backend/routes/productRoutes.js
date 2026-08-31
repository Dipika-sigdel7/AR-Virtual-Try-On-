// =========================================================
// AR E-COMMERCE
// PUBLIC PRODUCTS ROUTES
// PRODUCT + IMAGE
// =========================================================

const express = require("express");
const db = require("../config/db");

const router = express.Router();


// =========================================================
// IMAGE URL HELPER
// =========================================================

function formatImageUrl(image) {

    if (!image) {
        return null;
    }

    image = String(image).trim();

    if (!image) {
        return null;
    }

    // Already a complete URL
    if (
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {
        return image;
    }

    // Already an uploads path
    if (image.startsWith("/uploads/")) {
        return image;
    }

    // Windows path
    image = image.replace(/\\/g, "/");

    if (image.includes("/uploads/")) {

        return "/" +
            image.substring(
                image.indexOf("uploads/") 
            );

    }

    // If database stores only filename
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


        // =================================================
        // FORMAT PRODUCTS
        // =================================================

        const formattedProducts =
            products.map(product => {

                return {

                    ...product,

                    image:
                        formatImageUrl(
                            product.image
                        )

                };

            });


        console.log(
            "PUBLIC PRODUCTS:",
            formattedProducts
        );


        res.json({

            success: true,

            products:
                formattedProducts

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

                categories:
                    categories

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


            // =================================================
            // VALIDATE ID
            // =================================================

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


            // =================================================
            // GET PRODUCT
            // =================================================

            const [products] =
                await db.execute(
                    `

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

                    `,
                    [productId]
                );


            // =================================================
            // NOT FOUND
            // =================================================

            if (
                products.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Product not found."

                });

            }


            // =================================================
            // FORMAT PRODUCT
            // =================================================

            const product =
                products[0];


            product.image =
                formatImageUrl(
                    product.image
                );


            // =================================================
            // GET ALL PRODUCT IMAGES
            // =================================================

            const [images] =
                await db.execute(
                    `

                    SELECT

                        id,

                        image_url,

                        is_primary

                    FROM product_images

                    WHERE product_id = ?

                    ORDER BY
                        is_primary DESC,
                        id ASC

                    `,
                    [productId]
                );


            product.images =
                images.map(image => {

                    return {

                        id:
                            image.id,

                        image:
                            formatImageUrl(
                                image.image_url
                            ),

                        is_primary:
                            Number(
                                image.is_primary
                            ) === 1

                    };

                });


            // =================================================
            // RESPONSE
            // =================================================

            res.json({

                success: true,

                product:
                    product

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


// =========================================================
// EXPORT
// =========================================================

module.exports =
    router;