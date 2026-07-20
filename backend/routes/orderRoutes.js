/* ============================================
   SERVE SMART - Order Routes
   ============================================ */

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// ============================================
// Order Routes
// ============================================

/**
 * GET /api/orders
 * Get all orders
 */
router.get('/', orderController.getAllOrders);

/**
 * GET /api/orders/:id
 * Get order by ID
 */
router.get('/:id', orderController.getOrderById);

/**
 * GET /api/orders/table/:tableNumber
 * Get orders for specific table
 */
router.get('/table/:tableNumber', orderController.getOrdersByTable);

/**
 * POST /api/orders
 * Create new order
 */
router.post('/', orderController.createOrder);

/**
 * PUT /api/orders/:id
 * Update order status
 */
router.put('/:id', orderController.updateOrderStatus);

/**
 * GET /api/orders/status/pending
 * Get all pending orders
 */
router.get('/status/pending', orderController.getPendingOrders);

/**
 * DELETE /api/orders/:id
 * Delete order
 */
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
