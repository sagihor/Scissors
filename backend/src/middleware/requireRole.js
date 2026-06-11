/**
 * Middleware to enforce role-based access control.
 * Expects the client to send their role in the 'x-user-role' header.
 * Accepts one or more allowed roles, e.g. requireRole('admin') or requireRole('admin', 'manager').
 */
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        // Extract the user role from the request headers
        const userRole = req.headers['x-user-role'];

        // Check if the role is missing or not in the allowed list
        if (!userRole || !allowedRoles.includes(userRole)) {
            // Block the request and return a 403 Forbidden error
            return res.status(403).json({
                success: false,
                data: null,
                error: {
                    code: "FORBIDDEN",
                    message: "You do not have permission to perform this action.",
                    details: { providedRole: userRole || "none", allowedRoles }
                }
            });
        }

        // Role is allowed
        next();
    };
};

module.exports = requireRole;