const User = require('../Models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Device = require('../Models/Device');

/**
 * @function register
 * @description Register a new user
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
exports.register = async (req, res) => {
  const { username, password, role, email, ownerData, vetData } = req.body;

  try {
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      username,
      password: hashedPassword,
      role,
      email,
      ownerData: role === 'owner' ? ownerData : undefined,
      vetData: role === 'admin' ? vetData : undefined
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @function login
 * @description Log in a user
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
exports.login = async (req, res) => {
  const { username, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = { user: { id: user._id, role: user.role } };
    jwt.sign(payload, 'secret', { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @function iotAuth
 * @description Log in an IoT device
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
exports.iotAuth = async (req, res) => {
  const { deviceId, secret } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const device = await Device.findOne({ _id: deviceId, secret });
    if (!device) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = { device: { id: device._id, role: 'iot' } };
    jwt.sign(payload, 'secret', { expiresIn: "1h" }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @function verify
 * @description Verify the token and return user data
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
exports.verify = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, 'secret');
    const user = await User.findById(decoded.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
