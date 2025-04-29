const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Перевірка наявності всіх необхідних полів при реєстрації
const validateRegister = (req, res, next) => {
    const { role, name, email, password } = req.body;
    if (!role) return res.status(400).json({ message: 'Role is required' });
    if (!name) return res.status(400).json({ message: 'Name is required' });
    if (!email) return res.status(400).json({ message: 'Email is required' });
    if (!password) return res.status(400).json({ message: 'Password is required' });
    next();
};

// Перевірка наявності email та паролю при вході
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    if (!password) return res.status(400).json({ message: 'Password is required' });
    next();
};

// Реєстрація нового користувача з хешуванням паролю
router.post('/register', validateRegister, async (req, res) => {
    const { role, name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ role, name, email, password: hashedPassword });

    try {
        const savedUser = await user.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Вхід користувача та генерація JWT токена
router.post('/login', validateLogin, async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;