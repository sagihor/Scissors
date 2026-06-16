'use strict';

/**
 * Seeder: full coherent dataset.
 * - 15 barbershops across 8 cities (multiple shops per city)
 * - services per shop
 * - barber<->shop junction links
 * - 3-5 reviews per shop (~55 reviews)
 *
 * NOTE: shop rating/reviewCount are NOT seeded as fixed values — they are
 * computed dynamically from the reviews table by the controller. We store 0
 * as a neutral default in the column.
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    /* ---------------- USERS ---------------- */
    await queryInterface.bulkInsert('users', [
      { userId: 1,  firstName: 'Roni',  lastName: 'Hadad',     username: 'roni_h',  userRole: 'customer', email: 'roni@scissors.test',  password: '123456', createDate: now, updateDate: now },
      { userId: 2,  firstName: 'Rachel',lastName: 'Levi',      username: 'rachel_h',userRole: 'customer', email: 'rachel@scissors.test',password: '123456', createDate: now, updateDate: now },
      { userId: 3,  firstName: 'Shira', lastName: 'Ben-David', username: 'shira_h', userRole: 'customer', email: 'shira@scissors.test', password: '123456', createDate: now, updateDate: now },
      { userId: 4,  firstName: 'Avi',   lastName: 'Mizrahi',   username: 'avi_h',   userRole: 'customer', email: 'avi@scissors.test',   password: '123456', createDate: now, updateDate: now },
      { userId: 5,  firstName: 'Daniel',lastName: 'Katz',      username: 'daniel_h',userRole: 'customer', email: 'daniel@scissors.test',password: '123456', createDate: now, updateDate: now },
      { userId: 6,  firstName: 'Maya',  lastName: 'Friedman',  username: 'maya_h',  userRole: 'customer', email: 'maya@scissors.test',  password: '123456', createDate: now, updateDate: now },
      { userId: 7,  firstName: 'David', lastName: 'Perez',     username: 'david_h', userRole: 'barber',   email: 'david@scissors.test', password: '123456', createDate: now, updateDate: now },
      { userId: 8,  firstName: 'Moshe', lastName: 'Ohayon',    username: 'moshe_h', userRole: 'barber',   email: 'moshe@scissors.test', password: '123456', createDate: now, updateDate: now },
      { userId: 9,  firstName: 'Eitan', lastName: 'Shapira',   username: 'eitan_h', userRole: 'barber',   email: 'eitan@scissors.test', password: '123456', createDate: now, updateDate: now },
      { userId: 10, firstName: 'Omer',  lastName: 'Dahan',     username: 'omer_h',  userRole: 'barber',   email: 'omer@scissors.test',  password: '123456', createDate: now, updateDate: now },
      { userId: 11, firstName: 'Ido',   lastName: 'Harel',     username: 'ido_h',   userRole: 'admin',    email: 'ido@scissors.test',   password: '123456', createDate: now, updateDate: now },
      { userId: 12, firstName: 'Sagi',  lastName: 'Horowitz',  username: 'sagi_h',  userRole: 'manager',  email: 'sagi@scissors.test',  password: '123456', createDate: now, updateDate: now },
    ], {});

    // Default location for every seeded user: Dizengoff Square, Tel Aviv
    // (a central city that has barbershops). Users can change this in Settings.
    await queryInterface.sequelize.query(
      "UPDATE users SET latitude = 32.0786, longitude = 34.7741, addressLabel = 'Dizengoff Square, Tel Aviv'"
    );

    /* ---------------- ADMINS ---------------- */
    await queryInterface.bulkInsert('admins', [
      { userId: 11, accessLevel: 'super', createDate: now, updateDate: now },
    ], {});

    /* ---------------- SETTINGS ---------------- */
    await queryInterface.bulkInsert('settings', [
      { userId: 1,  theme: 'light', createDate: now, updateDate: now },
      { userId: 2,  theme: 'light', createDate: now, updateDate: now },
      { userId: 3,  theme: 'dark',  createDate: now, updateDate: now },
      { userId: 11, theme: 'light', createDate: now, updateDate: now },
      { userId: 12, theme: 'light', createDate: now, updateDate: now },
    ], {});

    /* ---------------- BARBERSHOPS: 15 shops, 8 cities ---------------- */
    // Real street addresses with accurate coordinates (no runtime geocoding needed).
    await queryInterface.bulkInsert('barbershops', [
      // Tel Aviv (3)
      { barbershopId: 1,  name: "The Gentlemen's Den", address: 'Dizengoff St 100, Tel Aviv',  city: 'Tel Aviv',      phone: '03-5551428', latitude: 32.0809, longitude: 34.7741, createDate: now, updateDate: now },
      { barbershopId: 2,  name: 'Fade & Co.',          address: 'Allenby St 40, Tel Aviv',     city: 'Tel Aviv',      phone: '03-7710098', latitude: 32.0668, longitude: 34.7700, createDate: now, updateDate: now },
      { barbershopId: 3,  name: 'Rothschild Razors',   address: 'Rothschild Blvd 60, Tel Aviv',city: 'Tel Aviv',      phone: '03-9912004', latitude: 32.0644, longitude: 34.7716, createDate: now, updateDate: now },
      // Jerusalem (2)
      { barbershopId: 4,  name: 'Mahogany Barbers',    address: 'Jaffa St 50, Jerusalem',      city: 'Jerusalem',     phone: '02-3301145', latitude: 31.7835, longitude: 35.2155, createDate: now, updateDate: now },
      { barbershopId: 5,  name: 'Old City Cuts',       address: 'Emek Refaim St 20, Jerusalem',city: 'Jerusalem',     phone: '02-6650781', latitude: 31.7625, longitude: 35.2192, createDate: now, updateDate: now },
      // Haifa (2)
      { barbershopId: 6,  name: 'Sharp Edges Studio',  address: 'Herzl St 30, Haifa',          city: 'Haifa',         phone: '04-4427781', latitude: 32.8120, longitude: 34.9930, createDate: now, updateDate: now },
      { barbershopId: 7,  name: 'Carmel Clippers',     address: 'Moriah Ave 80, Haifa',        city: 'Haifa',         phone: '04-8120355', latitude: 32.7940, longitude: 34.9820, createDate: now, updateDate: now },
      // Beersheba (2)
      { barbershopId: 8,  name: 'Beersheba Blades',    address: 'HaAtzmaut St 40, Beersheba',  city: 'Beersheba',     phone: '08-6612200', latitude: 31.2435, longitude: 34.7920, createDate: now, updateDate: now },
      { barbershopId: 9,  name: 'Desert Sharp',        address: 'Rager Blvd 15, Beersheba',    city: 'Beersheba',     phone: '08-6477190', latitude: 31.2520, longitude: 34.7910, createDate: now, updateDate: now },
      // Netanya (2)
      { barbershopId: 10, name: 'Netanya Style Bar',   address: 'Herzl St 10, Netanya',        city: 'Netanya',       phone: '09-8834120', latitude: 32.3290, longitude: 34.8570, createDate: now, updateDate: now },
      { barbershopId: 11, name: 'Seaside Shears',      address: 'Gad Machnes St 5, Netanya',   city: 'Netanya',       phone: '09-8651233', latitude: 32.3215, longitude: 34.8525, createDate: now, updateDate: now },
      // Rishon LeZion (1)
      { barbershopId: 12, name: 'Rishon Royal Cuts',   address: 'Rothschild St 30, Rishon LeZion', city: 'Rishon LeZion', phone: '03-9504411', latitude: 31.9640, longitude: 34.8044, createDate: now, updateDate: now },
      // Petah Tikva (1)
      { barbershopId: 13, name: 'PT Precision',        address: 'Haim Ozer St 12, Petah Tikva',city: 'Petah Tikva',   phone: '03-9221870', latitude: 32.0878, longitude: 34.8870, createDate: now, updateDate: now },
      // Eilat (2)
      { barbershopId: 14, name: 'Eilat Cuts',          address: 'HaTmarim Blvd 8, Eilat',      city: 'Eilat',         phone: '08-6377411', latitude: 29.5530, longitude: 34.9510, createDate: now, updateDate: now },
      { barbershopId: 15, name: 'Red Sea Barbers',     address: 'Durban St 3, Eilat',          city: 'Eilat',         phone: '08-6312299', latitude: 29.5460, longitude: 34.9590, createDate: now, updateDate: now },
    ], {});
    /* ---------------- SERVICES (2-3 per shop) ---------------- */
    await queryInterface.bulkInsert('services', [
      { name: 'Classic Haircut', price: 80,  barbershopId: 1,  createDate: now, updateDate: now },
      { name: 'Skin Fade',       price: 100, barbershopId: 1,  createDate: now, updateDate: now },
      { name: 'Beard Trim',      price: 50,  barbershopId: 1,  createDate: now, updateDate: now },
      { name: 'Modern Cut',      price: 110, barbershopId: 2,  createDate: now, updateDate: now },
      { name: 'Beard Sculpting', price: 70,  barbershopId: 2,  createDate: now, updateDate: now },
      { name: "Kid's Cut",       price: 60,  barbershopId: 2,  createDate: now, updateDate: now },
      { name: 'Premium Fade',    price: 120, barbershopId: 3,  createDate: now, updateDate: now },
      { name: 'Hot Towel Shave', price: 90,  barbershopId: 3,  createDate: now, updateDate: now },
      { name: "Gentleman's Cut", price: 150, barbershopId: 4,  createDate: now, updateDate: now },
      { name: 'Royal Shave',     price: 180, barbershopId: 4,  createDate: now, updateDate: now },
      { name: 'Traditional Cut', price: 70,  barbershopId: 5,  createDate: now, updateDate: now },
      { name: 'Beard Design',    price: 55,  barbershopId: 5,  createDate: now, updateDate: now },
      { name: 'Quick Cut',       price: 50,  barbershopId: 6,  createDate: now, updateDate: now },
      { name: 'Quick Combo',     price: 70,  barbershopId: 6,  createDate: now, updateDate: now },
      { name: 'Carmel Special',  price: 95,  barbershopId: 7,  createDate: now, updateDate: now },
      { name: 'Fade + Beard',    price: 115, barbershopId: 7,  createDate: now, updateDate: now },
      { name: 'Desert Fade',     price: 90,  barbershopId: 8,  createDate: now, updateDate: now },
      { name: 'Hot Towel Shave', price: 75,  barbershopId: 8,  createDate: now, updateDate: now },
      { name: 'Sharp Trim',      price: 60,  barbershopId: 9,  createDate: now, updateDate: now },
      { name: 'Full Service',    price: 130, barbershopId: 9,  createDate: now, updateDate: now },
      { name: 'Style & Color',   price: 140, barbershopId: 10, createDate: now, updateDate: now },
      { name: 'Express Trim',    price: 45,  barbershopId: 10, createDate: now, updateDate: now },
      { name: 'Beach Cut',       price: 65,  barbershopId: 11, createDate: now, updateDate: now },
      { name: 'Wave Styling',    price: 85,  barbershopId: 11, createDate: now, updateDate: now },
      { name: 'Royal Treatment', price: 160, barbershopId: 12, createDate: now, updateDate: now },
      { name: 'Classic Trim',    price: 55,  barbershopId: 12, createDate: now, updateDate: now },
      { name: 'Precision Fade',  price: 100, barbershopId: 13, createDate: now, updateDate: now },
      { name: 'Beard Combo',     price: 110, barbershopId: 13, createDate: now, updateDate: now },
      { name: 'Coral Cut',       price: 70,  barbershopId: 14, createDate: now, updateDate: now },
      { name: 'Vacation Trim',   price: 50,  barbershopId: 14, createDate: now, updateDate: now },
      { name: 'Marina Style',    price: 105, barbershopId: 15, createDate: now, updateDate: now },
      { name: 'Sea Breeze Shave',price: 80,  barbershopId: 15, createDate: now, updateDate: now },
    ], {});

    /* ---------------- JUNCTION (barbers <-> shops) ---------------- */
    await queryInterface.bulkInsert('barbershop_barbers', [
      { userId: 7,  barbershopId: 1,  createDate: now, updateDate: now },
      { userId: 8,  barbershopId: 1,  createDate: now, updateDate: now },
      { userId: 9,  barbershopId: 2,  createDate: now, updateDate: now },
      { userId: 10, barbershopId: 2,  createDate: now, updateDate: now },
      { userId: 10, barbershopId: 6,  createDate: now, updateDate: now }, // Omer at 2 shops
      { userId: 7,  barbershopId: 3,  createDate: now, updateDate: now }, // David at 2 shops
      { userId: 9,  barbershopId: 7,  createDate: now, updateDate: now },
    ], {});

    /* ---------------- REVIEWS (3-5 per shop) ---------------- */
    const r = (rating, comment, barbershopId, userId) =>
      ({ rating, comment, barbershopId, userId, createDate: now, updateDate: now });

    await queryInterface.bulkInsert('reviews', [
      // Shop 1 — Tel Aviv (avg ~4.8)
      r(5, 'Best skin fade in Tel Aviv, super clean finish.', 1, 1),
      r(5, 'David is a master with the beard trim.', 1, 2),
      r(4, 'Great cut, a little pricey but worth it.', 1, 3),
      r(5, 'Always leave looking sharp. Highly recommend.', 1, 4),
      // Shop 2 — Tel Aviv (avg ~4.5)
      r(5, 'Trendy modern styles, perfect fresh look.', 2, 6),
      r(4, 'Good kids cut, friendly staff.', 2, 1),
      r(4, 'Solid fade, decent prices.', 2, 5),
      r(5, 'Loved the beard sculpting!', 2, 2),
      // Shop 3 — Tel Aviv (avg ~4.7)
      r(5, 'Premium fade was flawless.', 3, 3),
      r(5, 'The hot towel shave is so relaxing.', 3, 4),
      r(4, 'Stylish spot on Rothschild, bit of a wait.', 3, 6),
      // Shop 4 — Jerusalem (avg ~4.5)
      r(5, 'Royal shave is a luxury experience.', 4, 2),
      r(4, 'Classic gentleman vibe, great atmosphere.', 4, 3),
      r(4, 'Quality cut, knowledgeable barbers.', 4, 5),
      // Shop 5 — Jerusalem (avg ~4.0)
      r(4, 'Traditional cut done right.', 5, 1),
      r(4, 'Nice beard design, good value.', 5, 4),
      r(4, 'Reliable spot near the Old City.', 5, 6),
      // Shop 6 — Haifa (avg ~3.3)
      r(3, 'Quick and cheap but the cut was rushed.', 6, 6),
      r(3, 'Okay for a fast trim, nothing special.', 6, 1),
      r(4, 'Fine for the price.', 6, 5),
      // Shop 7 — Haifa (avg ~4.7)
      r(5, 'Carmel Special is fantastic, great views too.', 7, 2),
      r(5, 'Best fade and beard combo in Haifa.', 7, 3),
      r(4, 'Skilled barbers, friendly service.', 7, 4),
      // Shop 8 — Beersheba (avg ~4.7)
      r(5, 'Amazing desert fade, best in Beersheba.', 8, 1),
      r(5, 'Great hot towel shave, very clean.', 8, 5),
      r(4, 'Good cut, welcoming place.', 8, 6),
      // Shop 9 — Beersheba (avg ~4.0)
      r(4, 'Solid full service, fair prices.', 9, 2),
      r(4, 'Sharp trim, quick and clean.', 9, 3),
      // Shop 10 — Netanya (avg ~4.5)
      r(5, 'Loved the style and color, very professional.', 10, 3),
      r(4, 'Express trim was fast and neat.', 10, 1),
      r(5, 'Great results, will come back.', 10, 4),
      // Shop 11 — Netanya (avg ~4.0)
      r(4, 'Relaxed beach cut by the promenade.', 11, 2),
      r(4, 'Nice wave styling, friendly barber.', 11, 6),
      // Shop 12 — Rishon LeZion (avg ~4.5)
      r(5, 'Royal treatment lives up to the name.', 12, 5),
      r(4, 'Classic trim, clean shop.', 12, 1),
      // Shop 13 — Petah Tikva (avg ~4.7)
      r(5, 'Precision fade was exactly what I wanted.', 13, 3),
      r(5, 'Great beard combo, attention to detail.', 13, 4),
      r(4, 'Good service, easy to book.', 13, 2),
      // Shop 14 — Eilat (avg ~4.0)
      r(4, 'Relaxed beach cut, affordable.', 14, 2),
      r(4, 'Decent vacation trim, friendly.', 14, 6),
      // Shop 15 — Eilat (avg ~4.5)
      r(5, 'Marina style cut was excellent.', 15, 1),
      r(4, 'Nice sea breeze shave, good vibe.', 15, 5),
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('reviews', null, {});
    await queryInterface.bulkDelete('barbershop_barbers', null, {});
    await queryInterface.bulkDelete('services', null, {});
    await queryInterface.bulkDelete('barbershops', null, {});
    await queryInterface.bulkDelete('settings', null, {});
    await queryInterface.bulkDelete('admins', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};