const express = require('express');
const router = express.Router();

const barbershopController = require('../controllers/barbershop.controller');
const requireRole = require('../middleware/requireRole');
const authMock = require('../middleware/authMock'); // decodes the token -> req.user + x-user-role

// GET /api/barbershops - list all (public)
router.get('/', barbershopController.getAllBarbershops);

// GET /api/barbershops/:id/barbers - RELATIONAL JOIN (before /:id)
router.get('/:id/barbers', barbershopController.getBarbershopBarbers);

// GET /api/barbershops/:id - one shop (public)
router.get('/:id', barbershopController.getBarbershopById);

// POST /api/barbershops - create (admin only) — authMock first to read the token
router.post('/', authMock, requireRole('admin'), barbershopController.createBarbershop);

// PUT /api/barbershops/:id - update (admin or manager)
router.put('/:id', authMock, requireRole('admin', 'manager'), barbershopController.updateBarbershop);

// DELETE /api/barbershops/:id - delete (admin only)
router.delete('/:id', authMock, requireRole('admin'), barbershopController.deleteBarbershop);

module.exports = router;