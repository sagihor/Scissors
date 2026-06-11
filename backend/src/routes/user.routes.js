const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');

const requireRole = require('../middleware/requireRole');
const allowSelfOr = require('../middleware/allowSelfOr');
const authMock = require('../middleware/authMock');

// GET /api/users/me - current user (must be before /:id)
router.get('/me', authMock, authController.me);

// GET /api/users - list all (public)
router.get('/', userController.getAllUsers);

// GET /api/users/:id - one user (public)
router.get('/:id', userController.getUserById);

// POST /api/users - create (open access)
router.post('/', userController.createUser);

// PUT /api/users/:id - update (admin/manager, or self) — authMock decodes the token first
router.put('/:id', authMock, allowSelfOr('admin', 'manager'), userController.updateUser);

// DELETE /api/users/:id - delete (admin only) — authMock first
router.delete('/:id', authMock, requireRole('admin'), userController.deleteUser);

module.exports = router;