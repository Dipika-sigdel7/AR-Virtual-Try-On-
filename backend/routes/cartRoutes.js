const express = require("express");

const router =
    express.Router();

const db =
    require("../config/db");


/* =========================================================
   AUTHENTICATION
========================================================= */

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
                "Please login first."

        });

    }

    next();

}


/* =========================================================
   GET CURRENT USER CART
========================================================= */

router.get(
    "/",
    requireLogin,
    async (req, res) => {

        try {

            const userId =
                req.session.user.id;


            const [rows] =
                await db.query(
                    `
                    SELECT

                        ci.id AS cart_item_id,

                        ci.product_id,

                        ci.quantity,

                        p.name,

                        p.description,

                        p.price,

                        p.stock,

                        p.rating,

                        p.is_available,

                        c.name AS category_name

                    FROM carts ct

                    INNER JOIN cart_items ci
                        ON ct.id = ci.cart_id

                    INNER JOIN products p
                        ON ci.product_id = p.id

                    LEFT JOIN categories c
                        ON p.category_id = c.id

                    WHERE ct.user_id = ?

                    ORDER BY ci.id DESC
                    `,
                    [userId]
                );


            return res.json({

                success: true,

                items: rows

            });

        }

        catch (error) {

            console.error(
                "Load cart error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to load cart."

            });

        }

    }
);


/* =========================================================
   ADD PRODUCT
========================================================= */

router.post(
    "/add",
    requireLogin,
    async (req, res) => {

        try {

            const userId =
                req.session.user.id;


            const productId =
                Number(
                    req.body.product_id
                );


            const quantity =
                Number(
                    req.body.quantity || 1
                );


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


            if (
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid quantity."

                });

            }


            /* -----------------------------------------
               CHECK PRODUCT
            ----------------------------------------- */

            const [products] =
                await db.query(
                    `
                    SELECT
                        id,
                        stock,
                        is_available
                    FROM products
                    WHERE id = ?
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


            if (
                !product.is_available
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Product is not available."

                });

            }


            /* -----------------------------------------
               FIND USER CART
            ----------------------------------------- */

            let [carts] =
                await db.query(
                    `
                    SELECT id
                    FROM carts
                    WHERE user_id = ?
                    LIMIT 1
                    `,
                    [userId]
                );


            /* -----------------------------------------
               CREATE CART IF NEEDED
            ----------------------------------------- */

            if (
                carts.length === 0
            ) {

                const [cartResult] =
                    await db.query(
                        `
                        INSERT INTO carts
                        (user_id)
                        VALUES (?)
                        `,
                        [userId]
                    );


                carts = [

                    {
                        id:
                            cartResult.insertId
                    }

                ];

            }


            const cartId =
                carts[0].id;


            /* -----------------------------------------
               CHECK EXISTING ITEM
            ----------------------------------------- */

            const [existingItems] =
                await db.query(
                    `
                    SELECT
                        id,
                        quantity
                    FROM cart_items
                    WHERE cart_id = ?
                    AND product_id = ?
                    LIMIT 1
                    `,
                    [
                        cartId,
                        productId
                    ]
                );


            /* -----------------------------------------
               UPDATE EXISTING ITEM
            ----------------------------------------- */

            if (
                existingItems.length > 0
            ) {

                const newQuantity =
                    Number(
                        existingItems[0].quantity
                    ) + quantity;


                if (
                    product.stock !== null &&
                    newQuantity >
                    Number(product.stock)
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Not enough stock available."

                    });

                }


                await db.query(
                    `
                    UPDATE cart_items

                    SET quantity = ?

                    WHERE id = ?
                    `,
                    [
                        newQuantity,
                        existingItems[0].id
                    ]
                );

            }

            /* -----------------------------------------
               ADD NEW ITEM
            ----------------------------------------- */

            else {

                if (
                    product.stock !== null &&
                    quantity >
                    Number(product.stock)
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Not enough stock available."

                    });

                }


                await db.query(
                    `
                    INSERT INTO cart_items
                    (
                        cart_id,
                        product_id,
                        quantity
                    )

                    VALUES (?, ?, ?)
                    `,
                    [
                        cartId,
                        productId,
                        quantity
                    ]
                );

            }


            return res.json({

                success: true,

                message:
                    "Product added to cart."

            });

        }

        catch (error) {

            console.error(
                "Add cart error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to add product."

            });

        }

    }
);


/* =========================================================
   REMOVE CART ITEM
========================================================= */

router.delete(
    "/:cartItemId",
    requireLogin,
    async (req, res) => {

        try {

            const userId =
                req.session.user.id;


            const cartItemId =
                Number(
                    req.params.cartItemId
                );


            if (
                !Number.isInteger(cartItemId) ||
                cartItemId <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid cart item."

                });

            }


            const [result] =
                await db.query(
                    `
                    DELETE ci

                    FROM cart_items ci

                    INNER JOIN carts ct
                        ON ci.cart_id = ct.id

                    WHERE ci.id = ?

                    AND ct.user_id = ?
                    `,
                    [
                        cartItemId,
                        userId
                    ]
                );


            return res.json({

                success: true,

                removed:
                    result.affectedRows > 0,

                message:
                    "Product removed."

            });

        }

        catch (error) {

            console.error(
                "Remove cart error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to remove product."

            });

        }

    }
);


/* =========================================================
   CLEAR CURRENT USER CART
========================================================= */

router.delete(
    "/",
    requireLogin,
    async (req, res) => {

        try {

            const userId =
                req.session.user.id;


            await db.query(
                `
                DELETE ci

                FROM cart_items ci

                INNER JOIN carts ct
                    ON ci.cart_id = ct.id

                WHERE ct.user_id = ?
                `,
                [userId]
            );


            return res.json({

                success: true,

                message:
                    "Cart cleared."

            });

        }

        catch (error) {

            console.error(
                "Clear cart error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to clear cart."

            });

        }

    }
);


module.exports = router;