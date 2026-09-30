const express = require('express');
const controller = require('../controllers/campaignController');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');

const router = express.Router();

router.get('/', controller.list);
router.get('/:id', controller.getOne);

router.post('/', authenticate, controller.create);
router.put('/:id', authenticate, controller.replace);
router.delete('/:id', authenticate, isAdmin, controller.remove);

module.exports = router;
