const express = require('express');
const router = express.Router();
const refresh = require('../controllers/refresh');

router.route('/refresh').post(refresh);

module.exports = router;
