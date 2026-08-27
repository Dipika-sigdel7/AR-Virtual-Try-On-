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

                togglePassword.textContent = "🙈";

                togglePassword.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            } else {

                passwordInput.type = "password";

                togglePassword.textContent = "👁";

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


            /* -------------------------
               BASIC VALIDATION
            ------------------------- */

            if (!email || !password) {

                loginMessage.textContent =
                    "Please enter your email and password.";

                return;

            }


            loginMessage.textContent = "";

            loginButton.disabled = true;

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

                            credentials: "include",

                            body: JSON.stringify({
                                email,
                                password
                            })
                        }
                    );


                const data =
                    await response.json();


                /* -------------------------
                   LOGIN FAILED
                ------------------------- */

                if (!response.ok || !data.success) {

                    loginMessage.textContent =
                        data.message ||
                        "Invalid email or password.";

                    loginButton.disabled = false;

                    loginButton.textContent =
                        "Login";

                    return;

                }


                /* -------------------------
                   LOGIN SUCCESS
                ------------------------- */

                loginMessage.textContent =
                    "Login successful!";


                /*
                 * Save the logged-in user's
                 * information locally only
                 * for frontend display.
                 *
                 * The real authentication
                 * remains in the server session.
                 */

                if (data.user) {

                    sessionStorage.setItem(
                        "loggedInUser",
                        JSON.stringify(data.user)
                    );

                }


                /* -------------------------
                   REDIRECT
                ------------------------- */

                const redirect =
                    sessionStorage.getItem(
                        "loginRedirect"
                    );


                sessionStorage.removeItem(
                    "loginRedirect"
                );


                setTimeout(() => {

                    window.location.href =
                        redirect || "/";

                }, 500);

            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                loginMessage.textContent =
                    "Unable to connect to server.";


                loginButton.disabled = false;

                loginButton.textContent =
                    "Login";

            }

        }
    );

}