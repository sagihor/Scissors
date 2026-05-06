const db = require('./db');

module.exports = {
    // מחזיר את כל המשתמשים
    findAll: async () => {
        const [rows] = await db.promise().query('SELECT * FROM users');
        return rows;
    },
    
    // מוצא משתמש לפי ID
    findById: async (id) => {
        const [rows] = await db.promise().query('SELECT * FROM users WHERE userId = ?', [id]);
        return rows[0]; // יחזיר את המשתמש הראשון (או undefined אם לא נמצא)
    },
    
    // יוצר משתמש חדש
    create: async (userData) => {
        const now = new Date();
        const [result] = await db.promise().query(
            'INSERT INTO users (firstName, lastName, userRole, createDate, updateDate) VALUES (?, ?, ?, ?, ?)',
            [userData.firstName, userData.lastName, userData.userRole, now, now]
        );
        
        // MySQL נותן את ה-ID אוטומטית! אנחנו פשוט שולפים אותו בחזרה ומחזירים לקונטרולר
        return { 
            userId: result.insertId, 
            firstName: userData.firstName,
            lastName: userData.lastName,
            userRole: userData.userRole,
            createDate: now,
            updateDate: now
        };
    },
    
    // מעדכן משתמש
    updateById: async (id, updateData) => {
        const now = new Date();
        // פונקציית COALESCE ב-SQL שומרת על הערך הקיים אם הלקוח לא שלח לנו ערך חדש בבקשה
        const [result] = await db.promise().query(
            'UPDATE users SET firstName = COALESCE(?, firstName), lastName = COALESCE(?, lastName), userRole = COALESCE(?, userRole), updateDate = ? WHERE userId = ?',
            [updateData.firstName || null, updateData.lastName || null, updateData.userRole || null, now, id]
        );
        
        if (result.affectedRows === 0) return null; // אם לא עודכנה אף שורה, המשתמש כנראה לא קיים
        
        // שולפים את המשתמש המעודכן מהטבלה כדי להחזיר אותו בדיוק כמו שקובץ ה-JSON עשה
        const [updatedUser] = await db.promise().query('SELECT * FROM users WHERE userId = ?', [id]);
        return updatedUser[0];
    },
    
    // מוחק משתמש
    deleteById: async (id) => {
        const [result] = await db.promise().query('DELETE FROM users WHERE userId = ?', [id]);
        return result.affectedRows > 0; // מחזיר true אם באמת נמחקה שורה
    }
};