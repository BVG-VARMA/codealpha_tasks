const express                                              = require('express');
const router                                               = express.Router();
const { getAllProducts, getCategories, getProductById }    = require('../controllers/productController');

// GET  /api/products
router.get('/', getAllProducts);

// GET  /api/products/categories       ← must be BEFORE /:id
router.get('/categories', getCategories);

// GET  /api/products/:id
router.get('/:id', getProductById);

module.exports = router;