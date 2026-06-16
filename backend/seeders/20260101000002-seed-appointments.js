'use strict';

/**
 * Seeder: generate a large pool of FREE appointment slots.
 * For every barbershop, every day from "today" through 2026-07-05,
 * one-hour slots from 09:00 to 19:00 (start times 09..18 => 10 slots/day).
 * All slots start free (userId = null) and become booked when a user claims one.
 */

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // Pull every shop id so we don't hardcode the list.
    const shops = await queryInterface.sequelize.query(
      'SELECT barbershopId FROM barbershops',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Date range: from today (date-only start) through 2026-07-05 inclusive.
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date('2026-07-05T23:59:59');

    const rows = [];
    for (const shop of shops) {
      const day = new Date(start);
      while (day <= end) {
        // start times 09:00 .. 18:00 (each is a 1-hour slot, last ends 19:00)
        for (let hour = 9; hour <= 18; hour++) {
          const slot = new Date(day);
          slot.setHours(hour, 0, 0, 0);

          // skip slots already in the past (today's earlier hours)
          if (slot <= now) continue;

          rows.push({
            startTime: slot,
            barbershopId: shop.barbershopId,
            userId: null,
            createDate: now,
            updateDate: now,
          });
        }
        day.setDate(day.getDate() + 1);
      }
    }

    // Insert in chunks to stay well under packet limits.
    const CHUNK = 1000;
    for (let i = 0; i < rows.length; i += CHUNK) {
      await queryInterface.bulkInsert('appointments', rows.slice(i, i + CHUNK), {});
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('appointments', null, {});
  },
};