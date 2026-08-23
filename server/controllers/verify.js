const verify = async (req, res) => {
    try {
        // req.user is attached by auth middleware
        return res.status(200).json({
            status: 'success',
            message: 'Token verified successfully',
            user: req.user
        });
    } catch (error) {
        console.error('Verification error:', error);
        return res.status(500).json({ message: 'Server error during verification' });
    }
};

module.exports = verify;
