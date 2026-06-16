/**
 * User Model
 * ----------
 * Defines the "users" table using the Sequelize ORM.
 * A User is any person in the system: customer, barber, admin, or manager
 * (distinguished by the `userRole` field).
 *
 * This replaces the old JSON-file-based mock model. Data now lives in MySQL
 * and persists across server restarts.
 *
 * Assignment mapping: satisfies the required "User" model.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // shared MySQL connection

const User = sequelize.define('User', {
  // Primary key — auto-incrementing integer ID for each user
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  firstName: { type: DataTypes.STRING, allowNull: false }, // required
  lastName:  { type: DataTypes.STRING, allowNull: false }, // required

  // Optional public handle; must be unique across all users when present
  username:  { type: DataTypes.STRING, allowNull: true, unique: true },

  // Role drives authorization: customer | barber | admin | manager
  userRole:  { type: DataTypes.STRING, allowNull: false },

  // Login email; unique so two accounts can't share one
  email:     { type: DataTypes.STRING, allowNull: true, unique: true },

  // Stored password (plain for this assignment, as in the original mock)
  password:  { type: DataTypes.STRING, allowNull: true },

  // User location (a curated real address chosen in Settings, or a city default)
  latitude:     { type: DataTypes.FLOAT,  allowNull: true },
  longitude:    { type: DataTypes.FLOAT,  allowNull: true },
  addressLabel: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'users', // exact MySQL table name

  // Auto-managed timestamp columns. Sequelize fills these on create/update.
  // We rename its defaults (createdAt/updatedAt) to the names the rest of the
  // app already uses (createDate/updateDate) so the frontend keeps working.
  timestamps: true,
  createdAt: 'createDate', // set automatically when a row is first created
  updatedAt: 'updateDate', // refreshed automatically on every update
});

module.exports = User;