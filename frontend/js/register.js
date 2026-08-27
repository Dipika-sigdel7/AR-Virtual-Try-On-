
/* =========================================================
   REGISTER PAGE
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const registerForm =
    document.getElementById("registerForm");

const nameInput =
    document.getElementById("name");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const confirmPasswordInput =
    document.getElementById("confirmPassword");

const togglePassword =
    document.getElementById("togglePassword");

const toggleConfirmPassword =
    document.getElementById("toggleConfirmPassword");

const registerButton =
    document.getElementById("registerButton");

const registerMessage =
    document.getElementById("registerMessage");


/* =========================================================
   SHOW / HIDE PASSWORD
========================================================= */

togglePassword.addEventListener("click", () => {

    if (passwordInput.type === "password") {

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

});


/* =========================================================
   SHOW / HIDE CONFIRM PASSWORD
========================================================= */

toggleConfirmPassword.addEventListener(
    "click",
    () => {

        if (
            confirmPasswordInput.type ===
            "password"
        ) {

            confirmPasswordInput.type =
                "text";

            toggleConfirmPassword.textContent =
                "🙈";

            toggleConfirmPassword.setAttribute(
                "aria-label",
                "Hide password"
            );

        } else {

            confirmPasswordInput.type =
                "password";

            toggleConfirmPassword.textContent =
                "👁";

            toggleConfirmPassword.setAttribute(
                "aria-label",
                "Show password"
            );

        }

    }
);


/* =========================================================
   REGISTER
========================================================= */

registerForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        /* -------------------------
           GET VALUES
        ------------------------- */

        const name =
            nameInput.value.trim();

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;

        const confirmPassword =
            confirmPasswordInput.value;


        /* -------------------------
           CLEAR MESSAGE
        ------------------------- */

        registerMessage.textContent = "";

        registerMessage.style.color =
            "";


        /* -------------------------
           VALIDATION
        ------------------------- */

        if (
            !name ||
            !email ||
            !password ||
            !confirmPassword
        ) {

            showMessage(
                "Please fill in all fields.",
                "error"
            );

            return;

        }


        /* -------------------------
           PASSWORD LENGTH
        ------------------------- */

        if (password.length < 6) {

            showMessage(
                "Password must contain at least 6 characters.",
                "error"
            );

            return;

        }


        /* -------------------------
           CONFIRM PASSWORD
        ------------------------- */

        if (
            password !==
            confirmPassword
        ) {

            showMessage(
                "Passwords do not match.",
                "error"
            );

            return;

        }


        /* -------------------------
           BUTTON LOADING
        ------------------------- */

        registerButton.disabled = true;

        registerButton.textContent =
            "Creating Account...";


        try {

            /* -------------------------
               SEND TO BACKEND
            ------------------------- */

            const response =
                await fetch(
                    "/api/users/register",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            name: name,

                            email: email,

                            password: password

                        })

                    }
                );


            const data =
                await response.json();


            /* -------------------------
               ERROR
            ------------------------- */

            if (!response.ok) {

                showMessage(
                    data.message ||
                    "Registration failed.",
                    "error"
                );

                return;

            }


            /* -------------------------
               SUCCESS
            ------------------------- */

            showMessage(
                "Account created successfully! Redirecting to login...",
                "success"
            );


            registerForm.reset();


            /* -------------------------
               REDIRECT
            ------------------------- */

            setTimeout(() => {

                window.location.href =
                    "/login";

            }, 1500);


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );

            showMessage(
                "Unable to connect to the server.",
                "error"
            );

        } finally {

            registerButton.disabled =
                false;

            registerButton.textContent =
                "Create Account";

        }

    }
);


/* =========================================================
   MESSAGE FUNCTION
========================================================= */

function showMessage(
    message,
    type
) {

    registerMessage.textContent =
        message;


    if (type === "success") {

        registerMessage.style.color =
            "#4ade80";

    } else {

        registerMessage.style.color =
            "#f87171";

    }

}
