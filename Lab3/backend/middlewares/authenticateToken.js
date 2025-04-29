const jwt = require('jsonwebtoken');

// Middleware для перевірки автентифікації користувача через JWT токен
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
};

module.exports = authenticateToken;
