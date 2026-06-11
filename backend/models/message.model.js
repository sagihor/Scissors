/**
 * Message Model
 * -------------
 * Defines the "messages" table — stores chat messages so the live chat
 * history persists in MySQL and survives server restarts.
 *
 * Each message records who sent it (sender) and the text. Linked optionally
 * to a User via userId (sender's id) for a relational connection.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  messageId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // Display name of the sender (denormalized for quick rendering)
  sender: { type: DataTypes.STRING, allowNull: false },

  // The message text
  text: { type: DataTypes.STRING(500), allowNull: false },

  // Optional foreign key → the User who sent it (null for anonymous)
  userId: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'messages',
  timestamps: true,
  createdAt: 'createDate',
  updatedAt: 'updateDate',
});

module.exports = Message;