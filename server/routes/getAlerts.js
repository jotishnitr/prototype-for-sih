const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const getAlerts = require('../controllers/getAlerts');
router.route('/getAlerts').get(auth, getAlerts);
module.exports = router;
