'use strict';

/**
 * Migration: add a "city" column to the barbershops table.
 * Previously the city was buried inside the address string; a dedicated
 * column makes it queryable and lets the AI recommender filter by city.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('barbershops', 'city', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '', // existing rows get '' until backfilled by the seeder
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('barbershops', 'city');
  },
};