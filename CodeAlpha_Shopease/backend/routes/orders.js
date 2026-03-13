const express                                    = require('express');
const router                                     = express.Router();
const { createOrder, getMyOrders, getOrderById } = require('../controllers/orderController');
const { protect }                                = require('../middleware/authMiddleware');

// All order routes are protected  🔒
router.use(protect);

// POST  /api/orders         – place order from current cart
router.post('/',     createOrder);

// GET   /api/orders         – my order history
router.get('/',      getMyOrders);

// GET   /api/orders/:id     – single order detail
router.get('/:id',   getOrderById);

module.exports = router;