// =========================================================
// AR E-COMMERCE
// LOGIN PAGE
// USER LOGIN + SESSION
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

            if (passwordInput.type === "password") {

                passwordInput.type =
                    "text";

                togglePassword.textContent =
                    "🙈";

                togglePassword.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            } else {

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
            "Current session:",
            data
        );


        /*
         * If user is already logged in,
         * don't show the login form again.
         *
         * Go directly to profile.
         */

        if (
            response.ok &&
            data.success === true &&
            data.loggedIn === true &&
            data.user
        ) {

            window.location.href =
                "/profile";

        }

    }

    catch (error) {

        console.error(
            "Session check error:",
            error
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


            if (!email || !password) {

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
                // LOGIN SUCCESSFUL
                // =================================================

                showMessage(
                    "Login successful. Opening your profile...",
                    true
                );


                /*
                 * Save optional return page.
                 *
                 * We still want the profile
                 * to appear first.
                 */

                const redirectPage =
                    sessionStorage.getItem(
                        "loginRedirect"
                    );


                sessionStorage.removeItem(
                    "loginRedirect"
                );


                /*
                 * ALWAYS SHOW PROFILE FIRST
                 */

                window.location.href =
                    "/profile";

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
// START
// =========================================================

checkExistingLogin();