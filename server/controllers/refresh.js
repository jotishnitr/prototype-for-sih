const { verify } = require('jsonwebtoken');
const { createAcessToken, sendAcessToken } = require('../utils/token');
const User = require('../models/User');

const refresh = async (req, res) => {
    try {
        const token = req.cookies.refreshtoken;
        if (!token) {
            return res.status(401).json({ message: "Refresh token not provided" });
        }

        // Verify the refresh token
        let decoded;
        try {
            decoded = verify(token, process.env.REFRESH_TOKEN_SECRET);
        } catch (err) {
            return res.status(403).json({ message: "Invalid or expired refresh token" });
        }

        // Find the user and verify the token matches the one in DB
        const user = await User.findById(decoded.id);
        if (!user || user.refreshToken !== token) {
            return res.status(403).json({ message: "Invalid or expired refresh token" });
        }

        // Create new access token
        const acessToken = createAcessToken(user.id);

        // Send access token in the Authorization header (for consistency)
        res.setHeader('Authorization', `Bearer ${acessToken}`);

        // Return the access token to the client
        return sendAcessToken(req, res, acessToken);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error during token refresh" });
    }
};

module.exports = refresh;
