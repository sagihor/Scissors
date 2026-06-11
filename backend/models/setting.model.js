/**
 * Setting Model
 * -------------
 * Defines the "settings" table. Each row stores per-user preferences
 * (currently just the UI theme). One Setting belongs to exactly one User.
 *
 * This replaces the old JSON-file settings model so that user preferences
 * persist in MySQL like everything else.
 *
 * Assignment mapping: removes the last piece of mock data and adds a
 * one-to-one relationship (User hasOne Setting).
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Setting = sequelize.define('Setting', {
  // Primary key for the settings row
  settingId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  // Foreign key → the User these settings belong to (one row per user)
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },

  // UI theme preference: 'light' or 'dark'
  theme: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'light',
  },
}, {
  tableName: 'settings',
  timestamps: true,
  createdAt: 'createDate',
  updatedAt: 'updateDate',
});

module.exports = Setting;