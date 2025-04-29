const jwt = require('jsonwebtoken');

/**
 * Middleware to check the authorization token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
module.exports = function (requiredRoles) {
  return function (req, res, next) {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Access denied. No role found.' });
    }

    const userRole = req.user.role;
    if (!requiredRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Access denied. Insufficient role.' });
    }

    next();
  };
};