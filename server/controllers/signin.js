const { hash, compare } = require('bcryptjs');
const { createAcessToken, createRefreshToken, sendAcessToken, sendRefreshToken } = require('../utils/token');
const User = require('../models/User');

const signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });
        if (!user) return res.status(401).json({ message: 'User does not exist' });

        const isMatch = await compare(password, user.password);
        if (!isMatch) {
            return res.status(500).json({
                message: "Password is incorrect"
            })
        }
        const acessToken = createAcessToken(user.id);
        const refreshToken = createRefreshToken(user.id);

        // Store refresh token in database
        user.refreshToken = refreshToken;
        await user.save();

        // Send refresh token as HTTP-only cookie
        sendRefreshToken(res, refreshToken);

        // Send access token in the Authorization header
        res.setHeader('Authorization', `Bearer ${acessToken}`);

        // Send access token (passing req, res, token to match helper signature)
        return sendAcessToken(req, res, acessToken);
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = signin;