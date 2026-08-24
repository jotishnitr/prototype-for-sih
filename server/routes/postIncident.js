const express = require('express');
const router = express.Router();
const postIncident = require('../controllers/postIncident');

// Public route to allow anyone to submit emergency incident reports
router.route('/postIncident').post(postIncident);

module.exports = router;