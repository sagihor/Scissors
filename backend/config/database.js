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
    logging: false,

    // ---- Timezone-safe DATETIME handling ----
    // Appointment startTime is stored/compared as a plain wall-clock STRING
    // ("YYYY-MM-DD HH:00:00"); the model declares that field as STRING so
    // Sequelize never converts it to a JS Date. dateStrings:true makes mysql2
    // return any DATETIME column as a literal string on read, so there is no
    // UTC conversion in either direction.
    //
    // IMPORTANT: do NOT set a `timezone` option here. Forcing timezone:'+00:00'
    // makes Sequelize rewrite DATE values into UTC on write, which on an
    // Israel-time server turns a booked 09:00 into a stored 06:00. Leaving it
    // unset + STRING field + dateStrings is what keeps times exact.
    dialectOptions: {
      dateStrings: true,
      typeCast: true,
    },
  }
);

module.exports = sequelize;