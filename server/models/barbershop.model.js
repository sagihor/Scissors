const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, 'barbershops.json');

// Load initial data into memory
let barbershops = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

module.exports = {
    // Returns all barbershops
    findAll: () => barbershops,
    
    // Finds a barbershop by its ID
    findById: (id) => barbershops.find(b => b.barbershopId === parseInt(id)),
    
    // Creates a new barbershop in memory
    create: (shopData) => {
        // Calculate the next available ID
        const nextId = barbershops.length > 0 ? Math.max(...barbershops.map(b => b.barbershopId)) + 1 : 1;
        const now = new Date().toISOString();
        
        const newShop = {
            barbershopId: nextId,
            name: shopData.name,
            address: shopData.address,
            phone: shopData.phone || "",
            createDate: now,
            updateDate: now
        };
        
        barbershops.push(newShop);
        return newShop;
    },
    
    // Updates a barbershop in memory
    updateById: (id, updateData) => {
        const index = barbershops.findIndex(b => b.barbershopId === parseInt(id));
        if (index === -1) return null; // Not found
        
        barbershops[index] = {
            ...barbershops[index], // Keep uneditable fields (like ID and createDate)
            name: updateData.name || barbershops[index].name,
            address: updateData.address || barbershops[index].address,
            phone: updateData.phone || barbershops[index].phone,
            updateDate: new Date().toISOString() // Refresh the update timestamp
        };
        
        return barbershops[index];
    },
    
    // Deletes a barbershop from memory
    deleteById: (id) => {
        const initialLength = barbershops.length;
        barbershops = barbershops.filter(b => b.barbershopId !== parseInt(id));
        
        // Return true if the length changed (meaning it was successfully deleted)
        return barbershops.length !== initialLength;
    }
};