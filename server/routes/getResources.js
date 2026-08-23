const express = require('express');
const router = express.Router();
const getResources = require('../controllers/getResources');
const auth = require('../middlewares/auth');

router.route('/getResourcesDetails').get(auth, getResources);
router.route('/getResources').get(auth, getResources);

module.exports = router;
