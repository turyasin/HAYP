const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.post('/sync', inventoryController.syncWithGoogleSheets);
router.get('/', inventoryController.getInventory);

module.exports = router;
