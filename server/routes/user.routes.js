const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');

// Import the middlewares
const requireRole = require('../middleware/requireRole');
const allowSelfOr = require('../middleware/allowSelfOr');

// GET /users - Retrieve a list of all users
router.get('/', userController.getAllUsers);

// GET /users/:id - Retrieve a specific user by their ID
router.get('/:id', userController.getUserById);

// POST /users - Create a new user (Open access)
router.post('/', userController.createUser);

// PUT /users/:id - Update a user.
// Allowed: admin OR manager (anyone) — OR a regular user updating their own record.
router.put('/:id', allowSelfOr('admin', 'manager'), userController.updateUser);

// DELETE /users/:id - Delete a user (admin only)
router.delete('/:id', requireRole('admin'), userController.deleteUser);

module.exports = router;