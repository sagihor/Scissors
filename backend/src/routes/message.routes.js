const express = require('express');
const router = express.Router();

const messageController = require('../controllers/message.controller');

// GET /api/messages - load recent chat history (public)
router.get('/', messageController.getMessages);

module.exports = router;