const settingsModel = require('../models/settings.model');
const userModel = require('../models/user.model');

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

const VALID_THEMES = ['light', 'dark'];

module.exports = {
    get: (req, res) => {
        const user = req.user;
        const prefs = settingsModel.getForUser(user.userId);
        return sendSuccess(res, 200, {
            username: user.username,
            email: user.email,
            theme: prefs.theme
        });
    },

    update: (req, res) => {
        const { username, email, theme } = req.body;

        // Format validation
        if (username !== undefined) {
            if (typeof username !== 'string' || username.trim().length === 0) {
                return sendError(res, 400, "VALIDATION_ERROR", "Username cannot be empty.", { field: "username" });
            }
        }

        if (email !== undefined) {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return sendError(res, 400, "VALIDATION_ERROR", "Invalid email format.", { field: "email" });
            }
        }

        if (theme !== undefined && !VALID_THEMES.includes(theme)) {
            return sendError(res, 400, "VALIDATION_ERROR", "Invalid theme.", {
                field: "theme",
                allowed: VALID_THEMES
            });
        }

        // Uniqueness checks (username and email must be unique per user)
        const userUpdates = {};
        if (username !== undefined) userUpdates.username = username.trim();
        if (email !== undefined) userUpdates.email = email;

        if (Object.keys(userUpdates).length > 0) {
            const existingUser = req.user;
            const allUsers = userModel.findAll();

            if (userUpdates.username !== undefined && userUpdates.username !== existingUser.username) {
                const conflict = allUsers.find(u =>
                    u.username === userUpdates.username && u.userId !== existingUser.userId
                );
                if (conflict) {
                    return sendError(res, 409, "CONFLICT", "Username is already taken.", { field: "username" });
                }
            }

            if (userUpdates.email !== undefined && userUpdates.email !== existingUser.email) {
                const conflict = allUsers.find(u =>
                    u.email === userUpdates.email && u.userId !== existingUser.userId
                );
                if (conflict) {
                    return sendError(res, 409, "CONFLICT", "Email is already taken.", { field: "email" });
                }
            }

            userModel.updateById(existingUser.userId, {
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,
                username: userUpdates.username !== undefined ? userUpdates.username : existingUser.username,
                userRole: existingUser.userRole,
                email: userUpdates.email || existingUser.email
            });
        }

        if (theme !== undefined) {
            settingsModel.updateForUser(req.user.userId, { theme });
        }

        // Return the resulting state
        const refreshedUser = userModel.findById(req.user.userId);
        const refreshedPrefs = settingsModel.getForUser(req.user.userId);

        return sendSuccess(res, 200, {
            username: refreshedUser.username,
            email: refreshedUser.email,
            theme: refreshedPrefs.theme
        });
    }
};