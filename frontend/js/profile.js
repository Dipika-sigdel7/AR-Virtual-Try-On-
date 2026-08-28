// =========================================================
// PROFILE PAGE
// =========================================================


// =========================================================
// ELEMENTS
// =========================================================

const profileName =
    document.getElementById(
        "profile-name"
    );

const profileEmail =
    document.getElementById(
        "profile-email"
    );

const closeProfile =
    document.getElementById(
        "close-profile"
    );

const logoutButton =
    document.getElementById(
        "logout-button"
    );


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

                    credentials:
                        "include",

                    cache:
                        "no-store"
                }
            );


        const data =
            await response.json();


        console.log(
            "PROFILE USER:",
            data
        );


        /*
         * User is not logged in.
         */

        if (
            !response.ok ||
            !data.success ||
            !data.loggedIn ||
            !data.user
        ) {

            window.location.href =
                "/login";

            return;

        }


        /*
         * Display user information.
         */

        if (profileName) {

            profileName.textContent =
                data.user.name || "";

        }


        if (profileEmail) {

            profileEmail.textContent =
                data.user.email || "";

        }

    }

    catch (error) {

        console.error(
            "Unable to load profile:",
            error
        );


        window.location.href =
            "/login";

    }

}


// =========================================================
// CLOSE PROFILE
// =========================================================

if (closeProfile) {

    closeProfile.addEventListener(
        "click",
        () => {

            /*
             * IMPORTANT:
             *
             * This only closes/leaves
             * the profile page.
             *
             * It DOES NOT logout.
             */

            window.location.href =
                "/";

        }
    );

}


// =========================================================
// LOGOUT
// =========================================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            try {

                const response =
                    await fetch(
                        "/api/users/logout",
                        {
                            method: "POST",

                            credentials:
                                "include"
                        }
                    );


                const data =
                    await response.json();


                if (
                    response.ok &&
                    data.success
                ) {

                    /*
                     * Session is now destroyed.
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
    );

}


// =========================================================
// INITIALIZE
// =========================================================

loadProfile();