// =========================================================
// REVIEW ROUTES
// =========================================================

const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();


// =========================================================
// DATABASE
// =========================================================

const db =
    require("../config/db");


// =========================================================
// MULTER STORAGE
// =========================================================

const storage =
    multer.diskStorage({

        destination:
            function (
                req,
                file,
                cb
            ) {

                cb(
                    null,
                    path.join(
                        __dirname,
                        "../uploads/reviews"
                    )
                );

            },

        filename:
            function (
                req,
                file,
                cb
            ) {

                const extension =
                    path.extname(
                        file.originalname
                    );

                const filename =
                    `review-${Date.now()}-${Math.round(
                        Math.random() * 100000
                    )}${extension}`;

                cb(
                    null,
                    filename
                );

            }

    });


// =========================================================
// FILE FILTER
// =========================================================

const fileFilter =
    function (
        req,
        file,
        cb
    ) {

        const allowed =
            [
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/jpg"
            ];

        if (
            allowed.includes(
                file.mimetype
            )
        ) {

            cb(
                null,
                true
            );

        }

        else {

            cb(
                new Error(
                    "Only JPG, PNG and WEBP images are allowed."
                )
            );

        }

    };


// =========================================================
// UPLOAD
// =========================================================

const upload =
    multer({

        storage,

        fileFilter,

        limits: {

            fileSize:
                5 * 1024 * 1024

        }

    });


// =========================================================
// GET REVIEWS
// GET /api/reviews/product/:productId
// =========================================================

router.get(
    "/product/:productId",
    async (
        req,
        res
    ) => {

        try {

            const productId =
                Number(
                    req.params.productId
                );


            if (
                !productId ||
                productId <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid product ID."

                });

            }


            const [rows] =
                await db.query(
                    `
                    SELECT
                        r.id,
                        r.product_id,
                        r.user_id,
                        r.rating,
                        r.review_text,
                        r.image_url,
                        r.created_at,
                        u.username
                    FROM reviews r
                    INNER JOIN users u
                        ON r.user_id = u.id
                    WHERE r.product_id = ?
                    ORDER BY r.created_at DESC
                    `,
                    [productId]
                );


            res.json({

                success: true,

                reviews:
                    rows

            });

        }

        catch (error) {

            console.error(
                "GET REVIEWS ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to load reviews."

            });

        }

    }
);


// =========================================================
// ADD REVIEW
// POST /api/reviews
// =========================================================

router.post(
    "/",
    upload.single("image"),
    async (
        req,
        res
    ) => {

        try {

            // ---------------------------------------------
            // LOGIN CHECK
            // ---------------------------------------------

            if (
                !req.session ||
                !req.session.user
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Please login before writing a review."

                });

            }


            const userId =
                req.session.user.id;


            const productId =
                Number(
                    req.body.product_id
                );


            const rating =
                Number(
                    req.body.rating
                );


            const reviewText =
                (
                    req.body.review_text ||
                    ""
                ).trim();


            // ---------------------------------------------
            // VALIDATION
            // ---------------------------------------------

            if (
                !productId ||
                productId <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid product."

                });

            }


            if (
                rating < 1 ||
                rating > 5
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Rating must be between 1 and 5."

                });

            }


            if (
                !reviewText
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please write a review."

                });

            }


            // ---------------------------------------------
            // CHECK PRODUCT
            // ---------------------------------------------

            const [products] =
                await db.query(
                    `
                    SELECT id
                    FROM products
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [productId]
                );


            if (
                products.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Product not found."

                });

            }


            // ---------------------------------------------
            // CHECK EXISTING REVIEW
            // ---------------------------------------------

            const [existing] =
                await db.query(
                    `
                    SELECT id
                    FROM reviews
                    WHERE product_id = ?
                    AND user_id = ?
                    LIMIT 1
                    `,
                    [
                        productId,
                        userId
                    ]
                );


            if (
                existing.length > 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "You have already reviewed this product."

                });

            }


            // ---------------------------------------------
            // IMAGE
            // ---------------------------------------------

            let imageUrl = null;


            if (
                req.file
            ) {

                imageUrl =
                    `/uploads/reviews/${req.file.filename}`;

            }


            // ---------------------------------------------
            // INSERT REVIEW
            // ---------------------------------------------

            const [result] =
                await db.query(
                    `
                    INSERT INTO reviews
                    (
                        product_id,
                        user_id,
                        rating,
                        review_text,
                        image_url
                    )
                    VALUES (?, ?, ?, ?, ?)
                    `,
                    [
                        productId,
                        userId,
                        rating,
                        reviewText,
                        imageUrl
                    ]
                );


            // ---------------------------------------------
            // UPDATE PRODUCT RATING
            // ---------------------------------------------

            await db.query(
                `
                UPDATE products
                SET rating = (
                    SELECT COALESCE(
                        AVG(rating),
                        0
                    )
                    FROM reviews
                    WHERE product_id = ?
                )
                WHERE id = ?
                `,
                [
                    productId,
                    productId
                ]
            );


            res.status(201).json({

                success: true,

                message:
                    "Review submitted successfully.",

                reviewId:
                    result.insertId

            });

        }

        catch (error) {

            console.error(
                "ADD REVIEW ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to submit review."

            });

        }

    }
);


module.exports = router;