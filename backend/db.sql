/* ============================================
   SERVE SMART - Database Schema
   ============================================ */

-- ============================================
-- Create Database
-- ============================================

CREATE DATABASE IF NOT EXISTS servesmart;
USE servesmart;

-- ============================================
-- Menu Table
-- ============================================

CREATE TABLE IF NOT EXISTS menu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_available (is_available)
);

-- ============================================
-- Orders Table
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_number INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status ENUM('pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_table (table_number),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);

-- ============================================
-- Order Items Table
-- ============================================

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    menu_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES menu(id) ON DELETE RESTRICT,
    INDEX idx_order (order_id),
    INDEX idx_menu (menu_id)
);

-- ============================================
-- Sample Menu Data
-- ============================================

INSERT INTO menu (name, category, price, description) VALUES
('Margherita Pizza', 'Pizza', 299.00, 'Fresh mozzarella, tomato sauce, basil'),
('Pepperoni Pizza', 'Pizza', 349.00, 'Pepperoni, mozzarella, tomato sauce'),
('Veggie Burger', 'Burgers', 249.00, 'Grilled vegetables, cheese, special sauce'),
('Chicken Burger', 'Burgers', 279.00, 'Grilled chicken, lettuce, tomato'),
('Caesar Salad', 'Salads', 199.00, 'Romaine, parmesan, croutons, Caesar dressing'),
('Greek Salad', 'Salads', 219.00, 'Feta, olives, tomatoes, cucumber'),
('Coke', 'Beverages', 49.00, 'Cold carbonated drink'),
('Iced Tea', 'Beverages', 59.00, 'Chilled iced tea'),
('Chocolate Cake', 'Desserts', 149.00, 'Rich chocolate cake with frosting'),
('Ice Cream Sundae', 'Desserts', 129.00, 'Vanilla ice cream with toppings');

-- ============================================
-- Create Views
-- ============================================

-- View: Active Orders with Item Count
CREATE VIEW IF NOT EXISTS active_orders_view AS
SELECT 
    o.id,
    o.table_number,
    o.status,
    o.total_amount,
    COUNT(oi.id) as item_count,
    o.created_at,
    o.updated_at
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.status != 'completed' AND o.status != 'cancelled'
GROUP BY o.id
ORDER BY o.created_at ASC;

-- View: Menu by Category
CREATE VIEW IF NOT EXISTS menu_by_category AS
SELECT 
    category,
    name,
    price,
    is_available,
    description
FROM menu
WHERE is_available = TRUE
ORDER BY category, name;

-- ============================================
-- Create Indexes for Performance
-- ============================================

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_menu ON order_items(menu_id);
CREATE INDEX idx_orders_table ON orders(table_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_menu_category ON menu(category);
