const express = require('express');
const router = express.Router();
const webController = require('../controllers/webController');
const { requireAuth } = require('../middleware/auth');

router.get('/', webController.listItems);
router.get('/item/:id', webController.showItem);
router.get('/login', webController.showLogin);

router.get('/add', requireAuth, webController.showAddForm);
router.post('/add', requireAuth, webController.createItem);

module.exports = router;
