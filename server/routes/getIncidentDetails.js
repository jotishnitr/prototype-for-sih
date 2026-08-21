const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const getIncidentsDetails = require('../controllers/getIncidentsDetails');
router.route('/getIncidentsDetails').get(auth, getIncidentsDetails);
module.exports = router;