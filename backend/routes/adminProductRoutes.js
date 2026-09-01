const express = require("express");
const router = express.Router();

const path = require("path");
const multer = require("multer");

const db = require("../config/db");
const adminAuth = require("../middleware/adminAuth");


// =====================================================
// MULTER CONFIGURATION
// =====================================================

const uploadDirectory = path.join(
    __dirname,
    "../uploads/products"
);


// =====================================================
// STORAGE
// =====================================================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, uploadDirectory);

    },

    filename: function (req, file, cb) {

        const extension =
            path.extname(file.originalname);

        const originalName =
            path
                .basename(
                    file.originalname,
                    extension
                )
                .replace(
                    /[^a-zA-Z0-9_-]/g,
                    "_"
                );

        const uniqueName =
            `${Date.now()}-${originalName}${extension}`;

        cb(
            null,
            uniqueName
        );

    }

});


// =====================================================
// FILE FILTER
// =====================================================

const fileFilter =
    function (req, file, cb) {

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ];


        if (
            allowedTypes.includes(
                file.mimetype
            )
        ) {

            cb(null, true);

        } else {

            cb(
                new Error(
                    "Only JPG, PNG, WEBP and GIF images are allowed."
                ),
                false
            );

        }

    };


// =====================================================
// UPLOAD
// =====================================================

const upload = multer({

    storage: storage,

    fileFilter: fileFilter,

    limits: {

        fileSize:
            5 * 1024 * 1024,

        files: 10

    }

});


// =====================================================
// ADD PRODUCT
// POST /api/admin/products
// =====================================================

router.post(
    "/",
    adminAuth,
    upload.array("images", 10),
    async (req, res) => {

        try {

            // =================================================
            // GET FORM DATA
            // =================================================

            const {
                name,
                description,
                price,
                category_id,
                stock
            } = req.body || {};


            // =================================================
            // VALIDATE NAME
            // =================================================

            if (
                !name ||
                typeof name !== "string" ||
                name.trim() === ""
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Product name is required"

                });

            }


            // =================================================
            // VALIDATE PRICE
            // =================================================

            if (
                price === undefined ||
                price === null ||
                price === "" ||
                !Number.isFinite(
                    Number(price)
                ) ||
                Number(price) <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Price must be greater than 0"

                });

            }


            // =================================================
            // VALIDATE CATEGORY
            // =================================================

            if (
                category_id === undefined ||
                category_id === null ||
                category_id === "" ||
                !Number.isInteger(
                    Number(category_id)
                ) ||
                Number(category_id) <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Valid category is required"

                });

            }


            // =================================================
            // CHECK CATEGORY
            // =================================================

            const [category] =
                await db.execute(
                    `
                    SELECT id
                    FROM categories
                    WHERE id = ?
                    `,
                    [
                        Number(category_id)
                    ]
                );


            if (
                category.length === 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Category does not exist"

                });

            }


            // =================================================
            // VALIDATE STOCK
            // =================================================

            const productStock =
                stock === undefined ||
                stock === null ||
                stock === ""
                    ? 0
                    : Number(stock);


            if (
                !Number.isInteger(
                    productStock
                ) ||
                productStock < 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Stock must be a non-negative integer"

                });

            }


            // =================================================
            // INSERT PRODUCT
            // =================================================

            const [result] =
                await db.execute(
                    `
                    INSERT INTO products
                    (
                        name,
                        description,
                        price,
                        category_id,
                        stock
                    )
                    VALUES (?, ?, ?, ?, ?)
                    `,
                    [

                        name.trim(),

                        description
                            ? String(
                                description
                              ).trim()
                            : null,

                        Number(price),

                        Number(category_id),

                        productStock

                    ]
                );


            // =================================================
            // PRODUCT ID
            // =================================================

            const productId =
                result.insertId;


            // =================================================
            // IMAGE INFORMATION
            // =================================================

            const uploadedImages =
                req.files || [];


            const imageList =
                uploadedImages.map(
                    function (file) {

                        return {

                            filename:
                                file.filename,

                            path:
                                `/uploads/products/${file.filename}`,

                            originalname:
                                file.originalname,

                            mimetype:
                                file.mimetype,

                            size:
                                file.size

                        };

                    }
                );


            // =================================================
            // SUCCESS
            // =================================================

            return res.status(201).json({

                success: true,

                message:
                    "Product added successfully",

                productId:
                    productId,

                images:
                    imageList

            });


        } catch (error) {

            console.error(
                "ADD PRODUCT ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Failed to add product"

            });

        }

    }
);


// =====================================================
// GET ALL PRODUCTS
// GET /api/admin/products
// =====================================================

router.get(
    "/",
    adminAuth,
    async (req, res) => {

        try {

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
                        p.category_id,
                        c.name AS category_name
                    FROM products p
                    INNER JOIN categories c
                        ON p.category_id = c.id
                    ORDER BY p.id DESC
                    `
                );


            return res.json({

                success: true,

                products:
                    products

            });


        } catch (error) {

            console.error(
                "GET ADMIN PRODUCTS ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Failed to load products"

            });

        }

    }
);


// =====================================================
// GET SINGLE PRODUCT
// GET /api/admin/products/:id
// =====================================================

router.get(
    "/:id",
    adminAuth,
    async (req, res) => {

        try {

            const productId =
                Number(req.params.id);


            if (
                !Number.isInteger(
                    productId
                ) ||
                productId <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid product ID"

                });

            }


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
                        p.category_id,
                        c.name AS category_name
                    FROM products p
                    INNER JOIN categories c
                        ON p.category_id = c.id
                    WHERE p.id = ?
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
                        "Product not found"

                });

            }


            return res.json({

                success: true,

                product:
                    products[0]

            });


        } catch (error) {

            console.error(
                "GET ADMIN PRODUCT ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Failed to load product"

            });

        }

    }
);


// =====================================================
// UPDATE PRODUCT
// PUT /api/admin/products/:id
// =====================================================

router.put(
    "/:id",
    adminAuth,
    async (req, res) => {

        try {

            const productId =
                Number(req.params.id);


            if (
                !Number.isInteger(
                    productId
                ) ||
                productId <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid product ID"

                });

            }


            const {
                name,
                description,
                price,
                category_id,
                stock,
                is_available
            } = req.body || {};


            if (
                !name ||
                typeof name !== "string" ||
                name.trim() === ""
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Product name is required"

                });

            }


            if (
                price === undefined ||
                price === null ||
                price === "" ||
                !Number.isFinite(
                    Number(price)
                ) ||
                Number(price) <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Price must be greater than 0"

                });

            }


            if (
                category_id === undefined ||
                category_id === null ||
                category_id === "" ||
                !Number.isInteger(
                    Number(category_id)
                ) ||
                Number(category_id) <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Valid category is required"

                });

            }


            const productStock =
                stock === undefined ||
                stock === null ||
                stock === ""
                    ? 0
                    : Number(stock);


            if (
                !Number.isInteger(
                    productStock
                ) ||
                productStock < 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Stock must be a non-negative integer"

                });

            }


            const [category] =
                await db.execute(
                    `
                    SELECT id
                    FROM categories
                    WHERE id = ?
                    `,
                    [
                        Number(category_id)
                    ]
                );


            if (
                category.length === 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Category does not exist"

                });

            }


            const [result] =
                await db.execute(
                    `
                    UPDATE products
                    SET
                        name = ?,
                        description = ?,
                        price = ?,
                        category_id = ?,
                        stock = ?,
                        is_available = ?
                    WHERE id = ?
                    `,
                    [

                        name.trim(),

                        description
                            ? String(
                                description
                              ).trim()
                            : null,

                        Number(price),

                        Number(category_id),

                        productStock,

                        is_available === undefined ||
                        is_available === null ||
                        is_available === ""
                            ? 1
                            : Number(
                                is_available
                              ),

                        productId

                    ]
                );


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Product not found"

                });

            }


            return res.json({

                success: true,

                message:
                    "Product updated successfully"

            });


        } catch (error) {

            console.error(
                "UPDATE PRODUCT ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Failed to update product"

            });

        }

    }
);


// =====================================================
// DELETE PRODUCT
// DELETE /api/admin/products/:id
// =====================================================

router.delete(
    "/:id",
    adminAuth,
    async (req, res) => {

        try {

            const productId =
                Number(req.params.id);


            if (
                !Number.isInteger(
                    productId
                ) ||
                productId <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid product ID"

                });

            }


            const [result] =
                await db.execute(
                    `
                    DELETE FROM products
                    WHERE id = ?
                    `,
                    [
                        productId
                    ]
                );


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Product not found"

                });

            }


            return res.json({

                success: true,

                message:
                    "Product deleted successfully"

            });


        } catch (error) {

            console.error(
                "DELETE PRODUCT ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Failed to delete product"

            });

        }

    }
);


// =====================================================
// MULTER ERROR HANDLER
// =====================================================

router.use(
    function (error, req, res, next) {

        if (
            error instanceof multer.MulterError
        ) {

            if (
                error.code ===
                "LIMIT_FILE_SIZE"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Each image must be smaller than 5 MB."

                });

            }


            if (
                error.code ===
                "LIMIT_FILE_COUNT"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "You can upload a maximum of 10 images."

                });

            }


            return res.status(400).json({

                success: false,

                message:
                    error.message

            });

        }


        if (error) {

            return res.status(400).json({

                success: false,

                message:
                    error.message ||
                    "File upload failed"

            });

        }


        next();

    }
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;