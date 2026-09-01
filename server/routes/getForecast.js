const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const getForecast = require('../controllers/getForecast');

router.route('/getForecast').get(auth, getForecast);
router.route('/forecast').get(auth, getForecast);

module.exports = router;
