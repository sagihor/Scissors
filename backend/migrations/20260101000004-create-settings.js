'use strict';

/**
 * Migration: create the "settings" table.
 * One settings row per user (userId unique, references users.userId).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('settings', {
      settingId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'users', key: 'userId' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      theme: { type: Sequelize.STRING, allowNull: false, defaultValue: 'light' },
      createDate: { type: Sequelize.DATE, allowNull: false },
      updateDate: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('settings');
  },
};