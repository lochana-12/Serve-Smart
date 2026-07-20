/* ============================================
   SERVE SMART - Menu Routes
   ============================================ */

const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// ============================================
// Menu Routes
// ============================================

/**
 * GET /api/menu
 * Get all menu items
 */
router.get('/', menuController.getAllMenuItems);

/**
 * GET /api/menu/:id
 * Get menu item by ID
 */
router.get('/:id', menuController.getMenuItemById);

/**
 * GET /api/menu/category/:category
 * Get menu items by category
 */
router.get('/category/:category', menuController.getMenuItemsByCategory);

/**
 * POST /api/menu
 * Create new menu item
 */
router.post('/', menuController.createMenuItem);

/**
 * PUT /api/menu/:id
 * Update menu item
 */
router.put('/:id', menuController.updateMenuItem);

/**
 * DELETE /api/menu/:id
 * Delete menu item
 */
router.delete('/:id', menuController.deleteMenuItem);

module.exports = router;
