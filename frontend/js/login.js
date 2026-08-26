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

togglePassword.addEventListener(
    "click",
    () => {

        if (
            passwordInput.type === "password"
        ) {

            passwordInput.type = "text";

            togglePassword.textContent = "🙈";

        } else {

            passwordInput.type = "password";

            togglePassword.textContent = "👁";

        }

    }
);


/* =========================================================
   LOGIN
========================================================= */

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


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


            if (!data.success) {

                loginMessage.textContent =
                    data.message;

                loginButton.disabled = false;

                loginButton.textContent =
                    "Login";

                return;

            }


            /* -------------------------
               SUCCESS
            ------------------------- */

            loginMessage.textContent =
                "Login successful!";


            /*
             * Return to the page the user
             * originally wanted to use.
             */

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