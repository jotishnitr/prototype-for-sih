const express = require('express');
const router = express.Router();
const signin = require('../controllers/signin');

router.route('/signin').post(signin);

module.exports = router;
