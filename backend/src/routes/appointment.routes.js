const express = require('express');
const router = express.Router();

const appointmentController = require('../controllers/appointment.controller');
const authMock = require('../middleware/authMock');

// GET /api/appointments/me — current user's next appointment (must be before /:id-style routes)
router.get('/me', authMock, appointmentController.getMyNext);

// GET /api/appointments/available/:shopId — nearest free slots for a shop (public)
router.get('/available/:shopId', appointmentController.getAvailableForShop);

// POST /api/appointments/:appointmentId/book — book a slot (logged-in user)
router.post('/:appointmentId/book', authMock, appointmentController.bookAppointment);

module.exports = router;