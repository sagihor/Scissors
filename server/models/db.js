const mysql = require('mysql2');

// הגדרת פרטי ההתחברות למסד הנתונים
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // משתמש ברירת המחדל של MySQL
  password: '1234',
  database: 'mydb' // השם של מסד הנתונים שלנו
});

// ביצוע החיבור
db.connect(err => {
  if (err) {
    console.error('Connection failed:', err.message);
    return;
  }
  console.log('Connected to MySQL database successfully!');
});

module.exports = db;