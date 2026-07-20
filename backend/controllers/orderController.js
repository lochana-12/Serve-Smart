/* ============================================
   SERVE SMART - Order Controller
   ============================================ */

const db = require('../config/db');

// ============================================
// Get All Orders
// ============================================

async function getAllOrders(req, res) {
    try {
        const query = `
            SELECT o.*, 
                   GROUP_CONCAT(JSON_OBJECT('menu_id', oi.menu_id, 'quantity', oi.quantity, 'price', oi.price)) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `;
        
        const orders = await db.executeQuery(query);
        
        // Parse items JSON
        const parsedOrders = orders.map(order => ({
            ...order,
            items: order.items ? JSON.parse(`[${order.items}]`) : []
        }));
        
        res.status(200).json(parsedOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            error: 'Failed to fetch orders',
            message: error.message
        });
    }
}

// ============================================
// Get Order By ID
// ============================================

async function getOrderById(req, res) {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ error: 'Order ID is required' });
        }
        
        const query = `
            SELECT o.*, 
                   GROUP_CONCAT(JSON_OBJECT('menu_id', oi.menu_id, 'quantity', oi.quantity, 'price', oi.price)) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.id = ?
            GROUP BY o.id
        `;
        
        const order = await db.executeQuery(query, [id]);
        
        if (order.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        order[0].items = order[0].items ? JSON.parse(`[${order[0].items}]`) : [];
        
        res.status(200).json(order[0]);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            error: 'Failed to fetch order',
            message: error.message
        });
    }
}

// ============================================
// Get Orders By Table
// ============================================

async function getOrdersByTable(req, res) {
    try {
        const { tableNumber } = req.params;
        
        if (!tableNumber) {
            return res.status(400).json({ error: 'Table number is required' });
        }
        
        const query = `
            SELECT o.*, 
                   GROUP_CONCAT(JSON_OBJECT('menu_id', oi.menu_id, 'quantity', oi.quantity, 'price', oi.price)) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.table_number = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `;
        
        const orders = await db.executeQuery(query, [tableNumber]);
        
        const parsedOrders = orders.map(order => ({
            ...order,
            items: order.items ? JSON.parse(`[${order.items}]`) : []
        }));
        
        res.status(200).json(parsedOrders);
    } catch (error) {
        console.error('Error fetching orders by table:', error);
        res.status(500).json({
            error: 'Failed to fetch orders',
            message: error.message
        });
    }
}

// ============================================
// Create Order
// ============================================

async function createOrder(req, res) {
    try {
        const { table_number, items } = req.body;
        
        // Validation
        if (!table_number || !items || items.length === 0) {
            return res.status(400).json({
                error: 'Table number and items are required'
            });
        }
        
        // Calculate total
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Insert order
        const orderQuery = `
            INSERT INTO orders (table_number, total_amount, status)
            VALUES (?, ?, 'pending')
        `;
        
        const orderResult = await db.executeQuery(orderQuery, [table_number, total]);
        const orderId = orderResult.insertId;
        
        // Insert order items
        for (const item of items) {
            const itemQuery = `
                INSERT INTO order_items (order_id, menu_id, quantity, price)
                VALUES (?, ?, ?, ?)
            `;
            await db.executeQuery(itemQuery, [orderId, item.menu_id, item.quantity, item.price]);
        }
        
        res.status(201).json({
            message: 'Order created successfully',
            orderId: orderId
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            error: 'Failed to create order',
            message: error.message
        });
    }
}

// ============================================
// Update Order Status
// ============================================

async function updateOrderStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!id) {
            return res.status(400).json({ error: 'Order ID is required' });
        }
        
        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }
        
        // Validate status
        const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                error: 'Invalid status. Valid statuses: ' + validStatuses.join(', ')
            });
        }
        
        // Check if order exists
        const checkQuery = 'SELECT * FROM orders WHERE id = ?';
        const existing = await db.executeQuery(checkQuery, [id]);
        
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const query = 'UPDATE orders SET status = ? WHERE id = ?';
        await db.executeQuery(query, [status, id]);
        
        res.status(200).json({
            message: 'Order status updated successfully'
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            error: 'Failed to update order status',
            message: error.message
        });
    }
}

// ============================================
// Get Pending Orders
// ============================================

async function getPendingOrders(req, res) {
    try {
        const query = `
            SELECT o.*, 
                   GROUP_CONCAT(JSON_OBJECT('menu_id', oi.menu_id, 'quantity', oi.quantity, 'price', oi.price)) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.status IN ('pending', 'confirmed', 'preparing')
            GROUP BY o.id
            ORDER BY o.created_at ASC
        `;
        
        const orders = await db.executeQuery(query);
        
        const parsedOrders = orders.map(order => ({
            ...order,
            items: order.items ? JSON.parse(`[${order.items}]`) : []
        }));
        
        res.status(200).json(parsedOrders);
    } catch (error) {
        console.error('Error fetching pending orders:', error);
        res.status(500).json({
            error: 'Failed to fetch pending orders',
            message: error.message
        });
    }
}

// ============================================
// Delete Order
// ============================================

async function deleteOrder(req, res) {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ error: 'Order ID is required' });
        }
        
        // Check if order exists
        const checkQuery = 'SELECT * FROM orders WHERE id = ?';
        const existing = await db.executeQuery(checkQuery, [id]);
        
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Delete order items first (foreign key constraint)
        const deleteItemsQuery = 'DELETE FROM order_items WHERE order_id = ?';
        await db.executeQuery(deleteItemsQuery, [id]);
        
        // Delete order
        const deleteQuery = 'DELETE FROM orders WHERE id = ?';
        await db.executeQuery(deleteQuery, [id]);
        
        res.status(200).json({
            message: 'Order deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({
            error: 'Failed to delete order',
            message: error.message
        });
    }
}

// ============================================
// Export Controller Functions
// ============================================

module.exports = {
    getAllOrders,
    getOrderById,
    getOrdersByTable,
    createOrder,
    updateOrderStatus,
    getPendingOrders,
    deleteOrder
};
