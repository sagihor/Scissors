/**
 * Middleware to enforce roles access control.
 * Expects the client to send their role in the 'x-user-role' header.
 */
const requireRole = (requiredRole) => {
    return (req, res, next) => {
        // Extract the user role from the request headers
        const userRole = req.headers['x-user-role'];

        // Check if the role is missing or doesn't match the required role
        if (!userRole || userRole !== requiredRole) {
            // Block the request and return a 403 Forbidden error
            return res.status(403).json({
                success: false,
                data: null,
                error: {
                    code: "FORBIDDEN",
                    message: "You do not have permission to perform this action.",
                    details: { providedRole: userRole || "none" }
                }
            });
        }
        
        // Role matches
        next();
    };
};

module.exports = requireRole;