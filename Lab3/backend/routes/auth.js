const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Private (admin)
 */
router.post(
  '/register',
  authMiddleware,
  roleMiddleware(['admin']),
  [
    check('username', 'Username is required').not().isEmpty(),
    check('password', 'Password is required').isLength({ min: 6 }),
    check('role', 'Role is required').isIn(['admin', 'vet', 'owner'])
  ],
  authController.register
);

/**
 * @route POST /api/auth/login
 * @desc Login a user
 * @access Public
 */
router.post(
  '/login',
  [
    check('username', 'Username is required').not().isEmpty(),
    check('password', 'Password is required').exists()
  ],
  authController.login
);

/**
 * @route POST /api/auth/iot
 * @desc Authenticate an IOT device
 * @access Private (admin)
 */
router.post(
  '/iot',  
  roleMiddleware(['admin']),
  [
    check('deviceId', 'Device ID is required').not().isEmpty(),
    check('secret', 'Secret is required').not().isEmpty()
  ],
  authController.iotAuth
);

/**
 * @route GET /api/auth/verify
 * @desc Verify JWT token and return user/device info
 * @access Public
 */
router.get('/verify', authMiddleware, authController.verify);

module.exports = router;