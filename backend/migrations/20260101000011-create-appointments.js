'use strict';

/**
 * Migration: create the "appointments" table.
 * Each appointment is a 1-hour time slot belonging to a barbershop.
 * - When userId is NULL  -> the slot is FREE (available to book).
 * - When userId is set   -> the slot is BOOKED by that user.
 *
 * A unique index on (barbershopId, startTime) prevents duplicate slots.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('appointments', {
      appointmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      // Slot start time (1-hour slots; end is startTime + 1h, implied)
      startTime: { type: Sequelize.DATE, allowNull: false },

      // FK -> the barbershop this slot belongs to
      barbershopId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'barbershops', key: 'barbershopId' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      // FK -> the user who booked it. NULL means the slot is still free.
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'userId' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      createDate: { type: Sequelize.DATE, allowNull: false },
      updateDate: { type: Sequelize.DATE, allowNull: false },
    });

    // No two slots at the same time for the same shop.
    await queryInterface.addIndex('appointments', ['barbershopId', 'startTime'], {
      unique: true,
      name: 'appointments_shop_time_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('appointments');
  },
};