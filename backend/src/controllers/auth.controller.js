/**
 * Auth Controller
 * ---------------
 * Login / logout / "me" using Sequelize-backed users.
 * Still issues the simple mock-token-<userId> token from previous assignments.
 */

const { User } = require('../../models');

// Default location for brand-new users — identical to the value seeded for
// existing users (Dizengoff Square, Tel Aviv). The user does not enter this at
// registration; it can later be changed on the Settings page. Keeping it in
// sync with the seed means every account starts from the same point on the map.
const DEFAULT_LOCATION = {
  latitude: 32.0786,
  longitude: 34.7741,
  addressLabel: 'Dizengoff Square, Tel Aviv',
};

const sendError = (res, status, code, message, details = {}) =>
  res.status(status).json({ success: false, data: null, error: { code, message, details } });

const sendSuccess = (res, status, data) =>
  res.status(status).json({ success: true, data, error: null });

const publicUser = (u) => ({
  userId: u.userId, firstName: u.firstName, lastName: u.lastName,
  username: u.username, email: u.email, userRole: u.userRole,
  latitude: u.latitude, longitude: u.longitude, addressLabel: u.addressLabel,
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

  // POST /api/auth/register — self sign-up for a new customer.
  // Only the non-automatic / non-default user fields are accepted here:
  // firstName, lastName, username (optional), email, password. The role is
  // fixed to "customer"; id/timestamps are set by the DB; location is left
  // null (the user can set their address later in Settings).
  register: async (req, res, next) => {
    try {
      const { firstName, lastName, username, email, password } = req.body;

      if (!firstName || !lastName || !email || !password)
        return sendError(res, 400, 'VALIDATION_ERROR', 'First name, last name, email and password are required.', {
          required: ['firstName', 'lastName', 'email', 'password'],
        });
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid email format.', { field: 'email' });
      if (password.length < 6)
        return sendError(res, 400, 'VALIDATION_ERROR', 'Password must be at least 6 characters.', { field: 'password' });

      // Enforce the table's unique constraints up front with friendly messages.
      if (await User.findOne({ where: { email } }))
        return sendError(res, 409, 'EMAIL_TAKEN', 'An account with that email already exists.', { field: 'email' });
      if (username && (await User.findOne({ where: { username } })))
        return sendError(res, 409, 'USERNAME_TAKEN', 'That username is already taken.', { field: 'username' });

      const user = await User.create({
        firstName,
        lastName,
        username: username || null,
        email,
        password,
        userRole: 'customer',
        latitude: DEFAULT_LOCATION.latitude,
        longitude: DEFAULT_LOCATION.longitude,
        addressLabel: DEFAULT_LOCATION.addressLabel,
      });

      const token = `mock-token-${user.userId}`;
      return sendSuccess(res, 201, { token, user: publicUser(user) });
    } catch (err) { next(err); }
  },

  // POST /api/auth/logout
  logout: (req, res) => sendSuccess(res, 200, { message: 'Logged out.' }),

  // GET /api/users/me
  me: (req, res) => sendSuccess(res, 200, publicUser(req.user)),
};