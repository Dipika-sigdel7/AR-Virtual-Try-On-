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
            image,
            stock
        } = req.body;


        // Validate product name
        if (!name || name.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Product name is required"
            });
        }


        // Validate price
        if (price === undefined || price === null || Number(price) <= 0) {
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

        const [category] = await db.execute(
            `SELECT id FROM categories WHERE id = ?`,
            [category_id]
        );

        if (category.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Category does not exist"
            });
        }


        // Validate stock
        const productStock = stock === undefined
            ? 0
            : Number(stock);

        if (productStock < 0) {
            return res.status(400).json({
                success: false,
                message: "Stock cannot be negative"
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
                image,
                stock
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                name.trim(),
                description || null,
                Number(price),
                category_id,
                image || null,
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
            message: "Failed to add product"
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
                p.*,
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

        console.error("GET PRODUCTS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch products"
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

        if (!Number.isInteger(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const [products] = await db.execute(
            `
            SELECT
                p.*,
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

        console.error("GET PRODUCT ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch product"
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

        if (!Number.isInteger(productId)) {
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
            image,
            stock
        } = req.body;

        if (!name || name.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Product name is required"
            });
        }

        if (price === undefined || Number(price) <= 0) {
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

        if (Number(stock) < 0) {
            return res.status(400).json({
                success: false,
                message: "Stock cannot be negative"
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
                image = ?,
                stock = ?

            WHERE id = ?
            `,
            [
                name.trim(),
                description || null,
                Number(price),
                category_id,
                image || null,
                Number(stock),
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
            message: "Failed to update product"
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

        if (!Number.isInteger(productId)) {
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
            message: "Failed to delete product"
        });
    }

});


module.exports = router;
