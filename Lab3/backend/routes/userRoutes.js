const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const sendMail = require('../utils/mail');
const User = require('../models/User');
const authenticateToken = require('../middlewares/authenticateToken');
const checkAdmin = require('../middlewares/checkAdmin');
const bcrypt = require('bcryptjs');

// Функції валідації даних користувача
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

const validatePassword = (password) => {
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return re.test(password);
};

const validateName = (name) => {
    const re = /^[A-Za-zА-Яа-я]{2,}$/;
    return re.test(name);
};

// Отримання всіх користувачів (тільки для адміністратора)
router.get('/', authenticateToken, checkAdmin, async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Отримання користувача за ID (тільки для адміністратора)
router.get('/:id', checkAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Видалення власного акаунту користувачем
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await User.deleteOne({ _id: req.user.id });
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Видалення користувача адміністратором
router.delete('/admin/:id', authenticateToken, checkAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await User.deleteOne({ _id: req.params.id });
        res.json({ message: 'User deleted by admin' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Оновлення профілю користувача
router.put('/update-profile', authenticateToken, async (req, res) => {
    try {
        const { email, name, newPassword } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Оновлення даних користувача
        user.name = name || user.name;
        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
        }

        const updatedUser = await user.save();
        res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error:', error);
        res.status(400).json({ message: error.message });
    }
});

// Оновлення даних користувача з валідацією
router.put('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { role, name, email, password } = req.body;

        if (email) {
            if (!validateEmail(email)) {
                return res.status(400).json({ message: 'Invalid email format' });
            }
            user.email = email;
        }

        if (name) {
            if (!validateName(name)) {
                return res.status(400).json({ message: 'Invalid name format. Use only letters, minimum 2 characters' });
            }
            user.name = name;
        }

        if (password) {
            if (!validatePassword(password)) {
                return res.status(400).json({ 
                    message: 'Password must be at least 8 characters long and contain both letters and numbers' 
                });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        if (role) {
            user.role = role;
        }

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Відновлення паролю через email
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Генерація нового паролю та його відправка на email
        const newPassword = crypto.randomBytes(8).toString('hex');
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        await sendMail(user.email, 'Password Reset', `Your new password is: ${newPassword}`);

        res.json({ message: 'New password sent to your email' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
