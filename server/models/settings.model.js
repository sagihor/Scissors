const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, 'settings.json');

let settings = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

const DEFAULTS = {
    theme: 'light'
};

function persist() {
    fs.writeFileSync(DATA_PATH, JSON.stringify(settings, null, 2), 'utf8');
}

module.exports = {
    getForUser: (userId) => {
        const key = String(userId);
        return settings[key] ? { ...settings[key] } : { ...DEFAULTS };
    },

    updateForUser: (userId, newSettings) => {
        const key = String(userId);
        const current = settings[key] || { ...DEFAULTS };

        settings[key] = {
            theme: newSettings.theme !== undefined ? newSettings.theme : current.theme
        };

        persist();
        return { ...settings[key] };
    }
};