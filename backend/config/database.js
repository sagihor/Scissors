const { Sequelize } = require('sequelize');
const path = require('path');

// Load .env from the backend root regardless of where node is launched from
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // set to console.log if you want to see SQL while debugging
  }
);

module.exports = sequelize;