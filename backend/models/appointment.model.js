/**
 * Appointment Model
 * -----------------
 * Defines the "appointments" table. Each row is a single 1-hour bookable slot
 * for a barbershop.
 *   - userId === null  -> slot is FREE
 *   - userId set        -> slot is BOOKED by that user
 *
 * Powers the booking feature and the availability filter on the Dashboard.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  appointmentId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  // Start of the 1-hour slot
  startTime: { type: DataTypes.DATE, allowNull: false },

  // FK -> barbershop offering the slot
  barbershopId: { type: DataTypes.INTEGER, allowNull: false },

  // FK -> user who booked it (null = still available)
  userId: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'appointments',
  timestamps: true,
  createdAt: 'createDate',
  updatedAt: 'updateDate',
});

module.exports = Appointment;