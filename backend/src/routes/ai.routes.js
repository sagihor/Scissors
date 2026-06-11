const express = require('express');
const router = express.Router();

const aiController = require('../controllers/ai.controller');

// POST /api/ai/recommend - get an AI barbershop recommendation
router.post('/recommend', aiController.recommend);

module.exports = router;