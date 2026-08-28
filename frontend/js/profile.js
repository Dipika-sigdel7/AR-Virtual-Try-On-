/* =========================================================
   PROFILE PAGE
========================================================= */


/* =========================================================
   LOAD CURRENT USER
========================================================= */

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


        console.log(
            "PROFILE SESSION:",
            data
        );


        /* =================================================
           USER NOT LOGGED IN
        ================================================= */

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


        /* =================================================
           GET USER
        ================================================= */

        const user =
            data.user;


        /* =================================================
           DISPLAY USER NAME
        ================================================= */

        document.getElementById(
            "profile-name"
        ).textContent =
            user.name || "";


        /* =================================================
           DISPLAY USER EMAIL
        ================================================= */

        document.getElementById(
            "profile-email"
        ).textContent =
            user.email || "";


        /* =================================================
           DISPLAY USER ROLE
        ================================================= */

        document.getElementById(
            "profile-role"
        ).textContent =
            user.role || "User";

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


/* =========================================================
   CLOSE PROFILE
========================================================= */

const profileClose =
    document.getElementById(
        "profile-close"
    );


if (profileClose) {

    profileClose.addEventListener(
        "click",
        () => {

            /*
             * IMPORTANT:
             *
             * Do NOT call the logout API here.
             *
             * This only leaves the profile page.
             *
             * The Express session stays active.
             */

            window.location.href =
                "/";

        }
    );

}


/* =========================================================
   LOGOUT
========================================================= */

const logoutButton =
    document.getElementById(
        "logout-btn"
    );


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

                            credentials: "include"
                        }
                    );


                const data =
                    await response.json();


                /* =========================================
                   SUCCESSFUL LOGOUT
                ========================================= */

                if (
                    response.ok &&
                    data.success
                ) {

                    /*
                     * Remove frontend-only
                     * stored user information.
                     */

                    sessionStorage.removeItem(
                        "loggedInUser"
                    );


                    /*
                     * Go back to home
                     * after real logout.
                     */

                    window.location.href =
                        "/";

                    return;

                }


                /* =========================================
                   LOGOUT FAILED
                ========================================= */

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


/* =========================================================
   LOAD PROFILE WHEN PAGE OPENS
========================================================= */

loadProfile();