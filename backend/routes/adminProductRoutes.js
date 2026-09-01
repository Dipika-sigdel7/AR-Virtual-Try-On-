// =========================================================
// AR E-COMMERCE
// ADMIN PRODUCT ROUTES
// PRODUCT + MULTIPLE IMAGE UPLOAD
// =========================================================

const express = require("express");
const router = express.Router();

const db = require("../config/db");
const adminAuth = require("../middleware/adminAuth");
const upload = require("../middleware/uploadProduct");


// =========================================================
// ADD PRODUCT
// POST /api/admin/products
// =========================================================

router.post(
    "/",
    adminAuth,
    upload.array("images", 10),
    async (req, res) => {

        try {

            console.log("=================================");
            console.log("ADD PRODUCT REQUEST");
            console.log("CONTENT TYPE:", req.headers["content-type"]);
            console.log("BODY:", req.body);
            console.log("FILES:", req.files);
            console.log("=================================");


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
                    message: "Product name is required"
                });

            }


            // =================================================
            // VALIDATE PRICE
            // =================================================

            if (
                price === undefined ||
                price === null ||
                price === "" ||
                !Number.isFinite(Number(price)) ||
                Number(price) <= 0
            ) {

                return res.status(400).json({
                    success: false,
                    message: "Price must be greater than 0"
                });

            }


            // =================================================
            // VALIDATE CATEGORY
            // =================================================

            if (
                category_id === undefined ||
                category_id === null ||
                category_id === "" ||
                !Number.isInteger(Number(category_id)) ||
                Number(category_id) <= 0
            ) {

                return res.status(400).json({
                    success: false,
                    message: "Valid category is required"
                });

            }


            // =================================================
            // CHECK CATEGORY EXISTS
            // =================================================

            const [category] = await db.execute(
                `
                SELECT id
                FROM categories
                WHERE id = ?
                `,
                [Number(category_id)]
            );


            if (category.length === 0) {

                return res.status(400).json({
                    success: false,
                    message: "Category does not exist"
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
                !Number.isInteger(productStock) ||
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

            const [result] = await db.execute(
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
                        ? String(description).trim()
                        : null,

                    Number(price),

                    Number(category_id),

                    productStock
                ]
            );


            const productId = result.insertId;


            // =================================================
            // UPLOADED IMAGES
            // =================================================

            const uploadedImages = req.files || [];


            const images = uploadedImages.map(
                function (file) {

                    return {
                        filename: file.filename,

                        url:
                            `/uploads/products/${file.filename}`,

                        originalName:
                            file.originalname,

                        mimeType:
                            file.mimetype,

                        size:
                            file.size
                    };

                }
            );


            console.log(
                "Product created:",
                productId
            );

            console.log(
                "Images uploaded:",
                images.length
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
                    images

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


// =========================================================
// GET ALL PRODUCTS
// GET /api/admin/products
// =========================================================

router.get(
    "/",
    adminAuth,
    async (req, res) => {

        try {

            const [products] = await db.execute(
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


// =========================================================
// GET SINGLE PRODUCT
// GET /api/admin/products/:id
// =========================================================

router.get(
    "/:id",
    adminAuth,
    async (req, res) => {

        try {

            const productId =
                Number(req.params.id);


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
                        "Invalid product ID"

                });

            }


            // =================================================
            // GET PRODUCT
            // =================================================

            const [products] = await db.execute(
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
                [productId]
            );


            // =================================================
            // NOT FOUND
            // =================================================

            if (products.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Product not found"

                });

            }


            // =================================================
            // SUCCESS
            // =================================================

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


// =========================================================
// UPDATE PRODUCT
// PUT /api/admin/products/:id
//
// IMPORTANT:
// admin.js also sends FormData when updating.
// Therefore upload.array() is required here too.
// =========================================================

router.put(
    "/:id",
    adminAuth,
    upload.array("images", 10),
    async (req, res) => {

        try {

            const productId =
                Number(req.params.id);


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
                        "Invalid product ID"

                });

            }


            // =================================================
            // GET FORM DATA
            // =================================================

            const {
                name,
                description,
                price,
                category_id,
                stock,
                is_available
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
                !Number.isFinite(Number(price)) ||
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
                !Number.isInteger(Number(category_id)) ||
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

            const [category] = await db.execute(
                `
                SELECT id
                FROM categories
                WHERE id = ?
                `,
                [Number(category_id)]
            );


            if (category.length === 0) {

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
                !Number.isInteger(productStock) ||
                productStock < 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Stock must be a non-negative integer"

                });

            }


            // =================================================
            // CHECK AVAILABILITY
            // =================================================

            const available =
                is_available === undefined ||
                is_available === null ||
                is_available === ""
                    ? 1
                    : Number(is_available);


            // =================================================
            // UPDATE PRODUCT
            // =================================================

            const [result] = await db.execute(
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
                        ? String(description).trim()
                        : null,

                    Number(price),

                    Number(category_id),

                    productStock,

                    available,

                    productId

                ]
            );


            // =================================================
            // PRODUCT NOT FOUND
            // =================================================

            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Product not found"

                });

            }


            // =================================================
            // NEW IMAGES
            // =================================================

            const uploadedImages =
                req.files || [];


            const images =
                uploadedImages.map(
                    function (file) {

                        return {

                            filename:
                                file.filename,

                            url:
                                `/uploads/products/${file.filename}`,

                            originalName:
                                file.originalname,

                            mimeType:
                                file.mimetype,

                            size:
                                file.size

                        };

                    }
                );


            // =================================================
            // SUCCESS
            // =================================================

            return res.json({

                success: true,

                message:
                    "Product updated successfully",

                productId:
                    productId,

                images:
                    images

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


// =========================================================
// DELETE PRODUCT
// DELETE /api/admin/products/:id
// =========================================================

router.delete(
    "/:id",
    adminAuth,
    async (req, res) => {

        try {

            const productId =
                Number(req.params.id);


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
                        "Invalid product ID"

                });

            }


            // =================================================
            // DELETE PRODUCT
            // =================================================

            const [result] = await db.execute(
                `
                DELETE FROM products
                WHERE id = ?
                `,
                [productId]
            );


            // =================================================
            // NOT FOUND
            // =================================================

            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Product not found"

                });

            }


            // =================================================
            // SUCCESS
            // =================================================

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


// =========================================================
// MULTER / UPLOAD ERROR HANDLER
// =========================================================

router.use(
    function (error, req, res, next) {

        console.error(
            "UPLOAD ERROR:",
            error
        );


        if (error) {

            return res.status(400).json({

                success: false,

                message:
                    error.message ||
                    "Image upload failed"

            });

        }


        next();

    }
);


// =========================================================
// EXPORT ROUTER
// =========================================================

module.exports = router;