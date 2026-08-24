const express = require("express");
const db = require("../config/db");

const router = express.Router();


// =====================================================
// GET ALL PRODUCTS
// GET /api/products
// =====================================================

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
            WHERE p.is_available = 1
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
            message: error.message
        });

    }

});


// =====================================================
// GET CATEGORIES
// GET /api/products/categories
// =====================================================

router.get("/categories", async (req, res) => {

    try {

        const [categories] = await db.execute(`
            SELECT
                id,
                name,
                description
            FROM categories
            ORDER BY name ASC
        `);

        res.json({
            success: true,
            categories: categories
        });

    } catch (error) {

        console.error("GET CATEGORIES ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});


// =====================================================
// GET SINGLE PRODUCT
// GET /api/products/:id
// =====================================================

router.get("/:id", async (req, res) => {

    try {

        const productId = Number(req.params.id);

        if (!Number.isInteger(productId)) {

            return res.status(400).json({
                success: false,
                message: "Invalid product ID."
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
                c.id AS category_id,
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

// =====================================================
// CHECKOUT
// POST /api/products/checkout
// =====================================================

router.post("/checkout", async (req, res) => {

    const connection = await db.getConnection();

    try {

        const {
            user_id,
            shipping_address,
            items
        } = req.body;


        // =============================================
        // VALIDATE REQUEST
        // =============================================

        if (!user_id) {

            return res.status(400).json({
                success: false,
                message: "User ID is required."
            });

        }


        if (!shipping_address) {

            return res.status(400).json({
                success: false,
                message: "Shipping address is required."
            });

        }


        if (!Array.isArray(items) || items.length === 0) {

            return res.status(400).json({
                success: false,
                message: "Cart is empty."
            });

        }


        // =============================================
        // START TRANSACTION
        // =============================================

        await connection.beginTransaction();


        let totalAmount = 0;

        const orderItems = [];


        // =============================================
        // CHECK EVERY PRODUCT
        // =============================================

        for (const item of items) {

            const productId = Number(item.product_id);
            const quantity = Number(item.quantity);


            // -----------------------------------------
            // Validate product ID
            // -----------------------------------------

            if (!Number.isInteger(productId)) {

                throw new Error(
                    "Invalid product ID."
                );

            }


            // -----------------------------------------
            // Validate quantity
            // -----------------------------------------

            if (
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {

                throw new Error(
                    "Invalid product quantity."
                );

            }


            // -----------------------------------------
            // Get product
            // FOR UPDATE locks the row
            // -----------------------------------------

            const [products] = await connection.execute(
                `
                SELECT
                    id,
                    name,
                    price,
                    stock,
                    is_available
                FROM products
                WHERE id = ?
                FOR UPDATE
                `,
                [productId]
            );


            // -----------------------------------------
            // Product doesn't exist
            // -----------------------------------------

            if (products.length === 0) {

                throw new Error(
                    `Product ${productId} not found.`
                );

            }


            const product = products[0];


            // -----------------------------------------
            // Product unavailable
            // -----------------------------------------

            if (product.is_available !== 1) {

                throw new Error(
                    `${product.name} is currently unavailable.`
                );

            }


            // -----------------------------------------
            // CHECK STOCK
            // -----------------------------------------

            if (product.stock < quantity) {

                throw new Error(
                    `Not enough stock for ${product.name}. Available stock: ${product.stock}.`
                );

            }


            // -----------------------------------------
            // CALCULATE ITEM TOTAL
            // -----------------------------------------

            const itemTotal =
                Number(product.price) * quantity;


            totalAmount += itemTotal;


            // -----------------------------------------
            // Store order item information
            // -----------------------------------------

            orderItems.push({
                product_id: product.id,
                quantity: quantity,
                price: product.price
            });

        }


        // =============================================
        // CREATE ORDER
        // =============================================

        const [orderResult] = await connection.execute(
            `
            INSERT INTO orders
            (
                user_id,
                total_amount,
                status,
                payment_method,
                payment_status,
                shipping_address
            )
            VALUES (?, ?, 'pending', ?, 'pending', ?)
            `,
            [
                user_id,
                totalAmount,
                "Cash on Delivery",
                shipping_address
            ]
        );


        const orderId =
            orderResult.insertId;


        // =============================================
        // CREATE ORDER ITEMS
        // =============================================

        for (const item of orderItems) {

            await connection.execute(
                `
                INSERT INTO order_items
                (
                    order_id,
                    product_id,
                    quantity,
                    price
                )
                VALUES (?, ?, ?, ?)
                `,
                [
                    orderId,
                    item.product_id,
                    item.quantity,
                    item.price
                ]
            );


            // =========================================
            // REDUCE PRODUCT STOCK
            // =========================================

            await connection.execute(
                `
                UPDATE products
                SET stock = stock - ?
                WHERE id = ?
                `,
                [
                    item.quantity,
                    item.product_id
                ]
            );

        }


        // =============================================
        // COMMIT TRANSACTION
        // =============================================

        await connection.commit();


        // =============================================
        // SUCCESS RESPONSE
        // =============================================

        res.status(201).json({

            success: true,

            message:
                "Order placed successfully.",

            order_id:
                orderId,

            total_amount:
                totalAmount

        });


    } catch (error) {

        // =============================================
        // ROLLBACK
        // =============================================

        await connection.rollback();


        console.error(
            "CHECKOUT ERROR:",
            error
        );


        res.status(400).json({

            success: false,

            message:
                error.message

        });


    } finally {

        // =============================================
        // RELEASE CONNECTION
        // =============================================

        connection.release();

    }

});


module.exports = router;