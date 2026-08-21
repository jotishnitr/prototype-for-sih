const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const postAllocate = require('../controllers/postAllocate');
router.route('/postAllocate').post(auth, postAllocate);

module.exports = router;