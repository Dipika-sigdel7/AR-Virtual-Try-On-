function adminAuth(req, res, next) {

    const adminToken = req.headers["x-admin-token"];

    if (!adminToken) {
        return res.status(401).json({
            success: false,
            message: "Admin authentication required"
        });
    }

    if (adminToken !== process.env.ADMIN_TOKEN) {
        return res.status(403).json({
            success: false,
            message: "Invalid admin token"
        });
    }

    next();
}

module.exports = adminAuth;