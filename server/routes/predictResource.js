const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const resourcePrediction = require('../utils/resourcePrediction');

router.route('/predictResource').post(auth, resourcePrediction);

module.exports = router;
