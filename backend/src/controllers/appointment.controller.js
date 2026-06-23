/**
 * Appointment Controller
 * ----------------------
 * Booking feature for the Dashboard.
 *
 * DESIGN: a row in `appointments` exists ONLY when a booking exists. There are
 * no pre-seeded "free slot" rows. Availability is COMPUTED: standard working
 * hours for a date range, minus the hours already booked for that shop.
 *
 *   - POST   /api/appointments/book            -> Appointment.create   (CREATE)
 *   - PUT    /api/appointments/:appointmentId  -> Appointment.update   (UPDATE)
 *   - DELETE /api/appointments/:appointmentId  -> Appointment.destroy  (DELETE)
 *
 * TIMEZONE: startTime is a plain wall-clock STRING "YYYY-MM-DD HH:00:00"
 * (model field is STRING, see appointment.model.js). We compare against a
 * wall-clock "now" string, so NOTHING is ever converted to/from UTC. What you
 * book equals what is stored equals what is shown — on any server timezone.
 */

const { Op } = require('sequelize');
const { Appointment, Barbershop } = require('../../models');

const sendError = (res, status, code, message, details = {}) =>
  res.status(status).json({ success: false, data: null, error: { code, message, details } });

const sendSuccess = (res, status, data) =>
  res.status(status).json({ success: true, data, error: null });

// Working hours: 09:00 .. 18:00 inclusive (each is a 1-hour slot).
const OPEN_HOUR = 9;
const CLOSE_HOUR = 18;

// How many days ahead to offer by default (today + this many).
const DEFAULT_WINDOW_DAYS = 21;

const pad = (n) => String(n).padStart(2, '0');

// "YYYY-MM-DD" for a Date using LOCAL parts.
function ymd(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Full wall-clock string for a Date using LOCAL parts.
function wallClock(date) {
  return `${ymd(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// Slot string for a given day + hour: "YYYY-MM-DD HH:00:00".
function slotString(dayStr, hour) {
  return `${dayStr} ${pad(hour)}:00:00`;
}

// Normalise whatever startTime we get (already a string in our model, but be
// defensive) into a canonical "YYYY-MM-DD HH:00:00" key with no TZ conversion.
function normalizeKey(startTime) {
  if (typeof startTime === 'string') {
    const sep = startTime.includes('T') ? 'T' : ' ';
    const [datePart, timePart = '00'] = startTime.split(sep);
    return slotString(datePart, Number(timePart.slice(0, 2)));
  }
  const d = new Date(startTime);
  return slotString(ymd(d), d.getHours());
}

// Current wall-clock "now" as a comparable string.
function nowString() {
  return wallClock(new Date());
}

module.exports = {
  // GET /api/appointments/available/:shopId
  // Optional ?from=YYYY-MM-DD (or ISO) & ?to=YYYY-MM-DD (or ISO).
  // Returns computed free slots: [{ startTime, barbershopId }].
  getAvailableForShop: async (req, res, next) => {
    try {
      const shopId = parseInt(req.params.shopId);
      const now = new Date();

      // Window start: max(now, from). Window end: to, or now + DEFAULT_WINDOW_DAYS.
      const from = req.query.from ? new Date(req.query.from) : now;
      const lower = from < now ? now : from;
      const to = req.query.to
        ? new Date(req.query.to)
        : new Date(now.getTime() + DEFAULT_WINDOW_DAYS * 24 * 60 * 60 * 1000);
      // If a ?to date came in as a bare day (midnight), extend it to end-of-day
      // so that day's slots are included.
      if (req.query.to && /^\d{4}-\d{2}-\d{2}$/.test(String(req.query.to))) {
        to.setHours(23, 59, 59, 999);
      }

      const lowerStr = wallClock(lower);

      // Booked rows for this shop within [lower, to], as a fast "taken" set.
      const booked = await Appointment.findAll({
        where: {
          barbershopId: shopId,
          startTime: { [Op.gte]: lowerStr, [Op.lte]: wallClock(to) },
        },
        attributes: ['startTime'],
      });
      const takenSet = new Set(booked.map((b) => normalizeKey(b.startTime)));

      // Walk each day + working hour; keep the free, future ones.
      const slots = [];
      const dayCursor = new Date(lower);
      dayCursor.setHours(0, 0, 0, 0);
      const endDay = new Date(to);
      endDay.setHours(0, 0, 0, 0);

      const MAX = 400;
      while (dayCursor <= endDay && slots.length < MAX) {
        const dayStr = ymd(dayCursor);
        for (let hour = OPEN_HOUR; hour <= CLOSE_HOUR; hour++) {
          const key = slotString(dayStr, hour);
          if (key < lowerStr) continue;          // strictly in the past / before window
          if (key > wallClock(to)) continue;     // past the window end
          if (takenSet.has(key)) continue;       // already booked
          slots.push({ startTime: key, barbershopId: shopId });
          if (slots.length >= MAX) break;
        }
        dayCursor.setDate(dayCursor.getDate() + 1);
      }

      return sendSuccess(res, 200, slots);
    } catch (err) { next(err); }
  },

  // GET /api/appointments/me — current user's next upcoming booked appointment
  getMyNext: async (req, res, next) => {
    try {
      const appt = await Appointment.findOne({
        where: { userId: req.user.userId, startTime: { [Op.gte]: nowString() } },
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
        where: { userId: req.user.userId, startTime: { [Op.gte]: nowString() } },
        order: [['startTime', 'ASC']],
        include: [{ model: Barbershop }],
      });
      return sendSuccess(res, 200, appts);
    } catch (err) { next(err); }
  },

  // POST /api/appointments/book  body: { barbershopId, startTime: "YYYY-MM-DD HH:00:00" }
  // CREATE: inserts a brand-new booking row for the current user.
  bookAppointment: async (req, res, next) => {
    try {
      const { barbershopId, startTime } = req.body;

      if (!barbershopId || !startTime)
        return sendError(res, 400, 'VALIDATION_ERROR', 'barbershopId and startTime are required.', {
          required: ['barbershopId', 'startTime'],
        });

      const key = normalizeKey(startTime);

      // Reject past slots (string compare against wall-clock now).
      if (key < nowString())
        return sendError(res, 400, 'VALIDATION_ERROR', 'That time is in the past.', { field: 'startTime' });

      // Already taken? (also guarded by the unique index)
      const clash = await Appointment.findOne({ where: { barbershopId, startTime: key } });
      if (clash)
        return sendError(res, 409, 'SLOT_TAKEN', 'This slot is no longer available.');

      const created = await Appointment.create({
        barbershopId,
        startTime: key,            // stored verbatim — no Date, no TZ shift
        userId: req.user.userId,
      });

      const appt = await Appointment.findByPk(created.appointmentId, { include: [{ model: Barbershop }] });
      return sendSuccess(res, 201, appt);
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError')
        return sendError(res, 409, 'SLOT_TAKEN', 'This slot is no longer available.');
      next(err);
    }
  },

  // PUT /api/appointments/:appointmentId  body: { startTime: "YYYY-MM-DD HH:00:00" }
  // UPDATE: reschedule the user's OWN booking to a new time at the same shop.
  rescheduleAppointment: async (req, res, next) => {
    try {
      const id = parseInt(req.params.appointmentId);
      const { startTime } = req.body;

      if (!startTime)
        return sendError(res, 400, 'VALIDATION_ERROR', 'startTime is required.', { field: 'startTime' });

      const key = normalizeKey(startTime);
      if (key < nowString())
        return sendError(res, 400, 'VALIDATION_ERROR', 'That time is in the past.', { field: 'startTime' });

      const appt = await Appointment.findOne({ where: { appointmentId: id, userId: req.user.userId } });
      if (!appt)
        return sendError(res, 404, 'NOT_FOUND', 'No booking of yours matches that id.');

      // New time must be free at the same shop (ignore this same row).
      const clash = await Appointment.findOne({
        where: { barbershopId: appt.barbershopId, startTime: key, appointmentId: { [Op.ne]: id } },
      });
      if (clash)
        return sendError(res, 409, 'SLOT_TAKEN', 'That new time is already taken.');

      await appt.update({ startTime: key });

      const updated = await Appointment.findByPk(id, { include: [{ model: Barbershop }] });
      return sendSuccess(res, 200, updated);
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError')
        return sendError(res, 409, 'SLOT_TAKEN', 'That new time is already taken.');
      next(err);
    }
  },

  // DELETE /api/appointments/:appointmentId
  // DELETE: permanently remove the user's OWN booking row (frees the time).
  cancelAppointment: async (req, res, next) => {
    try {
      const id = parseInt(req.params.appointmentId);

      const deleted = await Appointment.destroy({
        where: { appointmentId: id, userId: req.user.userId },
      });

      if (deleted === 0)
        return sendError(res, 404, 'NOT_FOUND', 'No booking of yours matches that id.');

      return sendSuccess(res, 200, { appointmentId: id, deleted: true });
    } catch (err) { next(err); }
  },
};