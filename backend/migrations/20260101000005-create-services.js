'use strict';

/**
 * Migration: create the "services" table.
 * Many-side of the one-to-many relationship: each service belongs to one
 * barbershop (barbershopId references barbershops.barbershopId).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('services', {
      serviceId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name:  { type: Sequelize.STRING,  allowNull: false },
      price: { type: Sequelize.INTEGER, allowNull: false },
      barbershopId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'barbershops', key: 'barbershopId' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createDate: { type: Sequelize.DATE, allowNull: false },
      updateDate: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('services');
  },
};