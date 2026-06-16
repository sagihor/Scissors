/**
 * Appointment Controller
 * ----------------------
 * Booking feature for the Dashboard.
 *   - GET    /api/appointments/available/:shopId   -> nearest free slots for a shop
 *   - GET    /api/appointments/me                  -> the current user's next appointment
 *   - GET    /api/appointments/mine                -> all of the user's upcoming appointments
 *   - POST   /api/appointments/:appointmentId/book -> claim a free slot (atomic)
 *   - DELETE /api/appointments/:appointmentId/book -> cancel: free the slot again
 *
 * A slot is "free" when userId IS NULL. Booking sets userId = current user;
 * cancelling sets it back to NULL so the slot becomes available to everyone.
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
      const lower = from < now ? now : from;

      const where = {
        barbershopId: shopId,
        userId: null,
        startTime: req.query.to
          ? { [Op.gte]: lower, [Op.lte]: new Date(req.query.to) }
          : { [Op.gte]: lower },
      };

      const slots = await Appointment.findAll({
        where,
        order: [['startTime', 'ASC']],
        limit: 12,
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
      return sendSuccess(res, 200, appt);
    } catch (err) { next(err); }
  },

  // GET /api/appointments/mine — ALL of the user's upcoming appointments
  getMine: async (req, res, next) => {
    try {
      const appts = await Appointment.findAll({
        where: {
          userId: req.user.userId,
          startTime: { [Op.gte]: new Date() },
        },
        order: [['startTime', 'ASC']],
        include: [{ model: Barbershop }],
      });
      return sendSuccess(res, 200, appts);
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

  // DELETE /api/appointments/:appointmentId/book — cancel the user's booking.
  // Frees the slot (userId -> NULL) so it becomes bookable again for everyone.
  cancelAppointment: async (req, res, next) => {
    try {
      const id = parseInt(req.params.appointmentId);

      // Only the owner can cancel: match appointmentId AND this user's id.
      const [count] = await Appointment.update(
        { userId: null },
        { where: { appointmentId: id, userId: req.user.userId } }
      );

      if (count === 0) {
        return sendError(res, 404, 'NOT_FOUND', 'No booking of yours matches that slot.');
      }

      return sendSuccess(res, 200, { appointmentId: id, freed: true });
    } catch (err) { next(err); }
  },
};