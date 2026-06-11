/**
 * Barbershop Model
 * ----------------
 * Defines the "barbershops" table. A Barbershop is the main resource of the
 * application — the entity the whole product is built around.
 *
 * Rating/reviewCount are NOT stored here — they are computed dynamically from
 * the reviews table at read time (see barbershop.controller.js).
 *
 * Assignment mapping: satisfies the required "Main project resource" model.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Barbershop = sequelize.define('Barbershop', {
  // Primary key — unique ID for each barbershop
  barbershopId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  name:    { type: DataTypes.STRING, allowNull: false }, // shop name (required)
  address: { type: DataTypes.STRING, allowNull: false }, // street address (required)
  city:    { type: DataTypes.STRING, allowNull: false }, // city (used by AI recommender)
  phone:   { type: DataTypes.STRING, allowNull: true, defaultValue: '' },

}, {
  tableName: 'barbershops',
  timestamps: true,
  createdAt: 'createDate',
  updatedAt: 'updateDate',
});

module.exports = Barbershop;