const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, 'barbershops.json');

let barbershops = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

module.exports = {
    findAll: () => barbershops,
    
    findById: (id) => barbershops.find(b => b.barbershopId === parseInt(id)),
    
    create: (shopData) => {
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
    
    updateById: (id, updateData) => {
        const index = barbershops.findIndex(b => b.barbershopId === parseInt(id));
        if (index === -1) return null;
        
        barbershops[index] = {
            ...barbershops[index],
            name: updateData.name || barbershops[index].name,
            address: updateData.address || barbershops[index].address,
            phone: updateData.phone || barbershops[index].phone,
            updateDate: new Date().toISOString()
        };
        
        return barbershops[index];
    },
    
    deleteById: (id) => {
        const initialLength = barbershops.length;
        barbershops = barbershops.filter(b => b.barbershopId !== parseInt(id));
        return barbershops.length !== initialLength;
    }
};