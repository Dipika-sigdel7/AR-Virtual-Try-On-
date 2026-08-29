// =========================================================
// AR E-COMMERCE
// PRODUCT REVIEW ROUTES
// =========================================================

const express = require("express");
const router = express.Router();

const path = require("path");
const fs = require("fs");
const multer = require("multer");

const pool = require("../config/db");


// =========================================================
// REVIEW UPLOAD DIRECTORY
// =========================================================

const uploadDirectory = path.join(
    __dirname,
    "../uploads/reviews"
);

if (!fs.existsSync(uploadDirectory)) {

    fs.mkdirSync(
        uploadDirectory,
        {
            recursive: true
        }
    );

}


// =========================================================
// MULTER STORAGE
// =========================================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(
            null,
            uploadDirectory
        );

    },

    filename: (req, file, cb) => {

        const extension =
            path.extname(
                file.originalname
            );

        const filename =
            `review-${Date.now()}-${Math.round(
                Math.random() * 1E9
            )}${extension}`;

        cb(
            null,
            filename
        );

    }

});


// =========================================================
// MULTER
// =========================================================

const upload = multer({

    storage,

    limits: {

        fileSize:
            5 * 1024 * 1024

    },

    fileFilter: (
        req,
        file,
        cb
    ) => {

        const allowed = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
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

    }

});


// =========================================================
// LOGIN MIDDLEWARE
// =========================================================

function requireLogin(
    req,
    res,
    next
) {

    if (
        !req.session ||
        !req.session.user
    ) {

        return res.status(401).json({

            success: false,

            message:
                "Please login to continue."

        });

    }

    next();

}


// =========================================================
// GET REVIEWS
//
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


            // =================================================
            // VALIDATE PRODUCT ID
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
            // GET REVIEWS
            //
            // IMPORTANT:
            // DATABASE COLUMN = comment
            // DATABASE COLUMN = image_url
            // =================================================

            const [rows] =
                await pool.execute(
                    `
                    SELECT

                        r.id,

                        r.product_id,

                        r.user_id,

                        r.rating,

                        r.comment,

                        r.image_url,

                        r.created_at,

                        COALESCE(
                            u.username,
                            'Customer'
                        ) AS username

                    FROM reviews r

                    LEFT JOIN users u
                        ON u.id = r.user_id

                    WHERE r.product_id = ?

                    ORDER BY r.created_at DESC
                    `,
                    [
                        productId
                    ]
                );


            // =================================================
            // CALCULATE AVERAGE
            // =================================================

            let averageRating = 0;

            if (rows.length > 0) {

                const total =
                    rows.reduce(
                        (
                            sum,
                            row
                        ) => {

                            return (
                                sum +
                                Number(
                                    row.rating || 0
                                )
                            );

                        },
                        0
                    );


                averageRating =
                    total /
                    rows.length;

            }


            // =================================================
            // FORMAT FOR FRONTEND
            // =================================================

            const reviews =
                rows.map(
                    row => {

                        return {

                            id:
                                row.id,

                            product_id:
                                row.product_id,

                            user_id:
                                row.user_id,

                            username:
                                row.username ||
                                "Customer",

                            rating:
                                Number(
                                    row.rating
                                ),

                            review_text:
                                row.comment ||
                                "",

                            image_url:
                                row.image_url
                                    ? `/uploads/reviews/${row.image_url}`
                                    : null,

                            created_at:
                                row.created_at

                        };

                    }
                );


            // =================================================
            // RESPONSE
            // =================================================

            return res.json({

                success: true,

                reviews:

                    reviews,

                averageRating:

                    Number(
                        averageRating.toFixed(1)
                    ),

                reviewCount:

                    reviews.length

            });

        }

        catch (error) {

            console.error(
                "GET REVIEWS ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to load reviews."

            });

        }

    }
);


// =========================================================
// ADD REVIEW
//
// POST /api/reviews/product/:productId
// =========================================================

router.post(
    "/product/:productId",
    requireLogin,
    upload.single("image"),

    async (
        req,
        res
    ) => {

        let uploadedImage = null;

        try {

            // =================================================
            // PRODUCT ID
            // =================================================

            const productId =
                Number(
                    req.params.productId
                );


            // =================================================
            // USER ID
            // =================================================

            const userId =
                Number(
                    req.session.user.id
                );


            // =================================================
            // RATING
            // =================================================

            const rating =
                Number(
                    req.body.rating
                );


            // =================================================
            // REVIEW TEXT
            //
            // Frontend sends review_text.
            // Database stores it in comment.
            // =================================================

            const review =
                String(
                    req.body.review_text ||
                    req.body.review ||
                    req.body.comment ||
                    ""
                ).trim();


            // =================================================
            // VALIDATE PRODUCT ID
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
            // VALIDATE USER
            // =================================================

            if (
                !Number.isInteger(userId) ||
                userId <= 0
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Please login again."

                });

            }


            // =================================================
            // VALIDATE RATING
            // =================================================

            if (
                !Number.isInteger(rating) ||
                rating < 1 ||
                rating > 5
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Rating must be between 1 and 5."

                });

            }


            // =================================================
            // VALIDATE COMMENT
            // =================================================

            if (!review) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Review cannot be empty."

                });

            }


            if (review.length > 1000) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Review is too long."

                });

            }


            // =================================================
            // CHECK PRODUCT
            // =================================================

            const [products] =
                await pool.execute(
                    `
                    SELECT id
                    FROM products
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [
                        productId
                    ]
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


            // =================================================
            // IMAGE
            // =================================================

            if (req.file) {

                uploadedImage =
                    req.file.filename;

            }


            // =================================================
            // INSERT REVIEW
            //
            // DATABASE:
            // comment
            // image_url
            // =================================================

            await pool.execute(
                `
                INSERT INTO reviews
                (
                    product_id,
                    user_id,
                    rating,
                    comment,
                    image_url
                )
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?
                )
                `,
                [
                    productId,
                    userId,
                    rating,
                    review,
                    uploadedImage
                ]
            );


            // =================================================
            // UPDATE PRODUCT RATING
            // =================================================

            await pool.execute(
                `
                UPDATE products
                SET rating = (
                    SELECT
                        COALESCE(
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


            // =================================================
            // SUCCESS
            // =================================================

            return res.status(201).json({

                success: true,

                message:
                    "Review submitted successfully."

            });

        }

        catch (error) {

            console.error(
                "POST REVIEW ERROR:",
                error
            );


            // =================================================
            // DELETE IMAGE IF DATABASE INSERT FAILED
            // =================================================

            if (uploadedImage) {

                const imagePath =
                    path.join(
                        uploadDirectory,
                        uploadedImage
                    );


                try {

                    if (
                        fs.existsSync(
                            imagePath
                        )
                    ) {

                        fs.unlinkSync(
                            imagePath
                        );

                    }

                }

                catch (deleteError) {

                    console.error(
                        "IMAGE DELETE ERROR:",
                        deleteError
                    );

                }

            }


            return res.status(500).json({

                success: false,

                message:
                    "Failed to submit review."

            });

        }

    }
);


// =========================================================
// MULTER ERROR HANDLER
// =========================================================

router.use(
    (
        error,
        req,
        res,
        next
    ) => {

        if (
            error instanceof
            multer.MulterError
        ) {

            if (
                error.code ===
                "LIMIT_FILE_SIZE"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Image must be smaller than 5 MB."

                });

            }

        }


        if (error) {

            return res.status(400).json({

                success: false,

                message:
                    error.message

            });

        }


        next();

    }
);


// =========================================================
// EXPORT
// =========================================================

module.exports =
    router;