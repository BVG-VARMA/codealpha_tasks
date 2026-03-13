const express                                                         = require('express');
const router                                                          = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const { protect }                                                     = require('../middleware/authMiddleware');

// All cart routes are protected  🔒
router.use(protect);

// GET    /api/cart             – view my cart
router.get('/',               getCart);

// POST   /api/cart             – add item  { productId, quantity }
router.post('/',              addToCart);

// PUT    /api/cart/:cartItemId – update qty  { quantity }
router.put('/:cartItemId',    updateCartItem);

// DELETE /api/cart/:cartItemId – remove one item
router.delete('/:cartItemId', removeFromCart);

// DELETE /api/cart             – clear entire cart
router.delete('/',            clearCart);

module.exports = router;