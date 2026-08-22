const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const autoAllocate = require('../controllers/autoAllocate');

router.route('/autoAllocate/:id').post(auth, autoAllocate);

module.exports = router;
