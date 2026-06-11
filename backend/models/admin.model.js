/**
 * Admin Model
 * -----------
 * Defines the "admins" table. An Admin is a privileged profile that belongs
 * to exactly one User (linked by userId). It stores admin-only attributes
 * such as access level.
 *
 * Why a separate table: the assignment requires "Admin" as its own model,
 * distinct from "User". This gives a dedicated admins table while the User
 * table still keeps its userRole field.
 *
 * Assignment mapping: satisfies the required "Admin" model AND participates
 * in a one-to-one relationship with User.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Admin = sequelize.define('Admin', {
  // Primary key for the admin profile itself
  adminId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  // Foreign key → the User this admin profile belongs to.
  // unique: true enforces one admin profile per user (one-to-one).
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },

  // Admin-specific attribute: 'standard' or 'super'
  accessLevel: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'standard',
  },
}, {
  tableName: 'admins',
  timestamps: true,
  createdAt: 'createDate',
  updatedAt: 'updateDate',
});

module.exports = Admin;