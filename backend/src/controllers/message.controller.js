/**
 * Message Controller
 * ------------------
 * REST endpoint for loading chat history from MySQL. Live sending happens
 * over WebSockets (socket/index.js); this is only for fetching past messages
 * when a client first opens the chat.
 */

const { Message } = require('../../models');

const sendError = (res, status, code, message, details = {}) =>
  res.status(status).json({ success: false, data: null, error: { code, message, details } });

const sendSuccess = (res, status, data) =>
  res.status(status).json({ success: true, data, error: null });

module.exports = {
  // GET /api/messages — return the most recent 50 messages, oldest first
  getMessages: async (req, res, next) => {
    try {
      const messages = await Message.findAll({
        order: [['createDate', 'DESC']],
        limit: 50,
      });
      // reverse so the client renders oldest -> newest
      return sendSuccess(res, 200, messages.reverse());
    } catch (err) { next(err); }
  },
};