const express = require("express");
const router = express.Router();

const db = require("../config/db");
const adminAuth = require("../middleware/adminAuth");
const upload = require("../middleware/uploadProduct");


// =====================================================
// ADD PRODUCT
// POST /api/admin/products
// =====================================================

router.post(
    "/",
    adminAuth,
    upload.single("image"),
    async (req, res) => {

        try {

            const {
                name,
                description,
                price,
                category_id,
                stock
            } = req.body;


            // -----------------------------------------
            // VALIDATE PRODUCT NAME
            // -----------------------------------------

            if (!name || name.trim() === "") {

                return res.status(400).json({
                    success: false,
                    message: "Product name is required"
                });

            }


            // -----------------------------------------
            // VALIDATE PRICE
            // -----------------------------------------

            if (
                price === undefined ||
                price === null ||
                Number(price) <= 0
            ) {

                return res.status(400).json({
                    success: false,
                    message: "Price must be greater than 0"
                });

            }


            // -----------------------------------------
            // VALIDATE CATEGORY
            // -----------------------------------------

            if (!category_id) {

                return res.status(400).json({
                    success: false,
                    message: "Category is required"
                });

            }


            const [category] = await db.execute(
                `
                SELECT id
                FROM categories
                WHERE id = ?
                `,
                [category_id]
            );


            if (category.length === 0) {

                return res.status(400).json({
                    success: false,
                    message: "Category does not exist"
                });

            }


            // -----------------------------------------
            // VALIDATE STOCK
            // -----------------------------------------

            const productStock =
                stock === undefined ||
                stock === ""
                    ? 0
                    : Number(stock);


            if (
                !Number.isInteger(productStock) ||
                productStock < 0
            ) {

                return res.status(400).json({
                    success: false,
                    message: "Stock must be a non-negative integer"
                });

            }


            // -----------------------------------------
            // IMAGE
            // -----------------------------------------

            const image = req.file
                ? `/uploads/products/${req.file.filename}`
                : null;


            // -----------------------------------------
            // INSERT PRODUCT
            // -----------------------------------------

            const [result] = await db.execute(
                `
                INSERT INTO products
                (
                    name,
                    description,
                    price,
                    category_id,
                    image,
                    stock
                )
                VALUES (?, ?, ?, ?, ?, ?)
                `,
                [
                    name.trim(),
                    description || null,
                    Number(price),
                    Number(category_id),
                    image,
                    productStock
                ]
            );


            // -----------------------------------------
            // RESPONSE
            // -----------------------------------------

            res.status(201).json({

                success: true,

                message: "Product added successfully",

                productId: result.insertId,

                image: image

            });


        } catch (error) {

            console.error(
                "ADD PRODUCT ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message: "Failed to add product"

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

            const [products] = await db.execute(
                `
                SELECT
                    p.id,
                    p.name,
                    p.description,
                    p.price,
                    p.image,
                    p.stock,
                    p.rating,
                    p.is_available,
                    p.created_at,
                    p.updated_at,
                    p.category_id,
                    c.name AS category_name

                FROM products p

                INNER JOIN categories c
                    ON p.category_id = c.id

                ORDER BY p.id DESC
                `
            );


            res.json({

                success: true,

                products: products

            });


        } catch (error) {

            console.error(
                "GET PRODUCTS ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message: "Failed to fetch products"

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


            // -----------------------------------------
            // VALIDATE ID
            // -----------------------------------------

            if (
                !Number.isInteger(productId) ||
                productId <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message: "Invalid product ID"

                });

            }


            // -----------------------------------------
            // GET PRODUCT
            // -----------------------------------------

            const [products] =
                await db.execute(
                    `
                    SELECT
                        p.id,
                        p.name,
                        p.description,
                        p.price,
                        p.image,
                        p.stock,
                        p.rating,
                        p.is_available,
                        p.created_at,
                        p.updated_at,
                        p.category_id,
                        c.name AS category_name

                    FROM products p

                    INNER JOIN categories c
                        ON p.category_id = c.id

                    WHERE p.id = ?
                    `,
                    [productId]
                );


            // -----------------------------------------
            // PRODUCT NOT FOUND
            // -----------------------------------------

            if (products.length === 0) {

                return res.status(404).json({

                    success: false,

                    message: "Product not found"

                });

            }


            // -----------------------------------------
            // RESPONSE
            // -----------------------------------------

            res.json({

                success: true,

                product: products[0]

            });


        } catch (error) {

            console.error(
                "GET PRODUCT ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message: "Failed to fetch product"

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
    upload.single("image"),
    async (req, res) => {

        try {

            const productId =
                Number(req.params.id);


            // -----------------------------------------
            // VALIDATE ID
            // -----------------------------------------

            if (
                !Number.isInteger(productId) ||
                productId <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message: "Invalid product ID"

                });

            }


            // -----------------------------------------
            // GET REQUEST DATA
            // -----------------------------------------

            const {
                name,
                description,
                price,
                category_id,
                stock
            } = req.body;


            // -----------------------------------------
            // VALIDATE NAME
            // -----------------------------------------

            if (
                !name ||
                name.trim() === ""
            ) {

                return res.status(400).json({

                    success: false,

                    message: "Product name is required"

                });

            }


            // -----------------------------------------
            // VALIDATE PRICE
            // -----------------------------------------

            if (
                price === undefined ||
                price === null ||
                Number(price) <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message: "Price must be greater than 0"

                });

            }


            // -----------------------------------------
            // VALIDATE CATEGORY
            // -----------------------------------------

            if (!category_id) {

                return res.status(400).json({

                    success: false,

                    message: "Category is required"

                });

            }


            const [category] =
                await db.execute(
                    `
                    SELECT id
                    FROM categories
                    WHERE id = ?
                    `,
                    [category_id]
                );


            if (category.length === 0) {

                return res.status(400).json({

                    success: false,

                    message: "Category does not exist"

                });

            }


            // -----------------------------------------
            // VALIDATE STOCK
            // -----------------------------------------

            const productStock =
                stock === undefined ||
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


            // -----------------------------------------
            // GET EXISTING PRODUCT
            // -----------------------------------------

            const [existingProducts] =
                await db.execute(
                    `
                    SELECT
                        id,
                        image
                    FROM products
                    WHERE id = ?
                    `,
                    [productId]
                );


            if (existingProducts.length === 0) {

                return res.status(404).json({

                    success: false,

                    message: "Product not found"

                });

            }


            // -----------------------------------------
            // KEEP OLD IMAGE IF NO NEW IMAGE
            // -----------------------------------------

            let image =
                existingProducts[0].image;


            if (req.file) {

                image =
                    `/uploads/products/${req.file.filename}`;

            }


            // -----------------------------------------
            // UPDATE PRODUCT
            // -----------------------------------------

            const [result] =
                await db.execute(
                    `
                    UPDATE products

                    SET
                        name = ?,
                        description = ?,
                        price = ?,
                        category_id = ?,
                        image = ?,
                        stock = ?

                    WHERE id = ?
                    `,
                    [
                        name.trim(),
                        description || null,
                        Number(price),
                        Number(category_id),
                        image,
                        productStock,
                        productId
                    ]
                );


            // -----------------------------------------
            // CHECK UPDATE
            // -----------------------------------------

            if (result.affectedRows === 0) {

                return res.status(404).json({

                    success: false,

                    message: "Product not found"

                });

            }


            // -----------------------------------------
            // RESPONSE
            // -----------------------------------------

            res.json({

                success: true,

                message:
                    "Product updated successfully",

                image: image

            });


        } catch (error) {

            console.error(
                "UPDATE PRODUCT ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message:
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


            // -----------------------------------------
            // VALIDATE ID
            // -----------------------------------------

            if (
                !Number.isInteger(productId) ||
                productId <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message: "Invalid product ID"

                });

            }


            // -----------------------------------------
            // DELETE PRODUCT
            // -----------------------------------------

            const [result] =
                await db.execute(
                    `
                    DELETE FROM products
                    WHERE id = ?
                    `,
                    [productId]
                );


            // -----------------------------------------
            // CHECK DELETE
            // -----------------------------------------

            if (result.affectedRows === 0) {

                return res.status(404).json({

                    success: false,

                    message: "Product not found"

                });

            }


            // -----------------------------------------
            // RESPONSE
            // -----------------------------------------

            res.json({

                success: true,

                message:
                    "Product deleted successfully"

            });


        } catch (error) {

            console.error(
                "DELETE PRODUCT ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Failed to delete product"

            });

        }

    }
);


module.exports = router;