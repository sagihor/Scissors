'use strict';

/**
 * Migration: create the "messages" table for persistent chat history.
 * userId optionally references users.userId (null allowed for anonymous).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('messages', {
      messageId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      sender: { type: Sequelize.STRING, allowNull: false },
      text:   { type: Sequelize.STRING(500), allowNull: false },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'userId' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // if the user is deleted, keep the message but null the link
      },
      createDate: { type: Sequelize.DATE, allowNull: false },
      updateDate: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('messages');
  },
};