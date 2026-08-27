const express = require('express');
const router = express.Router();
const precautions = require('../utils/precautions');

router.route('/precautions').post(precautions).get(precautions);

module.exports = router;
