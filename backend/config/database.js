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

    // ---- Timezone handling ----
    // Two kinds of time values live in this DB:
    //
    // 1. Appointment startTime: a wall-clock time the user picked ("09:00").
    //    It is declared as a STRING model field (see appointment.model.js), so
    //    Sequelize passes it through verbatim and the `timezone` option below
    //    does NOT affect it. What the user books is exactly what is stored.
    //
    // 2. createDate / updateDate: audit timestamps Sequelize fills automatically.
    //    These ARE real DATE columns, so the `timezone` option controls the
    //    wall-clock they are written/read in. We set it to the app's local zone
    //    so the audit times match real local time instead of being UTC
    //    (which on an Israel server looked ~3 hours behind).
    //
    // DB_TIMEZONE defaults to '+03:00' (Israel summer / IDT). In winter Israel
    // is '+02:00' — set DB_TIMEZONE in your .env to override if needed.
    dialectOptions: {
      dateStrings: true,
      typeCast: true,
    },
    timezone: process.env.DB_TIMEZONE || '+03:00',
  }
);

module.exports = sequelize;