/**
 * Appointment Controller
 * ----------------------
 * Booking feature for the Dashboard.
 *   - GET  /api/appointments/available/:shopId  -> nearest free slots for a shop
 *   - GET  /api/appointments/me                 -> the current user's next appointment
 *   - POST /api/appointments/:appointmentId/book -> claim a free slot (atomic)
 *
 * A slot is "free" when userId IS NULL. Booking sets userId = current user and
 * is guarded so two users can't grab the same slot.
 */

const { Op } = require('sequelize');
const { Appointment, Barbershop } = require('../../models');

const sendError = (res, status, code, message, details = {}) =>
  res.status(status).json({ success: false, data: null, error: { code, message, details } });

const sendSuccess = (res, status, data) =>
  res.status(status).json({ success: true, data, error: null });

module.exports = {
  // GET /api/appointments/available/:shopId — nearest FREE upcoming slots
  // Optional ?from=ISO&to=ISO to bound the window; defaults to "from now".
  getAvailableForShop: async (req, res, next) => {
    try {
      const shopId = parseInt(req.params.shopId);
      const now = new Date();
      const from = req.query.from ? new Date(req.query.from) : now;
      const where = {
        barbershopId: shopId,
        userId: null,                       // free slots only
        startTime: { [Op.gte]: from < now ? now : from },
      };
      if (req.query.to) {
        where.startTime = { [Op.gte]: from < now ? now : from, [Op.lte]: new Date(req.query.to) };
      }

      const slots = await Appointment.findAll({
        where,
        order: [['startTime', 'ASC']],
        limit: 12,                          // nearest dozen is plenty for the UI
      });
      return sendSuccess(res, 200, slots);
    } catch (err) { next(err); }
  },

  // GET /api/appointments/me — current user's next upcoming booked appointment
  getMyNext: async (req, res, next) => {
    try {
      const appt = await Appointment.findOne({
        where: {
          userId: req.user.userId,
          startTime: { [Op.gte]: new Date() },
        },
        order: [['startTime', 'ASC']],
        include: [{ model: Barbershop }],
      });
      return sendSuccess(res, 200, appt); // null if none — frontend handles that
    } catch (err) { next(err); }
  },

  // POST /api/appointments/:appointmentId/book — claim a free slot
  bookAppointment: async (req, res, next) => {
    try {
      const id = parseInt(req.params.appointmentId);

      // Atomic claim: only succeeds if the slot is still free (userId NULL).
      const [count] = await Appointment.update(
        { userId: req.user.userId },
        { where: { appointmentId: id, userId: null } }
      );

      if (count === 0) {
        return sendError(res, 409, 'SLOT_TAKEN', 'This slot is no longer available.');
      }

      const appt = await Appointment.findByPk(id, { include: [{ model: Barbershop }] });
      return sendSuccess(res, 200, appt);
    } catch (err) { next(err); }
  },
};