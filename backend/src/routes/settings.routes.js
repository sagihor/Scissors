const express = require('express');
const router = express.Router();

const settingsController = require('../controllers/settings.controller');
const authMock = require('../middleware/authMock');

// All settings endpoints require a valid token
router.get('/', authMock, settingsController.get);
router.put('/', authMock, settingsController.update);

module.exports = router;