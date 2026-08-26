const express = require("express");
const bcrypt = require("bcrypt");

const router = express.Router();

const db = require("../config/db");


/* =========================================================
   REGISTER
========================================================= */

router.post("/register", async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        /* -------------------------
           VALIDATION
        ------------------------- */

        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });

        }


        if (password.length < 6) {

            return res.status(400).json({
                success: false,
                message:
                    "Password must contain at least 6 characters."
            });

        }


        /* -------------------------
           CLEAN INPUT
        ------------------------- */

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();


        if (!cleanName || !cleanEmail) {

            return res.status(400).json({
                success: false,
                message:
                    "Name and email cannot be empty."
            });

        }


        /* -------------------------
           CHECK EXISTING USER
        ------------------------- */

        const [existingUsers] = await db.query(
            `
            SELECT id
            FROM users
            WHERE email = ?
            `,
            [cleanEmail]
        );


        if (existingUsers.length > 0) {

            return res.status(409).json({
                success: false,
                message:
                    "Email is already registered."
            });

        }


        /* -------------------------
           HASH PASSWORD
        ------------------------- */

        const passwordHash =
            await bcrypt.hash(password, 12);


        /* -------------------------
           CREATE USER
           
           IMPORTANT:
           Your database column is
           "password", not "password_hash".
        ------------------------- */

        const [result] = await db.query(
            `
            INSERT INTO users
            (name, email, password)
            VALUES (?, ?, ?)
            `,
            [
                cleanName,
                cleanEmail,
                passwordHash
            ]
        );


        /* -------------------------
           CREATE CART
        ------------------------- */

        await db.query(
            `
            INSERT INTO carts
            (user_id)
            VALUES (?)
            `,
            [result.insertId]
        );


        /* -------------------------
           RESPONSE
        ------------------------- */

        return res.status(201).json({

            success: true,

            message:
                "Registration successful."

        });


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error."

        });

    }

});


/* =========================================================
   LOGIN
========================================================= */

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        /* -------------------------
           VALIDATION
        ------------------------- */

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required."

            });

        }


        /* -------------------------
           CLEAN EMAIL
        ------------------------- */

        const cleanEmail =
            email.trim().toLowerCase();


        /* -------------------------
           FIND USER
           
           IMPORTANT:
           Select "password", not
           "password_hash".
        ------------------------- */

        const [users] = await db.query(

            `
            SELECT
                id,
                name,
                email,
                password,
                role
            FROM users
            WHERE email = ?
            `,

            [cleanEmail]

        );


        /* -------------------------
           USER NOT FOUND
        ------------------------- */

        if (users.length === 0) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        const user = users[0];


        /* -------------------------
           CHECK PASSWORD
        ------------------------- */

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        /* -------------------------
           CREATE SESSION
        ------------------------- */

        req.session.user = {

            id: user.id,

            name: user.name,

            email: user.email,

            role: user.role

        };


        /* -------------------------
           SAVE SESSION
        ------------------------- */

        req.session.save((error) => {

            if (error) {

                console.error(
                    "Session save error:",
                    error
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Login failed."

                });

            }


            /* -------------------------
               LOGIN RESPONSE
            ------------------------- */

            return res.json({

                success: true,

                message:
                    "Login successful.",

                user: {

                    id: user.id,

                    name: user.name,

                    email: user.email,

                    role: user.role

                }

            });

        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error."

        });

    }

});


/* =========================================================
   CHECK LOGIN STATUS
========================================================= */

router.get("/me", (req, res) => {

    if (!req.session.user) {

        return res.json({

            success: true,

            loggedIn: false

        });

    }


    return res.json({

        success: true,

        loggedIn: true,

        user: req.session.user

    });

});


/* =========================================================
   LOGOUT
========================================================= */

router.post("/logout", (req, res) => {

    req.session.destroy((error) => {

        if (error) {

            console.error(
                "Logout error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Logout failed."

            });

        }


        res.clearCookie("connect.sid");


        return res.json({

            success: true,

            message:
                "Logout successful."

        });

    });

});


module.exports = router;