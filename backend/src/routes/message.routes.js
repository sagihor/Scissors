const express = require('express');
const router = express.Router();

const messageController = require('../controllers/message.controller');
const authMock = require('../middleware/authMock');
const requireRole = require('../middleware/requireRole');

// GET /api/messages - load recent chat history (public)
router.get('/', messageController.getMessages);

// DELETE /api/messages - clear all chat history (admin only)
router.delete('/', authMock, requireRole('admin'), messageController.clearMessages);

module.exports = router;