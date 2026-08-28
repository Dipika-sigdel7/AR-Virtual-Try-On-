// =========================================================
// AR E-COMMERCE
// LOGIN PAGE
// LOGIN + PROFILE + SESSION
// =========================================================


// =========================================================
// ELEMENTS
// =========================================================

const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const togglePassword =
    document.getElementById("togglePassword");

const loginButton =
    document.getElementById("loginButton");

const loginMessage =
    document.getElementById("loginMessage");


// =========================================================
// SHOW MESSAGE
// =========================================================

function showMessage(message, success = false) {

    if (!loginMessage) {
        return;
    }

    loginMessage.textContent =
        message;

    loginMessage.className =
        success
            ? "login-message success"
            : "login-message error";
}


// =========================================================
// PASSWORD SHOW / HIDE
// =========================================================

if (togglePassword) {

    togglePassword.addEventListener(
        "click",
        () => {

            if (!passwordInput) {
                return;
            }

            if (
                passwordInput.type ===
                "password"
            ) {

                passwordInput.type =
                    "text";

                togglePassword.textContent =
                    "🙈";

                togglePassword.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            }

            else {

                passwordInput.type =
                    "password";

                togglePassword.textContent =
                    "👁";

                togglePassword.setAttribute(
                    "aria-label",
                    "Show password"
                );

            }

        }
    );

}


// =========================================================
// CHECK EXISTING LOGIN
// =========================================================

async function checkExistingLogin() {

    try {

        const response =
            await fetch(
                "/api/users/me",
                {
                    method: "GET",

                    credentials: "include",

                    cache: "no-store"
                }
            );


        const data =
            await response.json();


        console.log(
            "Current user:",
            data
        );


        if (
            response.ok &&
            data.success === true &&
            data.loggedIn === true &&
            data.user
        ) {

            /*
             * User is already logged in.
             *
             * Show profile directly.
             *
             * DO NOT redirect to home.
             */

            showProfile(
                data.user
            );

        }

    }

    catch (error) {

        console.error(
            "Could not check login:",
            error
        );

    }

}


// =========================================================
// SHOW PROFILE
// =========================================================

function showProfile(user) {

    const loginCard =
        document.querySelector(
            ".login-card"
        );


    if (!loginCard) {
        return;
    }


    const safeName =
        escapeHTML(
            user.name || "User"
        );


    const safeEmail =
        escapeHTML(
            user.email || ""
        );


    loginCard.innerHTML = `

        <div class="profile-section">

            <!-- PROFILE ICON -->

            <div class="profile-icon">

                👤

            </div>


            <!-- TITLE -->

            <h1>
                My Profile
            </h1>


            <p class="login-subtitle">
                You are currently logged in
            </p>


            <!-- PROFILE DETAILS -->

            <div class="profile-details">

                <div class="profile-detail">

                    <span class="profile-label">
                        Name
                    </span>

                    <span class="profile-value">
                        ${safeName}
                    </span>

                </div>


                <div class="profile-detail">

                    <span class="profile-label">
                        Email
                    </span>

                    <span class="profile-value">
                        ${safeEmail}
                    </span>

                </div>

            </div>


            <!-- LOGOUT -->

            <button
                type="button"
                id="logoutButton"
                class="logout-profile-button"
            >

                Logout

            </button>


            <!-- CONTINUE SHOPPING -->

            <a
                href="/"
                class="back-home"
            >

                ← Continue Shopping

            </a>

        </div>

    `;


    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            logoutUser
        );

    }

}


// =========================================================
// LOGIN
// =========================================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const email =
                emailInput.value.trim();


            const password =
                passwordInput.value;


            if (
                !email ||
                !password
            ) {

                showMessage(
                    "Please enter your email and password."
                );

                return;

            }


            loginButton.disabled =
                true;


            loginButton.textContent =
                "Logging in...";


            try {

                const response =
                    await fetch(
                        "/api/users/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            credentials:
                                "include",

                            body:
                                JSON.stringify({
                                    email,
                                    password
                                })
                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "Login response:",
                    data
                );


                if (
                    !response.ok ||
                    data.success !== true
                ) {

                    showMessage(
                        data.message ||
                        "Login failed."
                    );


                    loginButton.disabled =
                        false;


                    loginButton.textContent =
                        "Login";


                    return;

                }


                // =================================================
                // LOGIN SUCCESS
                // =================================================

                /*
                 * IMPORTANT:
                 *
                 * DO NOT DO:
                 *
                 * window.location.href = "/";
                 *
                 * Instead, show the profile here.
                 *
                 * The session is already stored
                 * by Express.
                 */

                showProfile(
                    data.user
                );

            }

            catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                showMessage(
                    "Unable to connect to the server."
                );


                loginButton.disabled =
                    false;


                loginButton.textContent =
                    "Login";

            }

        }
    );

}


// =========================================================
// LOGOUT
// =========================================================

async function logoutUser() {

    try {

        const response =
            await fetch(
                "/api/users/logout",
                {
                    method: "POST",

                    credentials: "include"
                }
            );


        const data =
            await response.json();


        if (
            response.ok &&
            data.success === true
        ) {

            /*
             * Logout ONLY happens here.
             *
             * Session is destroyed by server.
             */

            window.location.href =
                "/login";

            return;

        }


        alert(
            data.message ||
            "Logout failed."
        );

    }

    catch (error) {

        console.error(
            "Logout error:",
            error
        );


        alert(
            "Unable to logout."
        );

    }

}


// =========================================================
// HTML ESCAPE
// =========================================================

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}


// =========================================================
// START
// =========================================================

checkExistingLogin();