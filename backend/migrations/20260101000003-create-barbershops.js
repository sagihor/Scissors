'use strict';

/**
 * Migration: create the "barbershops" table.
 * The main project resource. Referenced by services and the junction table.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('barbershops', {
      barbershopId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name:    { type: Sequelize.STRING, allowNull: false },
      address: { type: Sequelize.STRING, allowNull: false },
      phone:   { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
      rating:      { type: Sequelize.FLOAT,   allowNull: false, defaultValue: 0 },
      reviewCount: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      createDate: { type: Sequelize.DATE, allowNull: false },
      updateDate: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('barbershops');
  },
};