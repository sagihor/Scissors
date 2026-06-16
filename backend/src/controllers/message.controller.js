/**
 * Message Controller
 * ------------------
 * REST endpoint for loading chat history from MySQL. Live sending happens
 * over WebSockets (socket/index.js); this is only for fetching past messages
 * when a client first opens the chat.
 */

const { Message } = require('../../models');
const { broadcastChatCleared } = require('../socket');

const sendError = (res, status, code, message, details = {}) =>
  res.status(status).json({ success: false, data: null, error: { code, message, details } });

const sendSuccess = (res, status, data) =>
  res.status(status).json({ success: true, data, error: null });

module.exports = {
  // GET /api/messages — return the most recent 50 messages, oldest first
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

  // DELETE /api/messages — wipe all chat history (admin only).
  // Route-level middleware already enforces the admin role.
  clearMessages: async (req, res, next) => {
    try {
      const deleted = await Message.destroy({ where: {}, truncate: false });
      broadcastChatCleared(); // tell all clients to empty their chat live
      return sendSuccess(res, 200, { deleted });
    } catch (err) { next(err); }
  },
};