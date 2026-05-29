/**
 * Mock authentication middleware.
 *
 * Reads the Authorization header (expected: "Bearer mock-token-<userId>"),
 * looks up the user in mock data, and attaches the user object to req.user.
 *
 * For backward compatibility with the part-2 role middleware, it also sets
 * the x-user-role and x-user-id headers based on the resolved user, mapping
 * domain roles to the generic role names used by requireRole / allowSelfOr.
 *
 * On invalid/missing token: responds with 401 Unauthorized in the standard
 * error format.
 */

const userModel = require('../models/user.model');

// Maps the domain roles stored in users.json to the generic roles understood
// by the part 2 authorization middlewares.
const ROLE_MAP = {
    'admin': 'admin',
    'manager': 'manager'
    // Anything else (customer, barber, owner, ...) falls through to 'user'
};

const authMock = (req, res, next) => {
    const header = req.headers['authorization'];

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            data: null,
            error: {
                code: "UNAUTHORIZED",
                message: "Missing or malformed Authorization header.",
                details: {}
            }
        });
    }

    const token = header.slice(7); // strip "Bearer "
    const match = token.match(/^mock-token-(\d+)$/);

    if (!match) {
        return res.status(401).json({
            success: false,
            data: null,
            error: {
                code: "UNAUTHORIZED",
                message: "Invalid token format.",
                details: {}
            }
        });
    }

    const userId = parseInt(match[1]);
    const user = userModel.findById(userId);

    if (!user) {
        return res.status(401).json({
            success: false,
            data: null,
            error: {
                code: "UNAUTHORIZED",
                message: "Token references a non-existent user.",
                details: {}
            }
        });
    }

    // Attach the full user object for handlers to use
    req.user = user;

    // Populate the legacy headers so part-2 role middlewares keep working
    req.headers['x-user-role'] = ROLE_MAP[user.userRole] || 'user';
    req.headers['x-user-id'] = String(user.userId);

    next();
};

module.exports = authMock;