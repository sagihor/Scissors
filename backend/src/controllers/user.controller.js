/**
 * User Controller
 * ---------------
 * Full CRUD for users backed by Sequelize / MySQL.
 * Passwords are never returned to the client (see toPublic()).
 */

const { User } = require('../../models');

const sendError = (res, status, code, message, details = {}) =>
  res.status(status).json({ success: false, data: null, error: { code, message, details } });

const sendSuccess = (res, status, data) =>
  res.status(status).json({ success: true, data, error: null });

// Strip the password before sending a user to the client
const toPublic = (u) => ({
  userId: u.userId, firstName: u.firstName, lastName: u.lastName,
  username: u.username, email: u.email, userRole: u.userRole,
});

module.exports = {
  // GET /api/users — list all users
  getAllUsers: async (req, res, next) => {
    try {
      const users = await User.findAll();
      return sendSuccess(res, 200, users.map(toPublic));
    } catch (err) { next(err); }
  },

  // GET /api/users/:id — one user
  getUserById: async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return sendError(res, 404, 'NOT_FOUND', `User with ID ${req.params.id} not found.`);
      return sendSuccess(res, 200, toPublic(user));
    } catch (err) { next(err); }
  },

  // POST /api/users — create
  createUser: async (req, res, next) => {
    try {
      const { firstName, lastName, userRole } = req.body;
      if (!firstName || !lastName || !userRole) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Missing required fields.', {
          required: ['firstName', 'lastName', 'userRole'],
        });
      }
      const newUser = await User.create({ firstName, lastName, userRole });
      return sendSuccess(res, 201, { userId: newUser.userId });
    } catch (err) { next(err); }
  },

  // PUT /api/users/:id — update
  updateUser: async (req, res, next) => {
    try {
      const { firstName, lastName, userRole } = req.body;
      if (!firstName || !lastName || !userRole) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Missing required fields for update.', {
          required: ['firstName', 'lastName', 'userRole'],
        });
      }
      const user = await User.findByPk(req.params.id);
      if (!user) return sendError(res, 404, 'NOT_FOUND', `User with ID ${req.params.id} not found.`);

      await user.update({ firstName, lastName, userRole });
      return sendSuccess(res, 200, { userId: user.userId });
    } catch (err) { next(err); }
  },

  // DELETE /api/users/:id — delete
  deleteUser: async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return sendError(res, 404, 'NOT_FOUND', `User with ID ${req.params.id} not found.`);

      await user.destroy();
      return sendSuccess(res, 200, { userId: parseInt(req.params.id) });
    } catch (err) { next(err); }
  },
};