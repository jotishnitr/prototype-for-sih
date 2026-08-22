const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const deleteResources = require('../controllers/deleteResources');

router.route('/deleteResources').delete(auth, deleteResources);

module.exports = router;
