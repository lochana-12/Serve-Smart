/* ============================================
   SERVE SMART - Menu Controller
   ============================================ */

const db = require('../config/db');

// ============================================
// Get All Menu Items
// ============================================

async function getAllMenuItems(req, res) {
    try {
        const query = 'SELECT * FROM menu ORDER BY category, name';
        const menuItems = await db.executeQuery(query);
        
        res.status(200).json(menuItems);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({
            error: 'Failed to fetch menu items',
            message: error.message
        });
    }
}

// ============================================
// Get Menu Item By ID
// ============================================

async function getMenuItemById(req, res) {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ error: 'Menu ID is required' });
        }
        
        const query = 'SELECT * FROM menu WHERE id = ?';
        const menuItem = await db.executeQuery(query, [id]);
        
        if (menuItem.length === 0) {
            return res.status(404).json({ error: 'Menu item not found' });
        }
        
        res.status(200).json(menuItem[0]);
    } catch (error) {
        console.error('Error fetching menu item:', error);
        res.status(500).json({
            error: 'Failed to fetch menu item',
            message: error.message
        });
    }
}

// ============================================
// Get Menu Items By Category
// ============================================

async function getMenuItemsByCategory(req, res) {
    try {
        const { category } = req.params;
        
        if (!category) {
            return res.status(400).json({ error: 'Category is required' });
        }
        
        const query = 'SELECT * FROM menu WHERE LOWER(category) = LOWER(?) ORDER BY name';
        const menuItems = await db.executeQuery(query, [category]);
        
        res.status(200).json(menuItems);
    } catch (error) {
        console.error('Error fetching menu items by category:', error);
        res.status(500).json({
            error: 'Failed to fetch menu items',
            message: error.message
        });
    }
}

// ============================================
// Create Menu Item
// ============================================

async function createMenuItem(req, res) {
    try {
        const { name, category, price, description } = req.body;
        
        // Validation
        if (!name || !category || !price) {
            return res.status(400).json({
                error: 'Name, category, and price are required'
            });
        }
        
        const query = `
            INSERT INTO menu (name, category, price, description)
            VALUES (?, ?, ?, ?)
        `;
        
        const result = await db.executeQuery(query, [name, category, price, description || null]);
        
        res.status(201).json({
            message: 'Menu item created successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error creating menu item:', error);
        res.status(500).json({
            error: 'Failed to create menu item',
            message: error.message
        });
    }
}

// ============================================
// Update Menu Item
// ============================================

async function updateMenuItem(req, res) {
    try {
        const { id } = req.params;
        const { name, category, price, description } = req.body;
        
        if (!id) {
            return res.status(400).json({ error: 'Menu ID is required' });
        }
        
        // Check if menu item exists
        const checkQuery = 'SELECT * FROM menu WHERE id = ?';
        const existing = await db.executeQuery(checkQuery, [id]);
        
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Menu item not found' });
        }
        
        const query = `
            UPDATE menu 
            SET name = COALESCE(?, name),
                category = COALESCE(?, category),
                price = COALESCE(?, price),
                description = COALESCE(?, description)
            WHERE id = ?
        `;
        
        await db.executeQuery(query, [name, category, price, description, id]);
        
        res.status(200).json({
            message: 'Menu item updated successfully'
        });
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({
            error: 'Failed to update menu item',
            message: error.message
        });
    }
}

// ============================================
// Delete Menu Item
// ============================================

async function deleteMenuItem(req, res) {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ error: 'Menu ID is required' });
        }
        
        // Check if menu item exists
        const checkQuery = 'SELECT * FROM menu WHERE id = ?';
        const existing = await db.executeQuery(checkQuery, [id]);
        
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Menu item not found' });
        }
        
        const query = 'DELETE FROM menu WHERE id = ?';
        await db.executeQuery(query, [id]);
        
        res.status(200).json({
            message: 'Menu item deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({
            error: 'Failed to delete menu item',
            message: error.message
        });
    }
}

// ============================================
// Export Controller Functions
// ============================================

module.exports = {
    getAllMenuItems,
    getMenuItemById,
    getMenuItemsByCategory,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
};
