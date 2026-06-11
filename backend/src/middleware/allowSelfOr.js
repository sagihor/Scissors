/**
 * Middleware that grants access if EITHER:
 *   (a) the requester's role is in the allowed list, OR
 *   (b) the requester is a regular 'user' editing their own record
 *       (x-user-id header matches the :id route param).
 *
 * Used for routes like PUT /users/:id where admins/managers can update anyone,
 * but a regular user may only update themselves.
 *
 * Headers expected:
 *   - x-user-role: 'admin' | 'manager' | 'user'
 *   - x-user-id:   numeric id of the requester (required when role is 'user')
 */
const allowSelfOr = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.headers['x-user-role'];
        const userId = req.headers['x-user-id'];
        const paramId = req.params.id;

        // (a) Role-based access
        if (userRole && allowedRoles.includes(userRole)) {
            return next();
        }

        // (b) Self-access for regular users
        if (userRole === 'user' && userId && paramId && String(userId) === String(paramId)) {
            return next();
        }

        // Otherwise: deny
        return res.status(403).json({
            success: false,
            data: null,
            error: {
                code: "FORBIDDEN",
                message: "You do not have permission to perform this action.",
                details: {
                    providedRole: userRole || "none",
                    allowedRoles,
                    note: "Regular users may only modify their own record (x-user-id must match :id)."
                }
            }
        });
    };
};

module.exports = allowSelfOr;