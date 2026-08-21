const express = require('express');
const router = express.Router();
const getStats = require('../controllers/getStats');
const auth = require('../middlewares/auth');

router.route('/stats').get(auth, getStats);

module.exports = router;