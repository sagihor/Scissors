'use strict';

/**
 * Migration: create the "barbershop_barbers" junction table.
 * Implements the many-to-many relationship between users (barbers) and
 * barbershops. Created last because it references both tables.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('barbershop_barbers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      barbershopId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'barbershops', key: 'barbershopId' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'userId' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createDate: { type: Sequelize.DATE, allowNull: false },
      updateDate: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('barbershop_barbers');
  },
};