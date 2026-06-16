const express = require('express');
const router = express.Router();

const appointmentController = require('../controllers/appointment.controller');
const authMock = require('../middleware/authMock');

// GET /api/appointments/me   — current user's next appointment
router.get('/me', authMock, appointmentController.getMyNext);

// GET /api/appointments/mine — all of the user's upcoming appointments
router.get('/mine', authMock, appointmentController.getMine);

// GET /api/appointments/available/:shopId — nearest free slots for a shop (public)
router.get('/available/:shopId', appointmentController.getAvailableForShop);

// POST   /api/appointments/:appointmentId/book — book a slot
// DELETE /api/appointments/:appointmentId/book — cancel a booking (frees the slot)
router.post('/:appointmentId/book', authMock, appointmentController.bookAppointment);
router.delete('/:appointmentId/book', authMock, appointmentController.cancelAppointment);

module.exports = router;