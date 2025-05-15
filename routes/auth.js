const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

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
 * @route GET /api/auth/verify
 * @desc Verify JWT token and return user/device info
 * @access Public
 */
router.get('/verify', authMiddleware, authController.verify);

module.exports = router;