const User = require('../models/User');

// Middleware для перевірки чи має користувач права адміністратора
const checkAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = checkAdmin;