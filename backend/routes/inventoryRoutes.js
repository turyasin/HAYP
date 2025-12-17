const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.post('/sync', inventoryController.syncWithGoogleSheets);
router.get('/', inventoryController.getInventory);
router.delete('/:id', inventoryController.deleteProduct);
router.patch('/:id', inventoryController.updateCriticalStock);

module.exports = router;
