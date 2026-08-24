const { sign } = require('jsonwebtoken');

const createAcessToken = (id) => {
    return sign({ id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' })
}
const createRefreshToken = (id) => {
    return sign({ id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: 15 * 24 * 60 * 60 })
}

const sendAcessToken = (req, res, accesstoken) => {
    res.cookie('accesstoken', accesstoken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true
    });
    res.json({
        accesstoken,
        message: "Sign in sucessfull",
        type: "success",
    });
}

const sendRefreshToken = (res, refreshtoken) => {
    res.cookie('refreshtoken', refreshtoken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true
    });
}

module.exports = { createAcessToken, createRefreshToken, sendAcessToken, sendRefreshToken }