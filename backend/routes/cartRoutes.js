
const express = require("express");

const router = express.Router();

const db = require("../config/db");


/* =========================================================
   AUTHENTICATION MIDDLEWARE
========================================================= */

function requireLogin(req, res, next) {

    if (!req.session.user) {

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


            const [rows] = await db.query(
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
   ADD PRODUCT TO CART
========================================================= */

router.post(
    "/add",
    requireLogin,
    async (req, res) => {

        try {

            const userId =
                req.session.user.id;

            const {
                product_id,
                quantity = 1
            } = req.body;


            if (!product_id) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Product ID is required."

                });

            }


            /*
             * Find the user's cart.
             */

            let [carts] = await db.query(
                `
                SELECT id
                FROM carts
                WHERE user_id = ?
                LIMIT 1
                `,
                [userId]
            );


            /*
             * If the cart doesn't exist,
             * create it.
             */

            if (carts.length === 0) {

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


            /*
             * Check whether this product
             * is already in this user's cart.
             */

            const [existingItems] =
                await db.query(
                    `
                    SELECT id, quantity
                    FROM cart_items
                    WHERE cart_id = ?
                    AND product_id = ?
                    LIMIT 1
                    `,
                    [
                        cartId,
                        product_id
                    ]
                );


            if (existingItems.length > 0) {

                await db.query(
                    `
                    UPDATE cart_items
                    SET quantity = quantity + ?
                    WHERE id = ?
                    `,
                    [
                        Number(quantity),
                        existingItems[0].id
                    ]
                );

            }

            else {

                await db.query(
                    `
                    INSERT INTO cart_items
                    (cart_id, product_id, quantity)
                    VALUES (?, ?, ?)
                    `,
                    [
                        cartId,
                        product_id,
                        Number(quantity)
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
   REMOVE PRODUCT
========================================================= */

router.delete(
    "/:cartItemId",
    requireLogin,
    async (req, res) => {

        try {

            const userId =
                req.session.user.id;

            const cartItemId =
                req.params.cartItemId;


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
   CLEAR CART
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
