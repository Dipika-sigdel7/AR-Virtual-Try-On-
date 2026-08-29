
// =========================================================
// AR E-COMMERCE
// PRODUCT ROUTES
// PRODUCTS + CATEGORIES + CHECKOUT
// =========================================================

const express = require("express");
const db = require("../config/db");

const router = express.Router();


// =========================================================
// GET ALL PRODUCTS
// GET /api/products
// =========================================================

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

                (
                    SELECT pi.image_url
                    FROM product_images pi
                    WHERE pi.product_id = p.id
                    ORDER BY pi.is_primary DESC, pi.id ASC
                    LIMIT 1
                ) AS image,

                p.is_available,
                p.created_at,

                c.id AS category_id,
                c.name AS category_name

            FROM products p

            LEFT JOIN categories c
                ON p.category_id = c.id

            WHERE p.is_available = 1

            ORDER BY p.created_at DESC
        `);


        // =====================================================
        // FORMAT IMAGE URL
        // =====================================================

        const formattedProducts = products.map(product => {

            let image = null;

            if (product.image) {

                if (
                    product.image.startsWith("/")
                ) {

                    image = product.image;

                } else {

                    image =
                        `/uploads/products/${product.image}`;

                }

            }


            return {

                id:
                    product.id,

                name:
                    product.name,

                description:
                    product.description || "",

                price:
                    Number(product.price || 0),

                stock:
                    Number(product.stock || 0),

                rating:
                    Number(product.rating || 0),

                image:
                    image,

                is_available:
                    Number(product.is_available),

                created_at:
                    product.created_at,

                category_id:
                    product.category_id,

                category_name:
                    product.category_name ||
                    "Uncategorized"

            };

        });


        console.log(
            "PRODUCTS SENT TO FRONTEND:",
            formattedProducts
        );


        return res.json({

            success: true,

            products:
                formattedProducts

        });

    }

    catch (error) {

        console.error(
            "GET PRODUCTS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

});


// =========================================================
// GET CATEGORIES
// GET /api/products/categories
// =========================================================

router.get("/categories", async (req, res) => {

    try {

        const [categories] =
            await db.execute(`
                SELECT
                    id,
                    name,
                    description
                FROM categories
                ORDER BY name ASC
            `);


        return res.json({

            success: true,

            categories:
                categories

        });

    }

    catch (error) {

        console.error(
            "GET CATEGORIES ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

});


// =========================================================
// GET SINGLE PRODUCT
// GET /api/products/:id
// =========================================================

router.get("/:id", async (req, res) => {

    try {

        const productId =
            Number(req.params.id);


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

                    (
                        SELECT pi.image_url
                        FROM product_images pi
                        WHERE pi.product_id = p.id
                        ORDER BY pi.is_primary DESC, pi.id ASC
                        LIMIT 1
                    ) AS image,

                    p.is_available,
                    p.created_at,

                    c.id AS category_id,
                    c.name AS category_name

                FROM products p

                LEFT JOIN categories c
                    ON p.category_id = c.id

                WHERE
                    p.id = ?
                    AND p.is_available = 1

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


        const product =
            products[0];


        // =====================================================
        // FORMAT IMAGE
        // =====================================================

        if (product.image) {

            product.image =
                product.image.startsWith("/")
                    ? product.image
                    : `/uploads/products/${product.image}`;

        }

        else {

            product.image = null;

        }


        product.price =
            Number(product.price || 0);

        product.stock =
            Number(product.stock || 0);

        product.rating =
            Number(product.rating || 0);


        return res.json({

            success: true,

            product:
                product

        });

    }

    catch (error) {

        console.error(
            "GET PRODUCT ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

});


// =========================================================
// CHECKOUT
// POST /api/products/checkout
// =========================================================

router.post("/checkout", async (req, res) => {

    const connection =
        await db.getConnection();


    try {

        const {
            user_id,
            shipping_address,
            items
        } = req.body;


        // =====================================================
        // VALIDATE USER
        // =====================================================

        if (!user_id) {

            return res.status(400).json({

                success: false,

                message:
                    "User ID is required."

            });

        }


        // =====================================================
        // VALIDATE ADDRESS
        // =====================================================

        if (
            !shipping_address ||
            !String(shipping_address).trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Shipping address is required."

            });

        }


        // =====================================================
        // VALIDATE ITEMS
        // =====================================================

        if (
            !Array.isArray(items) ||
            items.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Cart is empty."

            });

        }


        await connection.beginTransaction();


        let totalAmount = 0;

        const orderItems = [];


        // =====================================================
        // CHECK PRODUCTS
        // =====================================================

        for (const item of items) {

            const productId =
                Number(item.product_id);

            const quantity =
                Number(item.quantity);


            if (
                !Number.isInteger(productId) ||
                productId <= 0
            ) {

                throw new Error(
                    "Invalid product ID."
                );

            }


            if (
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {

                throw new Error(
                    "Invalid product quantity."
                );

            }


            const [products] =
                await connection.execute(
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


            if (
                products.length === 0
            ) {

                throw new Error(
                    `Product ${productId} not found.`
                );

            }


            const product =
                products[0];


            if (
                Number(product.is_available) !== 1
            ) {

                throw new Error(
                    `${product.name} is currently unavailable.`
                );

            }


            if (
                Number(product.stock) < quantity
            ) {

                throw new Error(
                    `Not enough stock for ${product.name}. Available stock: ${product.stock}.`
                );

            }


            const itemTotal =
                Number(product.price) *
                quantity;


            totalAmount +=
                itemTotal;


            orderItems.push({

                product_id:
                    product.id,

                quantity:
                    quantity,

                price:
                    product.price

            });

        }


        // =====================================================
        // CREATE ORDER
        // =====================================================

        const [orderResult] =
            await connection.execute(
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
                VALUES
                (
                    ?,
                    ?,
                    'pending',
                    ?,
                    'pending',
                    ?
                )
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


        // =====================================================
        // ORDER ITEMS
        // =====================================================

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
                VALUES
                (?, ?, ?, ?)
                `,
                [
                    orderId,
                    item.product_id,
                    item.quantity,
                    item.price
                ]
            );


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


        await connection.commit();


        return res.status(201).json({

            success: true,

            message:
                "Order placed successfully.",

            order_id:
                orderId,

            total_amount:
                totalAmount

        });

    }

    catch (error) {

        try {

            await connection.rollback();

        }

        catch (rollbackError) {

            console.error(
                "ROLLBACK ERROR:",
                rollbackError
            );

        }


        console.error(
            "CHECKOUT ERROR:",
            error
        );


        return res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

    finally {

        connection.release();

    }

});


// =========================================================
// EXPORT
// =========================================================

module.exports = router;
