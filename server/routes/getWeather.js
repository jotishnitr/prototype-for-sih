const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const getWeather = require('../controllers/getWeather');
router.route('/getWeather').get(auth, getWeather);
module.exports = router;
