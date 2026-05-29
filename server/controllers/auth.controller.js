const userModel = require('../models/user.model');

// Response helpers (same shape used elsewhere in the project)
const sendError = (res, status, code, message, details = {}) => {
    return res.status(status).json({
        success: false,
        data: null,
        error: { code, message, details }
    });
};

const sendSuccess = (res, status, data) => {
    return res.status(status).json({
        success: true,
        data: data,
        error: null
    });
};

// Returns a user object suitable for sending to the client.
// Critically: does NOT include the password field.
const publicUser = (user) => ({
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    userRole: user.userRole
});

module.exports = {
    // POST /api/auth/login
    // Body: { email, password }
    // Verifies the password against the stored value.
    login: (req, res) => {
        const { email, password } = req.body;

        // Presence check
        if (!email || !password) {
            return sendError(res, 400, "VALIDATION_ERROR", "Email and password are required.", {
                required: ["email", "password"]
            });
        }

        // Email format check
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return sendError(res, 400, "VALIDATION_ERROR", "Invalid email format.", { field: "email" });
        }

        // Password length check (per assignment requirement)
        if (password.length < 6) {
            return sendError(res, 400, "VALIDATION_ERROR", "Password must be at least 6 characters.", { field: "password" });
        }

        // Look up the user by email
        const user = userModel.findByEmail(email);
        if (!user) {
            // Use a generic "invalid credentials" message - don't reveal whether the email exists
            return sendError(res, 401, "INVALID_CREDENTIALS", "Invalid email or password.");
        }

        // Verify password
        if (user.password !== password) {
            return sendError(res, 401, "INVALID_CREDENTIALS", "Invalid email or password.");
        }

        // Success - issue a mock token tied to the userId
        const token = `mock-token-${user.userId}`;

        return sendSuccess(res, 200, {
            token,
            user: publicUser(user)
        });
    },

    // POST /api/auth/logout
    // Stateless: the frontend clears its own token.
    logout: (req, res) => {
        return sendSuccess(res, 200, { message: "Logged out." });
    },

    // GET /api/users/me
    // Returns the currently authenticated user (set by authMock).
    me: (req, res) => {
        return sendSuccess(res, 200, publicUser(req.user));
    }
};