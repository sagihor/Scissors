/**
 * Barbershop Controller
 * ---------------------
 * Handles CRUD for the main resource (barbershops) using the Sequelize ORM,
 * plus a relational (JOIN) endpoint that returns a shop together with its
 * barbers via the many-to-many junction table.
 *
 * The list endpoint also supports optional filters: city, minimum rating,
 * availability window, and distance from a point (lat/lng + maxDistanceKm).
 */

const { Op } = require('sequelize');
const { Barbershop, User, Service, Review, Appointment } = require('../../models');

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

// Haversine great-circle distance between two lat/lng points, in kilometers.
function distanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371; // Earth radius km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

module.exports = {
  // GET /api/barbershops — list all shops with computed rating.
  // Optional filters (all combine):
  //   ?city=Tel Aviv               exact city match
  //   ?minRating=4                 computed avg rating >= value
  //   ?availFrom=ISO&availTo=ISO   only shops with >=1 free slot in that range
  //   ?lat=..&lng=..&maxDistanceKm=..  only shops within that distance; also
  //                                    adds a `distanceKm` field and sorts by it
  getAllBarbershops: async (req, res, next) => {
    try {
      const { city, minRating, availFrom, availTo, lat, lng, maxDistanceKm } = req.query;

      const where = {};
      if (city) where.city = city;

      const shops = await Barbershop.findAll({
        where,
        include: [{ model: Review }],
      });

      let data = shops.map((shop) => withComputedRating(shop, shop.Reviews || []));

      // Minimum rating filter (computed field, so filter in JS).
      if (minRating) {
        const min = parseFloat(minRating);
        data = data.filter((s) => (s.rating ?? 0) >= min);
      }

      // Availability filter: keep only shops with at least one free slot
      // in [availFrom, availTo]. availFrom alone means "from then on".
      if (availFrom) {
        const now = new Date();
        const from = new Date(availFrom);
        const lower = from < now ? now : from;
        const slotWhere = {
          userId: null,
          startTime: availTo
            ? { [Op.gte]: lower, [Op.lte]: new Date(availTo) }
            : { [Op.gte]: lower },
        };
        const freeSlots = await Appointment.findAll({
          where: slotWhere,
          attributes: ['barbershopId'],
          group: ['barbershopId'],
        });
        const shopsWithFree = new Set(freeSlots.map((s) => s.barbershopId));
        data = data.filter((s) => shopsWithFree.has(s.barbershopId));
      }

      // Distance filter + annotation. Requires a user point (lat/lng).
      if (lat && lng) {
        const uLat = parseFloat(lat);
        const uLng = parseFloat(lng);
        data = data
          .map((s) => {
            if (s.latitude == null || s.longitude == null) return { ...s, distanceKm: null };
            const d = distanceKm(uLat, uLng, s.latitude, s.longitude);
            return { ...s, distanceKm: Math.round(d * 10) / 10 };
          })
          // sort nearest first (shops without coords sink to the bottom)
          .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));

        if (maxDistanceKm) {
          const max = parseFloat(maxDistanceKm);
          data = data.filter((s) => s.distanceKm != null && s.distanceKm <= max);
        }
      }

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
  getBarbershopBarbers: async (req, res, next) => {
    try {
      const shop = await Barbershop.findByPk(req.params.id, {
        include: [
          { model: User, as: 'barbers', through: { attributes: [] } },
          { model: Service },
        ],
      });
      if (!shop) return sendError(res, 404, 'NOT_FOUND', 'Barbershop not found.');
      return sendSuccess(res, 200, shop);
    } catch (err) { next(err); }
  },

  // POST /api/barbershops — create (CREATE)
  createBarbershop: async (req, res, next) => {
    try {
      const { name, address, city, phone, latitude, longitude } = req.body;
      if (!name || !address || !city) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Missing required fields.', {
          required: ['name', 'address', 'city'],
        });
      }
      const newShop = await Barbershop.create({ name, address, city, phone, latitude, longitude });
      return sendSuccess(res, 201, { barbershopId: newShop.barbershopId });
    } catch (err) { next(err); }
  },

  // PUT /api/barbershops/:id — update (UPDATE)
  updateBarbershop: async (req, res, next) => {
    try {
      const { name, address, city, phone, latitude, longitude } = req.body;
      if (!name || !address || !city) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Missing required fields for update.', {
          required: ['name', 'address', 'city'],
        });
      }
      const shop = await Barbershop.findByPk(req.params.id);
      if (!shop) return sendError(res, 404, 'NOT_FOUND', `Barbershop with ID ${req.params.id} not found.`);

      await shop.update({ name, address, city, phone, latitude, longitude });
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