const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const authenticateToken = require('../middlewares/authenticateToken');
const checkAdmin = require('../middlewares/checkAdmin');

// Отримання платежів поточного користувача
router.get('/my-payments', authenticateToken, async (req, res) => {
    try {
        const payments = await Payment.find({ user_id: req.user.id }).populate(['order_id', 'user_id', 'product_id']);
        if (!payments.length) {
            return res.status(404).json({ message: 'You have no payments yet' });
        }
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Отримання всіх платежів (тільки для адміністратора)
router.get('/', checkAdmin, async (req, res) => {
    try {
        const payments = await Payment.find().populate(['order_id', 'user_id', 'product_id']);
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Пошук платежів за ID замовлення
router.get('/order/:orderId', async (req, res) => {
    try {
        const payments = await Payment.find({ order_id: req.params.orderId }).populate(['order_id', 'user_id', 'product_id']);
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Пошук платежів за ID користувача
router.get('/user/:userId', async (req, res) => {
    try {
        const payments = await Payment.find({ user_id: req.params.userId }).populate(['order_id', 'user_id', 'product_id']);
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Фільтрація платежів за статусом
router.get('/status/:status', async (req, res) => {
    try {
        const payments = await Payment.find({ status: req.params.status }).populate(['order_id', 'user_id', 'product_id']);
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Перевірка правильності даних платежу
const validatePayment = (req, res, next) => {
    const { order_id, user_id, product_id, amount, status } = req.body;
    if (!order_id) return res.status(400).json({ message: 'Order ID is required' });
    if (!user_id) return res.status(400).json({ message: 'User ID is required' });
    if (!product_id) return res.status(400).json({ message: 'Product ID is required' });
    if (typeof amount !== 'number' || amount <= 0) return res.status(400).json({ message: 'Amount must be a positive number' });
    if (!status) return res.status(400).json({ message: 'Status is required' });
    next();
};

// Створення нового платежу
router.post('/', validatePayment, async (req, res) => {
    const { order_id, user_id, product_id, amount, status } = req.body;
    const payment = new Payment({ order_id, user_id, product_id, amount, status });

    try {
        const savedPayment = await payment.save();
        res.status(201).json(savedPayment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Видалення платежу (тільки для адміністратора)
router.delete('/:id', authenticateToken, checkAdmin, async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) return res.status(404).json({ message: 'Payment not found' });

        await Payment.deleteOne({ _id: req.params.id });
        res.json({ message: 'Payment deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
