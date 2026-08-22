const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const updateIncidentStatus = require('../controllers/updateIncidentStatus');

router.route('/updateIncidentStatus/:id').put(auth, updateIncidentStatus);

module.exports = router;
