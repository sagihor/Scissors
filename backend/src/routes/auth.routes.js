const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const authMock = require('../middleware/authMock');

// POST /api/auth/login - open access
router.post('/login', authController.login);

// POST /api/auth/register - open access (new customer self sign-up)
router.post('/register', authController.register);

// POST /api/auth/logout - requires a valid token
router.post('/logout', authMock, authController.logout);

module.exports = router;