const express = require('express');
const router = express.Router();
const postJurisdiction = require('../controllers/postJurisdiction');

router.route('/postJurisdiction').post(postJurisdiction);

module.exports = router;
