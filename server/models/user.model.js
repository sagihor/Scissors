const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, 'users.json');

// Load initial data into memory
let users = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

// Helper: persist current state to disk
function persist() {
    fs.writeFileSync(DATA_PATH, JSON.stringify(users, null, 2), 'utf8');
}

module.exports = {
    findAll: () => users,
    findById: (id) => users.find(u => u.userId === parseInt(id)),
    findByEmail: (email) => users.find(u => u.email === email),

    create: (userData) => {
        const nextId = users.length > 0 ? Math.max(...users.map(u => u.userId)) + 1 : 1;
        const now = new Date().toISOString();

        const newUser = {
            userId: nextId,
            firstName: userData.firstName,
            lastName: userData.lastName,
            username: userData.username || null,
            userRole: userData.userRole,
            email: userData.email || null,
            password: userData.password || null,
            createDate: now,
            updateDate: now
        };

        users.push(newUser);
        persist();
        return newUser;
    },

    updateById: (id, updateData) => {
        const index = users.findIndex(u => u.userId === parseInt(id));
        if (index === -1) return null;

        users[index] = {
            ...users[index],
            firstName: updateData.firstName || users[index].firstName,
            lastName: updateData.lastName || users[index].lastName,
            username: updateData.username !== undefined ? updateData.username : users[index].username,
            userRole: updateData.userRole || users[index].userRole,
            email: updateData.email || users[index].email,
            password: updateData.password || users[index].password,
            updateDate: new Date().toISOString()
        };

        persist();
        return users[index];
    },

    deleteById: (id) => {
        const initialLength = users.length;
        users = users.filter(u => u.userId !== parseInt(id));
        const changed = users.length !== initialLength;
        if (changed) persist();
        return changed;
    }
};