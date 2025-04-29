const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const OrderItem = require('../models/OrderItem');

const authenticateToken = require('../middlewares/authenticateToken');
const checkAdmin = require('../middlewares/checkAdmin');

// Створення резервної копії всіх даних системи
router.get('/backup', authenticateToken, checkAdmin, async (req, res) => {
    try {
        // Збір всіх даних з бази
        const data = {
            orders: await Order.find(),
            users: await User.find(),
            products: await Product.find(),
            payments: await Payment.find(),
            orderItems: await OrderItem.find(),
            timestamp: new Date().toISOString()
        };

        // Створення унікальної назви файлу з поточною датою
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(__dirname, '../backups', `backup-${timestamp}.json`);
        
        // Збереження даних у файл
        fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
        
        res.json({ 
            message: 'Backup created successfully', 
            path: backupPath 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Експорт даних у JSON формат для подальшого використання
router.get('/export', authenticateToken, checkAdmin, async (req, res) => {
    try {
        const data = {
            orders: await Order.find(),
            users: await User.find(),
            products: await Product.find()
        };

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const exportPath = path.join(__dirname, '../exports', `export-${timestamp}.json`);
        
        // Створення директорії якщо не існує
        if (!fs.existsSync(path.join(__dirname, '../exports'))) {
            fs.mkdirSync(path.join(__dirname, '../exports'));
        }

        fs.writeFileSync(exportPath, JSON.stringify(data, null, 2));
        
        // Відправка файлу користувачу
        res.download(exportPath);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Імпорт даних з JSON формату до бази даних
router.post('/import', authenticateToken, checkAdmin, async (req, res) => {
    try {
        const importData = req.body;

        // Перевірка наявності даних для імпорту
        if (!importData.orders && !importData.products && !importData.users) {
            return res.status(400).json({ message: 'No valid data provided for import' });
        }

        // Додавання нових даних до бази
        if (importData.orders) {
            await Order.insertMany(importData.orders);
        }
        if (importData.products) {
            await Product.insertMany(importData.products);
        }
        if (importData.users) {
            await User.insertMany(importData.users);
        }

        res.json({ 
            message: 'Data imported successfully',
            imported: {
                orders: importData.orders?.length || 0,
                products: importData.products?.length || 0,
                users: importData.users?.length || 0
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Відновлення системи з резервної копії
router.post('/restore', authenticateToken, checkAdmin, async (req, res) => {
    try {
        const { backupPath } = req.body;
        
        if (!fs.existsSync(backupPath)) {
            return res.status(404).json({ message: "Backup file not found" });
        }

        // Читання та парсинг файлу бекапу
        let backupData;
        try {
            const fileContent = fs.readFileSync(backupPath, 'utf8');
            backupData = JSON.parse(fileContent);
        } catch (error) {
            return res.status(400).json({ message: "Error reading backup file", error: error.message });
        }

        // Перевірка структури даних
        if (!backupData.orders || !backupData.users || !backupData.products) {
            return res.status(400).json({ message: "Invalid backup file structure" });
        }

        // Видалення поточних даних
        await Promise.all([
            Order.deleteMany({}),
            User.deleteMany({}),
            Product.deleteMany({}),
            Payment.deleteMany({}),
            OrderItem.deleteMany({})
        ]);

        // Відновлення даних з бекапу
        await Promise.all([
            Order.insertMany(backupData.orders),
            User.insertMany(backupData.users),
            Product.insertMany(backupData.products),
            backupData.payments && Payment.insertMany(backupData.payments),
            backupData.orderItems && OrderItem.insertMany(backupData.orderItems)
        ]);

        res.json({ 
            message: 'Backup restored successfully',
            restoredData: {
                orders: backupData.orders.length,
                users: backupData.users.length,
                products: backupData.products.length,
                payments: backupData.payments?.length || 0,
                orderItems: backupData.orderItems?.length || 0
            }
        });
    } catch (error) {
        console.error('Restore error:', error);
        res.status(500).json({ 
            message: "Error restoring backup", 
            error: error.message,
            stack: error.stack 
        });
    }
});

module.exports = router;