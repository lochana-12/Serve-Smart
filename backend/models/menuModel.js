/* ============================================
   SERVE SMART - Menu Model
   ============================================ */

const db = require('../config/db');

// ============================================
// Get All Menu Items
// ============================================

async function getAllMenuItems() {
    try {
        const query = 'SELECT * FROM menu ORDER BY category, name';
        const result = await db.executeQuery(query);
        return result;
    } catch (error) {
        throw new Error(`Error fetching menu items: ${error.message}`);
    }
}

// ============================================
// Get Menu Item By ID
// ============================================

async function getMenuItemById(id) {
    try {
        if (!id) {
            throw new Error('Menu ID is required');
        }

        const query = 'SELECT * FROM menu WHERE id = ?';
        const result = await db.executeQuery(query, [id]);
        
        if (result.length === 0) {
            return null;
        }
        
        return result[0];
    } catch (error) {
        throw new Error(`Error fetching menu item: ${error.message}`);
    }
}

// ============================================
// Get Menu Items By Category
// ============================================

async function getMenuItemsByCategory(category) {
    try {
        if (!category) {
            throw new Error('Category is required');
        }

        const query = 'SELECT * FROM menu WHERE LOWER(category) = LOWER(?) AND is_available = TRUE ORDER BY name';
        const result = await db.executeQuery(query, [category]);
        return result;
    } catch (error) {
        throw new Error(`Error fetching menu items by category: ${error.message}`);
    }
}

// ============================================
// Create Menu Item
// ============================================

async function createMenuItem(menuData) {
    try {
        const { name, category, price, description } = menuData;

        if (!name || !category || !price) {
            throw new Error('Name, category, and price are required');
        }

        const query = `
            INSERT INTO menu (name, category, price, description, is_available)
            VALUES (?, ?, ?, ?, TRUE)
        `;

        const result = await db.executeQuery(query, [name, category, price, description || null]);
        return {
            id: result.insertId,
            ...menuData
        };
    } catch (error) {
        throw new Error(`Error creating menu item: ${error.message}`);
    }
}

// ============================================
// Update Menu Item
// ============================================

async function updateMenuItem(id, menuData) {
    try {
        if (!id) {
            throw new Error('Menu ID is required');
        }

        const { name, category, price, description, is_available } = menuData;

        const query = `
            UPDATE menu 
            SET name = COALESCE(?, name),
                category = COALESCE(?, category),
                price = COALESCE(?, price),
                description = COALESCE(?, description),
                is_available = COALESCE(?, is_available)
            WHERE id = ?
        `;

        const result = await db.executeQuery(query, [name, category, price, description, is_available, id]);
        
        if (result.affectedRows === 0) {
            return null;
        }

        return { id, ...menuData };
    } catch (error) {
        throw new Error(`Error updating menu item: ${error.message}`);
    }
}

// ============================================
// Delete Menu Item
// ============================================

async function deleteMenuItem(id) {
    try {
        if (!id) {
            throw new Error('Menu ID is required');
        }

        const query = 'DELETE FROM menu WHERE id = ?';
        const result = await db.executeQuery(query, [id]);
        
        if (result.affectedRows === 0) {
            return false;
        }

        return true;
    } catch (error) {
        throw new Error(`Error deleting menu item: ${error.message}`);
    }
}

// ============================================
// Get Available Menu Items
// ============================================

async function getAvailableMenuItems() {
    try {
        const query = 'SELECT * FROM menu WHERE is_available = TRUE ORDER BY category, name';
        const result = await db.executeQuery(query);
        return result;
    } catch (error) {
        throw new Error(`Error fetching available menu items: ${error.message}`);
    }
}

// ============================================
// Export Model Functions
// ============================================

module.exports = {
    getAllMenuItems,
    getMenuItemById,
    getMenuItemsByCategory,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getAvailableMenuItems
};
