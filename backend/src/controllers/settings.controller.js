/**
 * Settings Controller
 * -------------------
 * Reads/updates per-user preferences (theme) and profile fields (username,
 * email) using Sequelize. Each user has exactly one Setting row.
 */

const { User, Setting } = require('../../models');

const sendError = (res, status, code, message, details = {}) =>
  res.status(status).json({ success: false, data: null, error: { code, message, details } });

const sendSuccess = (res, status, data) =>
  res.status(status).json({ success: true, data, error: null });

const VALID_THEMES = ['light', 'dark'];

// Get the user's setting row, creating a default one if missing
async function getOrCreateSetting(userId) {
  let s = await Setting.findOne({ where: { userId } });
  if (!s) s = await Setting.create({ userId, theme: 'light' });
  return s;
}

module.exports = {
  // GET /api/settings
  get: async (req, res, next) => {
    try {
      const user = req.user;
      const setting = await getOrCreateSetting(user.userId);
      return sendSuccess(res, 200, { username: user.username, email: user.email, theme: setting.theme });
    } catch (err) { next(err); }
  },

  // PUT /api/settings
  update: async (req, res, next) => {
    try {
      const { username, email, theme } = req.body;

      if (username !== undefined && (typeof username !== 'string' || !username.trim()))
        return sendError(res, 400, 'VALIDATION_ERROR', 'Username cannot be empty.', { field: 'username' });
      if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid email format.', { field: 'email' });
      if (theme !== undefined && !VALID_THEMES.includes(theme))
        return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid theme.', { field: 'theme', allowed: VALID_THEMES });

      const user = await User.findByPk(req.user.userId);

      // Uniqueness checks for username / email
      const { Op } = require('sequelize');
      if (username !== undefined && username.trim() !== user.username) {
        const clash = await User.findOne({ where: { username: username.trim(), userId: { [Op.ne]: user.userId } } });
        if (clash) return sendError(res, 409, 'CONFLICT', 'Username is already taken.', { field: 'username' });
        user.username = username.trim();
      }
      if (email !== undefined && email !== user.email) {
        const clash = await User.findOne({ where: { email, userId: { [Op.ne]: user.userId } } });
        if (clash) return sendError(res, 409, 'CONFLICT', 'Email is already taken.', { field: 'email' });
        user.email = email;
      }
      await user.save();

      const setting = await getOrCreateSetting(user.userId);
      if (theme !== undefined) { setting.theme = theme; await setting.save(); }

      return sendSuccess(res, 200, { username: user.username, email: user.email, theme: setting.theme });
    } catch (err) { next(err); }
  },
};