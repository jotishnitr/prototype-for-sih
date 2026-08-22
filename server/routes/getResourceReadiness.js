const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const getResourceReadiness = require('../controllers/getResourceReadiness');

router.route('/getResourceReadiness').get(auth, getResourceReadiness);

module.exports = router;
