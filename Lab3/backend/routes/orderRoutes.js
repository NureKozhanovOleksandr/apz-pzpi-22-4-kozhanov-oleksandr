const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const authenticateToken = require('../middlewares/authenticateToken');
const checkAdmin = require('../middlewares/checkAdmin');

// Отримання замовлень поточного користувача
router.get('/my-orders', authenticateToken, async (req, res) => {
    try {
        const orders = await Order.find({ user_id: req.user.id }).populate('user_id');
        if (!orders.length) {
            return res.status(404).json({ message: 'You have no orders yet' });
        }
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Отримання всіх замовлень (тільки для адміністратора)
router.get('/', checkAdmin, async (req, res) => {
    try {
        const orders = await Order.find().populate('user_id');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Пошук замовлення за ID
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user_id');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Отримання всіх замовлень конкретного користувача
router.get('/user/:userId', async (req, res) => {
    try {
        const orders = await Order.find({ user_id: req.params.userId }).populate('user_id');
        if (!orders.length) {
            return res.status(404).json({ message: 'Orders not found for this user' });
        }
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Фільтрація замовлень за статусом
router.get('/status/:status', async (req, res) => {
    try {
        const orders = await Order.find({ status: req.params.status }).populate('user_id');
        if (!orders.length) {
            return res.status(404).json({ message: 'Orders not found with this status' });
        }
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Пошук замовлень за діапазоном дат
router.get('/date/:startDate/:endDate', async (req, res) => {
    try {
        const { startDate, endDate } = req.params;
        const orders = await Order.find({
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }).populate('user_id');
        if (!orders.length) {
            return res.status(404).json({ message: 'No orders found in this date range' });
        }
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Перевірка правильності даних замовлення
const validateOrder = (req, res, next) => {
    const { user_id, total_price, status } = req.body;
    if (!user_id) return res.status(400).json({ message: 'User ID is required' });
    if (typeof total_price !== 'number' || total_price <= 0) return res.status(400).json({ message: 'Total price must be a positive number' });
    if (!status) return res.status(400).json({ message: 'Status is required' });
    next();
};

// Створення нового замовлення
router.post('/', validateOrder, async (req, res) => {
    const { user_id, total_price, status } = req.body;
    const order = new Order({ user_id, total_price, status });

    try {
        const savedOrder = await order.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Видалення замовлення (тільки для адміністратора)
router.delete('/:id', authenticateToken, checkAdmin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        await Order.deleteOne({ _id: req.params.id });
        res.json({ message: 'Order deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
