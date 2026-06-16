'use strict';

/**
 * Migration: add geo coordinates for the map feature.
 * - barbershops: latitude / longitude (real shop locations)
 * - users:       latitude / longitude / addressLabel (the user's location;
 *                a curated real address chosen in Settings, with a city default)
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('barbershops', 'latitude', {
      type: Sequelize.FLOAT, allowNull: true,
    });
    await queryInterface.addColumn('barbershops', 'longitude', {
      type: Sequelize.FLOAT, allowNull: true,
    });

    await queryInterface.addColumn('users', 'latitude', {
      type: Sequelize.FLOAT, allowNull: true,
    });
    await queryInterface.addColumn('users', 'longitude', {
      type: Sequelize.FLOAT, allowNull: true,
    });
    await queryInterface.addColumn('users', 'addressLabel', {
      type: Sequelize.STRING, allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('barbershops', 'latitude');
    await queryInterface.removeColumn('barbershops', 'longitude');
    await queryInterface.removeColumn('users', 'latitude');
    await queryInterface.removeColumn('users', 'longitude');
    await queryInterface.removeColumn('users', 'addressLabel');
  },
};