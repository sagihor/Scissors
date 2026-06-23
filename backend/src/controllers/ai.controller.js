/**
 * AI Controller
 * -------------
 * Exposes the AI recommender endpoint. The frontend calls THIS endpoint;
 * the backend calls Gemini. The provider key stays server-side.
 */

const { recommendBarbershop } = require('../services/ai.service');

const sendError = (res, status, code, message, details = {}) =>
  res.status(status).json({ success: false, data: null, error: { code, message, details } });

const sendSuccess = (res, status, data) =>
  res.status(status).json({ success: true, data, error: null });

module.exports = {
  // POST /api/ai/recommend  body: { request: "cheap fade in Tel Aviv" }
  recommend: async (req, res, next) => {
    try {
      const { request } = req.body;

      if (!request || typeof request !== 'string' || !request.trim()) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'A "request" text is required.', {
          field: 'request',
        });
      }
      if (request.trim().length < 3) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'The request must be at least 3 characters.', {
          field: 'request',
        });
      }

      const recommendation = await recommendBarbershop(request.trim());
      return sendSuccess(res, 200, { recommendation });
    } catch (err) {
      // Surface a clean AI error instead of a 500 stack
      console.error('AI error:', err.message);
      return sendError(res, 502, 'AI_ERROR', 'The AI service is unavailable right now.', {
        detail: err.message,
      });
    }
  },
};