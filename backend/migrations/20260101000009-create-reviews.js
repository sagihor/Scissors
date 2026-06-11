'use strict';

/**
 * Migration: create the "reviews" table.
 * Each review references a barbershop and the user who wrote it.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reviews', {
      reviewId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      rating:  { type: Sequelize.INTEGER, allowNull: false },
      comment: { type: Sequelize.STRING(500), allowNull: false },
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
    await queryInterface.dropTable('reviews');
  },
};