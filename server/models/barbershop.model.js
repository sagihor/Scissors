const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, 'barbershops.json');

let barbershops = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

function persist() {
    fs.writeFileSync(DATA_PATH, JSON.stringify(barbershops, null, 2), 'utf8');
}

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
            rating: shopData.rating !== undefined ? shopData.rating : 0,
            reviewCount: shopData.reviewCount !== undefined ? shopData.reviewCount : 0,
            createDate: now,
            updateDate: now
        };

        barbershops.push(newShop);
        persist();
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
            rating: updateData.rating !== undefined ? updateData.rating : barbershops[index].rating,
            reviewCount: updateData.reviewCount !== undefined ? updateData.reviewCount : barbershops[index].reviewCount,
            updateDate: new Date().toISOString()
        };

        persist();
        return barbershops[index];
    },

    deleteById: (id) => {
        const initialLength = barbershops.length;
        barbershops = barbershops.filter(b => b.barbershopId !== parseInt(id));
        const changed = barbershops.length !== initialLength;
        if (changed) persist();
        return changed;
    }
};