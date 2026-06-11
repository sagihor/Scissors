'use strict';

/**
 * Migration: remove the stored rating and reviewCount columns from barbershops.
 * Rating is now computed dynamically from the reviews table at read time,
 * so storing it caused confusing always-zero values in the table.
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('barbershops', 'rating');
    await queryInterface.removeColumn('barbershops', 'reviewCount');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('barbershops', 'rating', {
      type: Sequelize.FLOAT, allowNull: false, defaultValue: 0,
    });
    await queryInterface.addColumn('barbershops', 'reviewCount', {
      type: Sequelize.INTEGER, allowNull: false, defaultValue: 0,
    });
  },
};