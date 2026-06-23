/**
 * Database configuration for the Sequelize CLI (migrations & seeders).
 * Reads the same .env values used by the app's runtime connection, and mirrors
 * the timezone settings in config/database.js so the CLI behaves identically.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const base = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  dialect: 'mysql',
  dialectOptions: {
    dateStrings: true,
    typeCast: true,
  },
  timezone: process.env.DB_TIMEZONE || '+03:00',
};

module.exports = {
  development: base,
  test: base,
  production: base,
};