const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.post('/upload', productController.uploadMiddleware, productController.uploadProductList);
router.get('/supplier/:supplierId', productController.getProductsBySupplier);

module.exports = router;
