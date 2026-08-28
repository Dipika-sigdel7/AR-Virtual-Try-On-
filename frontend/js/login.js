const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const loginButton =
    document.getElementById("loginButton");

const loginMessage =
    document.getElementById("loginMessage");

const togglePassword =
    document.getElementById("togglePassword");



/* =========================================================
   SHOW / HIDE PASSWORD
========================================================= */

if (
    togglePassword &&
    passwordInput
) {

    togglePassword.addEventListener(
        "click",
        () => {

            if (
                passwordInput.type === "password"
            ) {

                passwordInput.type = "text";

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



/* =========================================================
   LOGIN
========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;


            /* =================================================
               VALIDATION
            ================================================= */

            if (
                !email ||
                !password
            ) {

                loginMessage.textContent =
                    "Please enter your email and password.";

                return;

            }


            loginMessage.textContent =
                "";

            loginButton.disabled =
                true;

            loginButton.textContent =
                "Logging in...";


            try {

                /* =============================================
                   LOGIN REQUEST
                ============================================= */

                const response =
                    await fetch(
                        "/api/users/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            /*
                             * VERY IMPORTANT
                             * This allows the browser
                             * to store the session cookie.
                             */

                            credentials:
                                "include",

                            body:
                                JSON.stringify({

                                    email:
                                        email,

                                    password:
                                        password

                                })

                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "LOGIN RESPONSE:",
                    data
                );


                /* =============================================
                   LOGIN FAILED
                ============================================= */

                if (
                    !response.ok ||
                    !data.success
                ) {

                    loginMessage.textContent =
                        data.message ||
                        "Invalid email or password.";

                    loginButton.disabled =
                        false;

                    loginButton.textContent =
                        "Login";

                    return;

                }


                /* =============================================
                   LOGIN SUCCESS
                ============================================= */

                loginMessage.textContent =
                    "Login successful!";


                /*
                 * Save user information for
                 * frontend use only.
                 *
                 * Authentication itself is
                 * handled by the Express session.
                 */

                if (data.user) {

                    sessionStorage.setItem(
                        "loggedInUser",
                        JSON.stringify(
                            data.user
                        )
                    );

                }


                /* =============================================
                   VERIFY SESSION
                   
                   Make sure the Express session
                   was actually created before
                   opening the profile.
                ============================================= */

                const sessionResponse =
                    await fetch(
                        "/api/users/me",
                        {
                            method: "GET",

                            credentials:
                                "include",

                            cache:
                                "no-store"
                        }
                    );


                const sessionData =
                    await sessionResponse.json();


                console.log(
                    "SESSION AFTER LOGIN:",
                    sessionData
                );


                /* =============================================
                   SESSION VERIFIED
                ============================================= */

                if (
                    sessionResponse.ok &&
                    sessionData.success &&
                    sessionData.loggedIn &&
                    sessionData.user
                ) {

                    /*
                     * Update stored user information
                     * with the actual server session.
                     */

                    sessionStorage.setItem(
                        "loggedInUser",
                        JSON.stringify(
                            sessionData.user
                        )
                    );


                    /*
                     * IMPORTANT:
                     * Open the profile page.
                     */

                    window.location.href =
                        "/profile";

                    return;

                }


                /* =============================================
                   SESSION WAS NOT CREATED
                ============================================= */

                console.error(
                    "Login succeeded but session was not found.",
                    sessionData
                );


                loginMessage.textContent =
                    "Login succeeded, but the user session could not be created.";

                loginButton.disabled =
                    false;

                loginButton.textContent =
                    "Login";


            }

            catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                loginMessage.textContent =
                    "Unable to connect to server.";


                loginButton.disabled =
                    false;

                loginButton.textContent =
                    "Login";

            }

        }
    );

}