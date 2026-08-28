
// =========================================================
// PROFILE PAGE
// =========================================================


// =========================================================
// LOAD USER PROFILE
// =========================================================

async function loadProfile() {

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


        if (
            !response.ok ||
            data.success !== true ||
            data.loggedIn !== true ||
            !data.user
        ) {

            window.location.href =
                "/login";

            return;

        }


        const nameElement =
            document.getElementById(
                "profile-name"
            );


        const emailElement =
            document.getElementById(
                "profile-email"
            );


        if (nameElement) {

            nameElement.textContent =
                data.user.name ||
                "Not available";

        }


        if (emailElement) {

            emailElement.textContent =
                data.user.email ||
                "Not available";

        }

    }

    catch (error) {

        console.error(
            "Profile loading error:",
            error
        );


        window.location.href =
            "/login";

    }

}


// =========================================================
// CLOSE PROFILE
// =========================================================
// IMPORTANT:
// This ONLY goes back to Home.
// It does NOT logout.
// =========================================================

const closeProfile =
    document.getElementById(
        "close-profile"
    );


if (closeProfile) {

    closeProfile.addEventListener(
        "click",
        () => {

            window.location.href =
                "/";

        }
    );

}


// =========================================================
// LOGOUT
// =========================================================

const logoutButton =
    document.getElementById(
        "logout-button"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            logoutButton.disabled =
                true;


            logoutButton.innerHTML =
                `
                    <span class="logout-icon">
                        ↪
                    </span>

                    Logging out...
                `;


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

                    window.location.href =
                        "/";

                    return;

                }


                alert(
                    data.message ||
                    "Logout failed."
                );


                logoutButton.disabled =
                    false;


                logoutButton.innerHTML =
                    `
                        <span class="logout-icon">
                            ↪
                        </span>

                        Logout
                    `;

            }

            catch (error) {

                console.error(
                    "Logout error:",
                    error
                );


                alert(
                    "Unable to logout. Please try again."
                );


                logoutButton.disabled =
                    false;


                logoutButton.innerHTML =
                    `
                        <span class="logout-icon">
                            ↪
                        </span>

                        Logout
                    `;

            }

        }
    );

}


// =========================================================
// INITIALIZE
// =========================================================

loadProfile();
