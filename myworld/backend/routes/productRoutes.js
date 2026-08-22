const express = require("express");
const db = require("../config/db");

const router = express.Router();


/* =========================================
   GET ALL PRODUCTS
   USER
========================================= */

router.get("/", async (req, res) => {

    try {

        const [products] = await db.execute(`
            SELECT
                p.id,
                p.name,
                p.description,
                p.price,
                p.stock,
                p.rating,
                p.is_available,
                p.created_at,
                c.id AS category_id,
                c.name AS category_name
            FROM products p
            INNER JOIN categories c
                ON p.category_id = c.id
            WHERE p.is_available = TRUE
            ORDER BY p.created_at DESC
        `);

        res.json({
            success: true,
            products: products
        });

    } catch (error) {

        console.error("GET PRODUCTS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load products."
        });

    }

});


/* =========================================
   GET CATEGORIES
   ADMIN PRODUCT FORM
========================================= */

router.get("/categories", async (req, res) => {

    try {

        const [categories] = await db.execute(`
            SELECT
                id,
                name,
                description
            FROM categories
            ORDER BY name
        `);

        res.json({
            success: true,
            categories: categories
        });

    } catch (error) {

        console.error("GET CATEGORIES ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load categories."
        });

    }

});


/* =========================================
   GET SINGLE PRODUCT
========================================= */

router.get("/:id", async (req, res) => {

    try {

        const { id } = req.params;

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
                c.id AS category_id,
                c.name AS category_name
            FROM products p
            INNER JOIN categories c
                ON p.category_id = c.id
            WHERE p.id = ?
            `,
            [id]
        );

        if (products.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Product not found."
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
            message: error.message
        });

    }

});


module.exports = router;
