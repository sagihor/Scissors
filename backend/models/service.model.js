/**
 * Service Model
 * -------------
 * Defines the "services" table. A Service is something a barbershop offers,
 * such as "Classic Haircut" or "Beard Trim", with a price.
 *
 * Each service belongs to exactly one barbershop (barbershopId foreign key),
 * forming the "many" side of a one-to-many relationship.
 *
 * Assignment mapping: provides the required ONE-TO-MANY relationship
 * (Barbershop hasMany Service).
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Service = sequelize.define('Service', {
  // Primary key for the service
  serviceId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  name:  { type: DataTypes.STRING,  allowNull: false }, // e.g. "Skin Fade"
  price: { type: DataTypes.INTEGER, allowNull: false }, // price in shekels

  // Foreign key → the Barbershop that offers this service
  barbershopId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'services',
  timestamps: true,
  createdAt: 'createDate',
  updatedAt: 'updateDate',
});

module.exports = Service;