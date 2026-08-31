
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
// Actual image location:
//
// frontend/images/products/filename.jpg
//
// Browser URL:
//
// /images/products/filename.jpg
//
// =========================================================

function formatImageUrl(image) {

    if (
        image === null ||
        image === undefined
    ) {
        return null;
    }

    image = String(image).trim();

    if (image === "") {
        return null;
    }


    // =====================================================
    // FULL HTTP / HTTPS URL
    // =====================================================

    if (
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {
        return image;
    }


    // =====================================================
    // NORMALIZE WINDOWS PATH
    // =====================================================

    image = image.replace(/\\/g, "/");


    // =====================================================
    // DATABASE PATH:
    //
    // frontend/images/products/example.jpg
    // =====================================================

    const frontendImagesIndex =
        image.indexOf("frontend/images/");

    if (
        frontendImagesIndex !== -1
    ) {

        return "/" +
            image.substring(
                frontendImagesIndex +
                "frontend/".length
            );

    }


    // =====================================================
    // DATABASE PATH:
    //
    // /frontend/images/products/example.jpg
    // =====================================================

    const frontendImagesSlashIndex =
        image.indexOf("/frontend/images/");

    if (
        frontendImagesSlashIndex !== -1
    ) {

        return image.substring(
            frontendImagesSlashIndex +
            "/frontend".length
        );

    }


    // =====================================================
    // DATABASE PATH:
    //
    // images/products/example.jpg
    // =====================================================

    const imagesIndex =
        image.indexOf("images/");

    if (
        imagesIndex !== -1
    ) {

        return "/" +
            image.substring(
                imagesIndex
            );

    }


    // =====================================================
    // ALREADY CORRECT:
    //
    // /images/products/example.jpg
    // =====================================================

    if (
        image.startsWith("/images/")
    ) {

        return image;

    }


    // =====================================================
    // OLD UPLOAD PATH
    //
    // /uploads/products/example.jpg
    //
    // Convert it to the actual frontend location.
    // =====================================================

    if (
        image.startsWith("/uploads/products/")
    ) {

        const filename =
            image.substring(
                "/uploads/products/".length
            );

        return `/images/products/${filename}`;

    }


    // =====================================================
    // OLD UPLOAD PATH WITHOUT /
    //
    // uploads/products/example.jpg
    // =====================================================

    if (
        image.startsWith("uploads/products/")
    ) {

        const filename =
            image.substring(
                "uploads/products/".length
            );

        return `/images/products/${filename}`;

    }


    // =====================================================
    // ONLY FILENAME IN DATABASE
    //
    // example.jpg
    //
    // Actual location:
    //
    // frontend/images/products/example.jpg
    // =====================================================

    return `/images/products/${image}`;
}


// =========================================================
// GET ALL PRODUCTS
// GET /api/products
// =========================================================

router.get(
    "/",
    async (req, res) => {

        try {

            const [products] =
                await db.execute(`

                    SELECT

                        p.id,

                        p.name,

                        p.description,

                        p.price,

                        (
                            SELECT
                                pi.image_url

                            FROM product_images pi

                            WHERE
                                pi.product_id = p.id

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

                    WHERE
                        p.is_available = 1

                    ORDER BY
                        p.created_at DESC

                `);


            // =================================================
            // FORMAT PRODUCTS
            // =================================================

            const formattedProducts =
                products.map(
                    product => {

                        return {

                            id:
                                product.id,

                            name:
                                product.name,

                            description:
                                product.description,

                            price:
                                Number(
                                    product.price
                                ),

                            image:
                                formatImageUrl(
                                    product.image
                                ),

                            stock:
                                Number(
                                    product.stock || 0
                                ),

                            rating:
                                Number(
                                    product.rating || 0
                                ),

                            is_available:
                                Number(
                                    product.is_available
                                ) === 1,

                            created_at:
                                product.created_at,

                            category_id:
                                product.category_id,

                            category_name:
                                product.category_name

                        };

                    }
                );


            console.log(
                "========================================"
            );

            console.log(
                "PUBLIC PRODUCTS:"
            );

            console.log(
                JSON.stringify(
                    formattedProducts,
                    null,
                    2
                )
            );

            console.log(
                "========================================"
            );


            return res.status(200).json({

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

            return res.status(500).json({

                success: false,

                message:
                    "Failed to load products."

            });

        }

    }
);


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

                    ORDER BY
                        name ASC

                `);


            return res.status(200).json({

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

            return res.status(500).json({

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
                !Number.isInteger(
                    productId
                ) ||
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
                            SELECT
                                pi.image_url

                            FROM product_images pi

                            WHERE
                                pi.product_id = p.id

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

                    WHERE
                        p.id = ?

                    LIMIT 1

                    `,
                    [
                        productId
                    ]
                );


            // =================================================
            // PRODUCT NOT FOUND
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
            // PRODUCT DATA
            // =================================================

            const databaseProduct =
                products[0];


            const product = {

                id:
                    databaseProduct.id,

                name:
                    databaseProduct.name,

                description:
                    databaseProduct.description,

                price:
                    Number(
                        databaseProduct.price
                    ),

                image:
                    formatImageUrl(
                        databaseProduct.image
                    ),

                stock:
                    Number(
                        databaseProduct.stock || 0
                    ),

                rating:
                    Number(
                        databaseProduct.rating || 0
                    ),

                is_available:
                    Number(
                        databaseProduct.is_available
                    ) === 1,

                created_at:
                    databaseProduct.created_at,

                category_id:
                    databaseProduct.category_id,

                category_name:
                    databaseProduct.category_name

            };


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

                    WHERE
                        product_id = ?

                    ORDER BY
                        is_primary DESC,
                        id ASC

                    `,
                    [
                        productId
                    ]
                );


            // =================================================
            // FORMAT ALL IMAGES
            // =================================================

            product.images =
                images.map(
                    image => {

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

                    }
                );


            // =================================================
            // DEBUG
            // =================================================

            console.log(
                "========================================"
            );

            console.log(
                "PRODUCT DETAILS:"
            );

            console.log(
                JSON.stringify(
                    product,
                    null,
                    2
                )
            );

            console.log(
                "========================================"
            );


            // =================================================
            // RESPONSE
            // =================================================

            return res.status(200).json({

                success: true,

                product:
                    product

            });

        }

        catch (error) {

            console.error(
                "GET SINGLE PRODUCT ERROR:",
                error
            );

            return res.status(500).json({

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

module.exports = router;
