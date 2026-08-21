const express = require('express');
const router = express.Router();
const signout = require('../controllers/signout');

router.route('/signout').post(signout);

module.exports = router;
