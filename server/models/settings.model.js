const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, 'settings.json');

// Load initial data into memory
let settings = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

// Default settings for users who don't have an entry yet
const DEFAULTS = {
    theme: 'light',
    language: 'en',
    notifications: true
};

module.exports = {
    // Returns the settings for a given user, or defaults if none exist
    getForUser: (userId) => {
        const key = String(userId);
        return settings[key] ? { ...settings[key] } : { ...DEFAULTS };
    },

    // Merges newSettings into the user's existing settings (or defaults).
    // Returns the resulting settings object.
    updateForUser: (userId, newSettings) => {
        const key = String(userId);
        const current = settings[key] || { ...DEFAULTS };

        settings[key] = {
            theme: newSettings.theme !== undefined ? newSettings.theme : current.theme,
            language: newSettings.language !== undefined ? newSettings.language : current.language,
            notifications: newSettings.notifications !== undefined ? newSettings.notifications : current.notifications
        };

        return { ...settings[key] };
    }
};