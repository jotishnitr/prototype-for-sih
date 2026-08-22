const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const postResource = require('../controllers/postResource');

router.route('/postResource').post(auth, postResource);

module.exports = router;
