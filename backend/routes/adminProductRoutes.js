const express = require("express");
const router = express.Router();

const db = require("../config/db");
const adminAuth = require("../middleware/adminAuth");


// =====================================================
// ADD PRODUCT
// POST /api/admin/products
// =====================================================

router.post("/", adminAuth, async (req, res) => {

    try {

        const {
            name,
            description,
            price,
            category_id,
            stock
        } = req.body;


        // Validate name
        if (!name || name.trim() === "") {

            return res.status(400).json({
                success: false,
                message: "Product name is required"
            });

        }


        // Validate price
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


        // Validate category
        if (!category_id) {

            return res.status(400).json({
                success: false,
                message: "Category is required"
            });

        }


        // Check category
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


        // Validate stock
        const productStock =
            stock === undefined || stock === ""
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


        // Insert product
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
                description || null,
                Number(price),
                Number(category_id),
                productStock
            ]
        );


        res.status(201).json({
            success: true,
            message: "Product added successfully",
            productId: result.insertId
        });


    } catch (error) {

        console.error("ADD PRODUCT ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});


// =====================================================
// GET ALL PRODUCTS
// GET /api/admin/products
// =====================================================

router.get("/", adminAuth, async (req, res) => {

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


        res.json({
            success: true,
            products: products
        });


    } catch (error) {

        console.error("GET ADMIN PRODUCTS ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});


// =====================================================
// GET SINGLE PRODUCT
// GET /api/admin/products/:id
// =====================================================

router.get("/:id", adminAuth, async (req, res) => {

    try {

        const productId = Number(req.params.id);


        if (!Number.isInteger(productId) || productId <= 0) {

            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });

        }


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


        if (products.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });

        }


        res.json({
            success: true,
            product: products[0]
        });


    } catch (error) {

        console.error("GET ADMIN PRODUCT ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});


// =====================================================
// UPDATE PRODUCT
// PUT /api/admin/products/:id
// =====================================================

router.put("/:id", adminAuth, async (req, res) => {

    try {

        const productId = Number(req.params.id);

        if (!Number.isInteger(productId) || productId <= 0) {

            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });

        }


        const {
            name,
            description,
            price,
            category_id,
            stock,
            is_available
        } = req.body;


        if (!name || name.trim() === "") {

            return res.status(400).json({
                success: false,
                message: "Product name is required"
            });

        }


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


        if (!category_id) {

            return res.status(400).json({
                success: false,
                message: "Category is required"
            });

        }


        const productStock =
            stock === undefined || stock === ""
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
                description || null,
                Number(price),
                Number(category_id),
                productStock,
                is_available === undefined
                    ? 1
                    : Number(is_available),
                productId
            ]
        );


        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });

        }


        res.json({
            success: true,
            message: "Product updated successfully"
        });


    } catch (error) {

        console.error("UPDATE PRODUCT ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});


// =====================================================
// DELETE PRODUCT
// DELETE /api/admin/products/:id
// =====================================================

router.delete("/:id", adminAuth, async (req, res) => {

    try {

        const productId = Number(req.params.id);


        if (!Number.isInteger(productId) || productId <= 0) {

            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });

        }


        const [result] = await db.execute(
            `
            DELETE FROM products
            WHERE id = ?
            `,
            [productId]
        );


        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });

        }


        res.json({
            success: true,
            message: "Product deleted successfully"
        });


    } catch (error) {

        console.error("DELETE PRODUCT ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});


module.exports = router;