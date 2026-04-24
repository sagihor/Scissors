const express = require('express');
const router = express.Router();

const barbershopController = require('../controllers/barbershop.controller');

// Import the middleware
const requireRole = require('../middleware/requireRole');

// GET /barbershops - Retrieve a list of all barbershops (Public access)
router.get('/', barbershopController.getAllBarbershops);

// GET /barbershops/:id - Retrieve a specific barbershop by ID (Public access)
router.get('/:id', barbershopController.getBarbershopById);

// POST /barbershops - Create a new barbershop (Protected: Requires Admin role)
router.post('/', requireRole('admin'), barbershopController.createBarbershop);

// PUT /barbershops/:id - Update an existing barbershop (Protected: Requires Admin role)
router.put('/:id', requireRole('admin'), barbershopController.updateBarbershop);

// DELETE /barbershops/:id - Delete a barbershop (Protected: Requires Admin role)
router.delete('/:id', requireRole('admin'), barbershopController.deleteBarbershop);

module.exports = router;