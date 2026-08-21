const User = require('../models/User');

const signout = async (req, res) => {
    try {
        const token = req.cookies.refreshtoken;
        if (token) {
            await User.findOneAndUpdate({ refreshToken: token }, { refreshToken: "" });
        }
        res.clearCookie("refreshtoken");
        return res.status(200).json({
            message: "User signed out successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error during signout" });
    }
}

module.exports = signout;