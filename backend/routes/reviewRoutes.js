// =========================================================
// AR ECOMMERCE
// PRODUCT REVIEW ROUTES
// =========================================================

const express = require("express");

const router =
    express.Router();

const path =
    require("path");

const fs =
    require("fs");

const multer =
    require("multer");

const pool =
    require("../config/db");


// =========================================================
// REVIEW UPLOAD DIRECTORY
// =========================================================

const uploadDirectory =
    path.join(
        __dirname,
        "../uploads/reviews"
    );


if (
    !fs.existsSync(
        uploadDirectory
    )
) {

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

const storage =
    multer.diskStorage({

        destination:
            (
                req,
                file,
                cb
            ) => {

                cb(
                    null,
                    uploadDirectory
                );

            },


        filename:
            (
                req,
                file,
                cb
            ) => {

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


const upload =
    multer({

        storage,

        limits: {

            fileSize:
                5 * 1024 * 1024

        },

        fileFilter:
            (
                req,
                file,
                cb
            ) => {

                const allowed =
                    [
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
// GET /api/products/:productId/reviews
// =========================================================

router.get(
    "/:productId/reviews",
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
                !Number.isInteger(
                    productId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid product ID."

                });

            }


            const [rows] =
                await pool.execute(
                    `
                    SELECT

                        r.id,

                        r.product_id,

                        r.user_id,

                        r.rating,

                        r.review,

                        r.image,

                        r.created_at,

                        u.username

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


            return res.json({

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
// POST /api/products/:productId/reviews
// =========================================================

router.post(
    "/:productId/reviews",
    requireLogin,
    upload.single("image"),

    async (
        req,
        res
    ) => {

        try {

            const productId =
                Number(
                    req.params.productId
                );


            const userId =
                Number(
                    req.session.user.id
                );


            const rating =
                Number(
                    req.body.rating
                );


            const review =
                String(
                    req.body.review || ""
                ).trim();


            // =================================================
            // VALIDATION
            // =================================================

            if (
                !Number.isInteger(
                    productId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid product ID."

                });

            }


            if (
                !Number.isInteger(
                    userId
                )
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Please login again."

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


            if (!review) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Review cannot be empty."

                });

            }


            if (
                review.length > 1000
            ) {

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

            let imageName =
                null;


            if (req.file) {

                imageName =
                    req.file.filename;

            }


            // =================================================
            // INSERT REVIEW
            // =================================================

            await pool.execute(
                `
                INSERT INTO reviews
                (
                    product_id,
                    user_id,
                    rating,
                    review,
                    image
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
                    imageName
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


module.exports =
    router;