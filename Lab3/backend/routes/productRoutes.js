const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const authenticateToken = require('../middlewares/authenticateToken');
const checkAdmin = require('../middlewares/checkAdmin');

// Отримання всіх продуктів
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Пошук продукту за ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Фільтрація продуктів за різними параметрами
router.get('/brand/:brand', async (req, res) => {
    try {
        const products = await Product.find({ brand: req.params.brand });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/size/:size', async (req, res) => {
    try {
        const products = await Product.find({ size: req.params.size });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/type/:type', async (req, res) => {
    try {
        const products = await Product.find({ type: req.params.type });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Пошук продуктів за ціновим діапазоном
router.get('/price/:min/:max', async (req, res) => {
    try {
        const products = await Product.find({
            price: { $gte: req.params.min, $lte: req.params.max }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Пошук продуктів за кількістю на складі
router.get('/quantity/:min/:max', async (req, res) => {
    try {
        const products = await Product.find({
            quantity: { $gte: req.params.min, $lte: req.params.max }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.use(authenticateToken);

// Перевірка правильності даних продукту
const validateProduct = (req, res, next) => {
    const { name, description, brand, size, type, price, quantity, releaseDate } = req.body;

    if (!name) return res.status(400).json({ message: 'Name is required' });
    if (!description) return res.status(400).json({ message: 'Description is required' });
    if (!brand) return res.status(400).json({ message: 'Brand is required' });
    if (!size) return res.status(400).json({ message: 'Size is required' });
    if (!type) return res.status(400).json({ message: 'Type is required' });
    if (typeof price !== 'number' || price <= 0) return res.status(400).json({ message: 'Price must be a positive number' });
    if (typeof quantity !== 'number' || quantity < 0) return res.status(400).json({ message: 'Quantity must be a non-negative number' });

    next();
};

// Створення нового продукту (тільки для адміністратора)
router.post('/', checkAdmin, validateProduct, async (req, res) => {
    const { name, description, brand, size, type, price, quantity } = req.body;
    const product = new Product({ name, description, brand, size, type, price, quantity });

    try {
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Видалення продукту (тільки для адміністратора)
router.delete('/:id', authenticateToken, checkAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        await Product.deleteOne({ _id: req.params.id });
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Оновлення інформації про продукт (тільки для адміністратора)
router.put('/:id', authenticateToken, checkAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const { name, description, brand, size, type, price, quantity } = req.body;
        product.name = name || product.name;
        product.description = description || product.description;
        product.brand = brand || product.brand;
        product.size = size || product.size;
        product.type = type || product.type;
        product.price = price || product.price;
        product.quantity = quantity || product.quantity;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
