'use strict';

/**
 * Migration: create the "admins" table.
 * One-to-one with users (userId is unique and references users.userId).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('admins', {
      adminId: {
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
      accessLevel: { type: Sequelize.STRING, allowNull: false, defaultValue: 'standard' },
      createDate: { type: Sequelize.DATE, allowNull: false },
      updateDate: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('admins');
  },
};