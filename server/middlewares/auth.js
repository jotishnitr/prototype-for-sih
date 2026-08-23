const { verify } = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        let token;
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (req.cookies && req.cookies.refreshtoken) {
            token = req.cookies.refreshtoken;
        } else if (req.cookies && req.cookies.accesstoken) {
            token = req.cookies.accesstoken;
        }

        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        let decoded;
        try {
            decoded = verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (err) {
            decoded = verify(token, process.env.REFRESH_TOKEN_SECRET);
        }

        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
}

module.exports = auth;
