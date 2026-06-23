/**
 * Database configuration for the Sequelize CLI (migrations & seeders).
 * Reads the same .env values used by the app's runtime connection.
 *
 * dateStrings mirrors config/database.js. We deliberately do NOT set a
 * `timezone` option (see the note in config/database.js).
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
};

module.exports = {
  development: base,
  test: base,
  production: base,
};