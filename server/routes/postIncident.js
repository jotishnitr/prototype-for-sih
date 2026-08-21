const express = require('express');
const router = express.Router();
const postIncident = require('../controllers/PostIncident');
const auth = require('../middlewares/auth');

router.route('/postIncident').post(auth, postIncident);
module.exports = router;