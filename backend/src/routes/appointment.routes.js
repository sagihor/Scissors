const express = require('express');
const router = express.Router();

const appointmentController = require('../controllers/appointment.controller');
const authMock = require('../middleware/authMock');

// GET /api/appointments/me   — current user's next appointment
router.get('/me', authMock, appointmentController.getMyNext);

// GET /api/appointments/mine — all of the user's upcoming appointments
router.get('/mine', authMock, appointmentController.getMine);

// GET /api/appointments/available/:shopId — computed free slots for a shop (public)
router.get('/available/:shopId', appointmentController.getAvailableForShop);

// POST   /api/appointments/book              — CREATE a new booking
//        body: { barbershopId, startTime: "YYYY-MM-DD HH:00:00" }
router.post('/book', authMock, appointmentController.bookAppointment);

// PUT    /api/appointments/:appointmentId    — UPDATE (reschedule) own booking
//        body: { startTime: "YYYY-MM-DD HH:00:00" }
router.put('/:appointmentId', authMock, appointmentController.rescheduleAppointment);

// DELETE /api/appointments/:appointmentId    — DELETE own booking
router.delete('/:appointmentId', authMock, appointmentController.cancelAppointment);

module.exports = router;