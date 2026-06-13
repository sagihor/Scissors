/**
 * Barbershop Controller
 * ---------------------
 * Handles CRUD for the main resource (barbershops) using the Sequelize ORM,
 * plus a relational (JOIN) endpoint that returns a shop together with its
 * barbers via the many-to-many junction table.
 *
 * All data now comes from MySQL — no more JSON files.
 */

const { Barbershop, User, Service, Review } = require('../../models');

// Standard response helpers (keep the Assignment 2 API format)
const sendError = (res, status, code, message, details = {}) =>
  res.status(status).json({ success: false, data: null, error: { code, message, details } });

const sendSuccess = (res, status, data) =>
  res.status(status).json({ success: true, data, error: null });

// Compute average rating + review count for a shop from its reviews.
function withComputedRating(shop, reviews) {
  const count = reviews.length;
  const avg = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  const plain = shop.toJSON ? shop.toJSON() : shop;
  return {
    ...plain,
    rating: Math.round(avg * 10) / 10, // one decimal
    reviewCount: count,
  };
}

module.exports = {
  // GET /api/barbershops — list all shops with computed rating
  getAllBarbershops: async (req, res, next) => {
    try {
      const shops = await Barbershop.findAll({ include: [{ model: Review }] });
      const data = shops.map((shop) => withComputedRating(shop, shop.Reviews || []));
      return sendSuccess(res, 200, data);
    } catch (err) { next(err); }
  },

  // GET /api/barbershops/:id — one shop with computed rating
  getBarbershopById: async (req, res, next) => {
    try {
      const shop = await Barbershop.findByPk(req.params.id, { include: [{ model: Review }] });
      if (!shop) return sendError(res, 404, 'NOT_FOUND', 'Barbershop not found.');
      return sendSuccess(res, 200, withComputedRating(shop, shop.Reviews || []));
    } catch (err) { next(err); }
  },

  // GET /api/barbershops/:id/barbers — RELATIONAL JOIN
  // Returns the shop with its barbers loaded through the junction table.
  getBarbershopBarbers: async (req, res, next) => {
    try {
      const shop = await Barbershop.findByPk(req.params.id, {
        include: [
          { model: User, as: 'barbers', through: { attributes: [] } }, // hide junction columns
          { model: Service }, // also include the shop's services (one-to-many)
        ],
      });
      if (!shop) return sendError(res, 404, 'NOT_FOUND', 'Barbershop not found.');
      return sendSuccess(res, 200, shop);
    } catch (err) { next(err); }
  },

  // POST /api/barbershops — create (CREATE)
  createBarbershop: async (req, res, next) => {
    try {
      const { name, address, city, phone } = req.body;
      if (!name || !address || !city) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Missing required fields.', {
          required: ['name', 'address', 'city'],
        });
      }
      const newShop = await Barbershop.create({ name, address, city, phone });
      return sendSuccess(res, 201, { barbershopId: newShop.barbershopId });
    } catch (err) { next(err); }
  },

  // PUT /api/barbershops/:id — update (UPDATE)
  updateBarbershop: async (req, res, next) => {
    try {
      const { name, address, city, phone } = req.body;
      if (!name || !address || !city) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Missing required fields for update.', {
          required: ['name', 'address', 'city'],
        });
      }

      const shop = await Barbershop.findByPk(req.params.id);
      if (!shop) return sendError(res, 404, 'NOT_FOUND', `Barbershop with ID ${req.params.id} not found.`);

      await shop.update({ name, address, city, phone }); // uses `shop`
      return sendSuccess(res, 200, { barbershopId: shop.barbershopId });
    } catch (err) { next(err); }
  },
  // DELETE /api/barbershops/:id — delete (DELETE)
  deleteBarbershop: async (req, res, next) => {
    try {
      const shop = await Barbershop.findByPk(req.params.id);
      if (!shop) return sendError(res, 404, 'NOT_FOUND', 'Barbershop not found.');

      await shop.destroy();
      return sendSuccess(res, 200, { barbershopId: parseInt(req.params.id) });
    } catch (err) { next(err); }
  },
};