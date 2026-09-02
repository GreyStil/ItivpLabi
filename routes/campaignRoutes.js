const express = require('express');
const router = express.Router();
const controller = require('../controllers/campaignController');

router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.replace);
router.delete('/:id', controller.remove);

module.exports = router;
