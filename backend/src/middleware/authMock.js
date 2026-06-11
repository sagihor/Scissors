/**
 * Mock authentication middleware.
 * Reads "Authorization: Bearer mock-token-<userId>", looks the user up in
 * MySQL via Sequelize, and attaches the user object to req.user.
 * NOTE: "mock" here refers to the token verification strategy, NOT the data.
 * (mock-token-<userId>) is a simplified stand-in for real JWT verification,
 * which is outside this assignment's scope.
 */

const { User } = require('../../models');

const ROLE_MAP = { admin: 'admin', manager: 'manager' }; // others -> 'user'

const authMock = async (req, res, next) => {
  try {
    const header = req.headers['authorization'];
    const fail = (msg) =>
      res.status(401).json({ success: false, data: null, error: { code: 'UNAUTHORIZED', message: msg, details: {} } });

    if (!header || !header.startsWith('Bearer ')) return fail('Missing or malformed Authorization header.');

    const match = header.slice(7).match(/^mock-token-(\d+)$/);
    if (!match) return fail('Invalid token format.');

    const user = await User.findByPk(parseInt(match[1]));
    if (!user) return fail('Token references a non-existent user.');

    req.user = user;
    req.headers['x-user-role'] = ROLE_MAP[user.userRole] || 'user';
    req.headers['x-user-id'] = String(user.userId);
    next();
  } catch (err) { next(err); }
};

module.exports = authMock;