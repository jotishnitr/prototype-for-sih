const { sign } = require('jsonwebtoken');

const createAcessToken = (id) => {
    return sign({ id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' })
}
const createRefreshToken = (id) => {
    return sign({ id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: 15 * 24 * 60 * 60 })
}

const sendAcessToken = (req, res, accesstoken) => {
    res.json({
        accesstoken,
        message: "Sign in sucessfull",
        type: "success",
    });

}

const sendRefreshToken = (res, refreshtoken) => {
    res.cookie('refreshtoken', refreshtoken, {
        httpOnly: true,
    })
}
module.exports = { createAcessToken, createRefreshToken, sendAcessToken, sendRefreshToken }