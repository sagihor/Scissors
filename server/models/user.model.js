const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, 'users.json');

// Load initial data into memory
let users = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

module.exports = {
    // Returns all users
    findAll: () => users,
    
    // Finds a user by their ID
    findById: (id) => users.find(u => u.userId === parseInt(id)),
    
    // Creates a new user in memory
    create: (userData) => {
        const nextId = users.length > 0 ? Math.max(...users.map(u => u.userId)) + 1 : 1;
        const now = new Date().toISOString();
        
        const newUser = {
            userId: nextId,
            firstName: userData.firstName,
            lastName: userData.lastName,
            userRole: userData.userRole,
            createDate: now,
            updateDate: now
        };
        
        users.push(newUser);
        return newUser;
    },
    
    // Updates a user in memory
    updateById: (id, updateData) => {
        const index = users.findIndex(u => u.userId === parseInt(id));
        if (index === -1) return null; // Not found
        
        users[index] = {
            ...users[index],
            firstName: updateData.firstName || users[index].firstName,
            lastName: updateData.lastName || users[index].lastName,
            userRole: updateData.userRole || users[index].userRole,
            updateDate: new Date().toISOString()
        };
        
        return users[index];
    },
    
    // Deletes a user from memory
    deleteById: (id) => {
        const initialLength = users.length;
        users = users.filter(u => u.userId !== parseInt(id));
        
        // Return true if the length changed (meaning it was deleted)
        return users.length !== initialLength;
    }
};