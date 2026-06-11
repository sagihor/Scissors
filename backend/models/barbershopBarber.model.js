/**
 * BarbershopBarber Model (Junction Table)
 * ---------------------------------------
 * Defines the "barbershop_barbers" join table. Each row links one barber
 * (a User whose role is 'barber') to one barbershop they work at.
 *
 * Because a barber can work at several shops, and a shop employs several
 * barbers, this table implements a MANY-TO-MANY relationship between Users
 * and Barbershops.
 *
 * Assignment mapping: satisfies BOTH the required "Junction Table" model
 * AND the required MANY-TO-MANY relationship.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BarbershopBarber = sequelize.define('BarbershopBarber', {
  // Surrogate primary key for each link row
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  // Foreign key → Barbershop
  barbershopId: { type: DataTypes.INTEGER, allowNull: false },

  // Foreign key → User (a barber)
  userId: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'barbershop_barbers',
  timestamps: true,
  createdAt: 'createDate',
  updatedAt: 'updateDate',
});

module.exports = BarbershopBarber;