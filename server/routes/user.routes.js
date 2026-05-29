const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');

// Import the middlewares
const requireRole = require('../middleware/requireRole');
const allowSelfOr = require('../middleware/allowSelfOr');
const authMock = require('../middleware/authMock');

// GET /api/users/me - Returns the currently authenticated user
// IMPORTANT: must be declared before /:id so Express doesn't match "me" as an id
router.get('/me', authMock, authController.me);

// GET /api/users - Retrieve a list of all users
router.get('/', userController.getAllUsers);

// GET /api/users/:id - Retrieve a specific user by their ID
router.get('/:id', userController.getUserById);

// POST /api/users - Create a new user (Open access)
router.post('/', userController.createUser);

// PUT /api/users/:id - Update a user.
router.put('/:id', allowSelfOr('admin', 'manager'), userController.updateUser);

// DELETE /api/users/:id - Delete a user (admin only)
router.delete('/:id', requireRole('admin'), userController.deleteUser);

module.exports = router;