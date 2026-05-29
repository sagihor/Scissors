const settingsModel = require('../models/settings.model');

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
const VALID_LANGUAGES = ['en', 'he'];

module.exports = {
    // GET /api/settings
    // Returns the current user's settings (req.user set by authMock).
    get: (req, res) => {
        const settings = settingsModel.getForUser(req.user.userId);
        return sendSuccess(res, 200, settings);
    },

    // PUT /api/settings
    // Body may include any subset of: { theme, language, notifications }.
    // Validates each provided field; merges with existing settings.
    update: (req, res) => {
        const { theme, language, notifications } = req.body;

        if (theme !== undefined && !VALID_THEMES.includes(theme)) {
            return sendError(res, 400, "VALIDATION_ERROR", "Invalid theme.", {
                field: "theme",
                allowed: VALID_THEMES
            });
        }

        if (language !== undefined && !VALID_LANGUAGES.includes(language)) {
            return sendError(res, 400, "VALIDATION_ERROR", "Invalid language.", {
                field: "language",
                allowed: VALID_LANGUAGES
            });
        }

        if (notifications !== undefined && typeof notifications !== 'boolean') {
            return sendError(res, 400, "VALIDATION_ERROR", "notifications must be a boolean.", {
                field: "notifications"
            });
        }

        const updated = settingsModel.updateForUser(req.user.userId, {
            theme,
            language,
            notifications
        });

        return sendSuccess(res, 200, updated);
    }
};