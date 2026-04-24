const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');

// Import the middleware
const requireRole = require('../middleware/requireRole');

// GET /users - Retrieve a list of all users
router.get('/', userController.getAllUsers);

// GET /users/:id - Retrieve a specific user by their ID
router.get('/:id', userController.getUserById);

// POST /users - Create a new user (Open access)
router.post('/', userController.createUser);

// PUT /users/:id - Update an existing user (Protected: Requires Admin role)
router.put('/:id', requireRole('admin'), userController.updateUser);

// DELETE /users/:id - Delete a user (Protected: Requires Admin role)
router.delete('/:id', requireRole('admin'), userController.deleteUser);

module.exports = router;