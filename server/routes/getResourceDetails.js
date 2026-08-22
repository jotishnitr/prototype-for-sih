const express = require('express');
const router = express.Router();
const getResourceDetails = require('../controllers/getResourceDetails');
const auth = require('../middlewares/auth');
router.route('/getResourceDetails').get(auth, getResourceDetails);
module.exports = router;
