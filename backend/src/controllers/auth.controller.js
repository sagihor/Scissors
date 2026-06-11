/**
 * Auth Controller
 * ---------------
 * Login / logout / "me" using Sequelize-backed users.
 * Still issues the simple mock-token-<userId> token from previous assignments.
 */

const { User } = require('../../models');

const sendError = (res, status, code, message, details = {}) =>
  res.status(status).json({ success: false, data: null, error: { code, message, details } });

const sendSuccess = (res, status, data) =>
  res.status(status).json({ success: true, data, error: null });

const publicUser = (u) => ({
  userId: u.userId, firstName: u.firstName, lastName: u.lastName,
  username: u.username, email: u.email, userRole: u.userRole,
});

module.exports = {
  // POST /api/auth/login
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return sendError(res, 400, 'VALIDATION_ERROR', 'Email and password are required.', { required: ['email', 'password'] });
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid email format.', { field: 'email' });
      if (password.length < 6)
        return sendError(res, 400, 'VALIDATION_ERROR', 'Password must be at least 6 characters.', { field: 'password' });

      const user = await User.findOne({ where: { email } });
      if (!user || user.password !== password)
        return sendError(res, 401, 'INVALID_CREDENTIALS', 'Invalid email or password.');

      const token = `mock-token-${user.userId}`;
      return sendSuccess(res, 200, { token, user: publicUser(user) });
    } catch (err) { next(err); }
  },

  // POST /api/auth/logout
  logout: (req, res) => sendSuccess(res, 200, { message: 'Logged out.' }),

  // GET /api/users/me
  me: (req, res) => sendSuccess(res, 200, publicUser(req.user)),
};