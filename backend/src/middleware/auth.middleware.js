const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({ success: false, error: 'User not found' });
        }

        if (!req.user.isActive) {
            return res.status(403).json({ success: false, error: 'User account is deactivated' });
        }

        next();
    } catch (err) {
        logger.error('Auth Middleware Error:', err);
        return res.status(401).json({ success: false, error: 'Not authorized token failed' });
    }
};

module.exports = { protect };
