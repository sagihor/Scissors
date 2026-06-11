'use strict';

/**
 * Migration: create the "users" table.
 * Root entity (customers, barbers, admins, managers). Created first because
 * other tables reference it via foreign keys.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      userId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      firstName: { type: Sequelize.STRING, allowNull: false },
      lastName:  { type: Sequelize.STRING, allowNull: false },
      username:  { type: Sequelize.STRING, allowNull: true, unique: true },
      userRole:  { type: Sequelize.STRING, allowNull: false },
      email:     { type: Sequelize.STRING, allowNull: true, unique: true },
      password:  { type: Sequelize.STRING, allowNull: true },
      createDate: { type: Sequelize.DATE, allowNull: false },
      updateDate: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};