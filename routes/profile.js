const express = require('express');
const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/profileController');

const router = express.Router();

router.get('/', authenticate, controller.getProfile);

module.exports = router;
