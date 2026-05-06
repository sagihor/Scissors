const db = require('./db');

module.exports = {
    findAll: async () => {
        const [rows] = await db.promise().query('SELECT * FROM barbershops');
        return rows;
    },
    
    findById: async (id) => {
        const [rows] = await db.promise().query('SELECT * FROM barbershops WHERE barbershopId = ?', [id]);
        return rows[0];
    },
    
    create: async (shopData) => {
        const now = new Date();
        const [result] = await db.promise().query(
            'INSERT INTO barbershops (name, address, phone, createDate, updateDate) VALUES (?, ?, ?, ?, ?)',
            [shopData.name, shopData.address, shopData.phone || "", now, now]
        );
        
        return {
            barbershopId: result.insertId,
            name: shopData.name,
            address: shopData.address,
            phone: shopData.phone || "",
            createDate: now,
            updateDate: now
        };
    },
    
    updateById: async (id, updateData) => {
        const now = new Date();
        const [result] = await db.promise().query(
            'UPDATE barbershops SET name = COALESCE(?, name), address = COALESCE(?, address), phone = COALESCE(?, phone), updateDate = ? WHERE barbershopId = ?',
            [updateData.name || null, updateData.address || null, updateData.phone || null, now, id]
        );
        
        if (result.affectedRows === 0) return null;
        
        const [updatedShop] = await db.promise().query('SELECT * FROM barbershops WHERE barbershopId = ?', [id]);
        return updatedShop[0];
    },
    
    deleteById: async (id) => {
        const [result] = await db.promise().query('DELETE FROM barbershops WHERE barbershopId = ?', [id]);
        return result.affectedRows > 0;
    }
};