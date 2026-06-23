/**
 * Appointment Model
 * -----------------
 * A row exists ONLY when a booking exists (one row = one user's booked slot).
 * Availability is computed in the controller (standard hours minus booked rows).
 *
 * TIMEZONE-SAFE startTime:
 * The DB column is DATETIME, but we declare the model field as STRING so
 * Sequelize passes the value straight through as "YYYY-MM-DD HH:00:00" with NO
 * JS Date conversion. MySQL stores it verbatim (DATETIME is zoneless), and with
 * dateStrings:true (config/database.js) it reads back as the same string.
 * Result: what you book == what's in the DB == what's displayed. No drift,
 * regardless of the server's timezone (local dev or UTC on Render).
 *
 * createDate / updateDate are managed automatically by Sequelize.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  appointmentId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  // Wall-clock slot start "YYYY-MM-DD HH:00:00", stored as a plain string.
  // (DB column remains DATETIME; STRING here just disables Sequelize's
  // timezone conversion so the value is never shifted.)
  startTime: { type: DataTypes.STRING, allowNull: false },

  // FK -> barbershop offering the slot
  barbershopId: { type: DataTypes.INTEGER, allowNull: false },

  // FK -> user who booked it
  userId: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'appointments',
  timestamps: true,
  createdAt: 'createDate',
  updatedAt: 'updateDate',
});

module.exports = Appointment;