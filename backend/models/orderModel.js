/* ============================================
   SERVE SMART - Order Model
   ============================================ */

const db = require('../config/db');

// ============================================
// Create New Order
// ============================================

async function createOrder(orderData) {
    try {
        const { table_number, items, notes } = orderData;

        if (!table_number || !items || items.length === 0) {
            throw new Error('Table number and items are required');
        }

        // Calculate total amount
        const total_amount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Insert order
        const orderQuery = `
            INSERT INTO orders (table_number, total_amount, status, notes)
            VALUES (?, ?, 'pending', ?)
        `;

        const orderResult = await db.executeQuery(orderQuery, [table_number, total_amount, notes || null]);
        const orderId = orderResult.insertId;

        // Insert order items
        for (const item of items) {
            const itemQuery = `
                INSERT INTO order_items (order_id, menu_id, quantity, price, special_requests)
                VALUES (?, ?, ?, ?, ?)
            `;
            await db.executeQuery(itemQuery, [
                orderId,
                item.menu_id,
                item.quantity,
                item.price,
                item.special_requests || null
            ]);
        }

        return {
            id: orderId,
            table_number,
            total_amount,
            status: 'pending',
            items
        };
    } catch (error) {
        throw new Error(`Error creating order: ${error.message}`);
    }
}

// ============================================
// Get All Orders
// ============================================

async function getAllOrders() {
    try {
        const query = `
            SELECT o.*,
                   GROUP_CONCAT(
                       JSON_OBJECT(
                           'id', oi.id,
                           'menu_id', oi.menu_id,
                           'quantity', oi.quantity,
                           'price', oi.price,
                           'special_requests', oi.special_requests
                       )
                   ) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `;

        const result = await db.executeQuery(query);

        // Parse JSON items
        const parsedOrders = result.map(order => ({
            ...order,
            items: order.items ? JSON.parse(`[${order.items}]`) : []
        }));

        return parsedOrders;
    } catch (error) {
        throw new Error(`Error fetching orders: ${error.message}`);
    }
}

// ============================================
// Get Order By ID
// ============================================

async function getOrderById(id) {
    try {
        if (!id) {
            throw new Error('Order ID is required');
        }

        const query = `
            SELECT o.*,
                   GROUP_CONCAT(
                       JSON_OBJECT(
                           'id', oi.id,
                           'menu_id', oi.menu_id,
                           'quantity', oi.quantity,
                           'price', oi.price,
                           'special_requests', oi.special_requests
                       )
                   ) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.id = ?
            GROUP BY o.id
        `;

        const result = await db.executeQuery(query, [id]);

        if (result.length === 0) {
            return null;
        }

        const order = result[0];
        order.items = order.items ? JSON.parse(`[${order.items}]`) : [];

        return order;
    } catch (error) {
        throw new Error(`Error fetching order: ${error.message}`);
    }
}

// ============================================
// Get Orders By Table
// ============================================

async function getOrdersByTable(table_number) {
    try {
        if (!table_number) {
            throw new Error('Table number is required');
        }

        const query = `
            SELECT o.*,
                   GROUP_CONCAT(
                       JSON_OBJECT(
                           'id', oi.id,
                           'menu_id', oi.menu_id,
                           'quantity', oi.quantity,
                           'price', oi.price,
                           'special_requests', oi.special_requests
                       )
                   ) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.table_number = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `;

        const result = await db.executeQuery(query, [table_number]);

        const parsedOrders = result.map(order => ({
            ...order,
            items: order.items ? JSON.parse(`[${order.items}]`) : []
        }));

        return parsedOrders;
    } catch (error) {
        throw new Error(`Error fetching orders by table: ${error.message}`);
    }
}

// ============================================
// Get Orders By Status
// ============================================

async function getOrdersByStatus(status) {
    try {
        if (!status) {
            throw new Error('Status is required');
        }

        const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status. Valid values: ${validStatuses.join(', ')}`);
        }

        const query = `
            SELECT o.*,
                   GROUP_CONCAT(
                       JSON_OBJECT(
                           'id', oi.id,
                           'menu_id', oi.menu_id,
                           'quantity', oi.quantity,
                           'price', oi.price,
                           'special_requests', oi.special_requests
                       )
                   ) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.status = ?
            GROUP BY o.id
            ORDER BY o.created_at ASC
        `;

        const result = await db.executeQuery(query, [status]);

        const parsedOrders = result.map(order => ({
            ...order,
            items: order.items ? JSON.parse(`[${order.items}]`) : []
        }));

        return parsedOrders;
    } catch (error) {
        throw new Error(`Error fetching orders by status: ${error.message}`);
    }
}

// ============================================
// Get Pending Orders
// ============================================

async function getPendingOrders() {
    try {
        const query = `
            SELECT o.*,
                   GROUP_CONCAT(
                       JSON_OBJECT(
                           'id', oi.id,
                           'menu_id', oi.menu_id,
                           'quantity', oi.quantity,
                           'price', oi.price,
                           'special_requests', oi.special_requests
                       )
                   ) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.status IN ('pending', 'confirmed', 'preparing')
            GROUP BY o.id
            ORDER BY o.created_at ASC
        `;

        const result = await db.executeQuery(query);

        const parsedOrders = result.map(order => ({
            ...order,
            items: order.items ? JSON.parse(`[${order.items}]`) : []
        }));

        return parsedOrders;
    } catch (error) {
        throw new Error(`Error fetching pending orders: ${error.message}`);
    }
}

// ============================================
// Update Order Status
// ============================================

async function updateOrderStatus(id, status) {
    try {
        if (!id) {
            throw new Error('Order ID is required');
        }

        if (!status) {
            throw new Error('Status is required');
        }

        const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status. Valid values: ${validStatuses.join(', ')}`);
        }

        const query = 'UPDATE orders SET status = ? WHERE id = ?';
        const result = await db.executeQuery(query, [status, id]);

        if (result.affectedRows === 0) {
            return null;
        }

        return { id, status };
    } catch (error) {
        throw new Error(`Error updating order status: ${error.message}`);
    }
}

// ============================================
// Delete Order By ID
// ============================================

async function deleteOrderById(id) {
    try {
        if (!id) {
            throw new Error('Order ID is required');
        }

        // Delete order items first (foreign key constraint)
        const deleteItemsQuery = 'DELETE FROM order_items WHERE order_id = ?';
        await db.executeQuery(deleteItemsQuery, [id]);

        // Delete order
        const deleteOrderQuery = 'DELETE FROM orders WHERE id = ?';
        const result = await db.executeQuery(deleteOrderQuery, [id]);

        if (result.affectedRows === 0) {
            return false;
        }

        return true;
    } catch (error) {
        throw new Error(`Error deleting order: ${error.message}`);
    }
}

// ============================================
// Get Order Statistics
// ============================================

async function getOrderStatistics() {
    try {
        const query = `
            SELECT 
                COUNT(*) as total_orders,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
                SUM(CASE WHEN status IN ('pending', 'confirmed', 'preparing') THEN 1 ELSE 0 END) as active_orders,
                SUM(total_amount) as total_revenue,
                AVG(total_amount) as average_order_value
            FROM orders
        `;

        const result = await db.executeQuery(query);
        return result[0];
    } catch (error) {
        throw new Error(`Error fetching order statistics: ${error.message}`);
    }
}

// ============================================
// Export Model Functions
// ============================================

module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    getOrdersByTable,
    getOrdersByStatus,
    getPendingOrders,
    updateOrderStatus,
    deleteOrderById,
    getOrderStatistics
};
