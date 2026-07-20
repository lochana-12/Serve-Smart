/* ============================================
   SERVE SMART - Frontend JavaScript
   ============================================ */

const API_URL = 'http://localhost:3000/api';

// ============================================
// State Management
// ============================================

let cart = [];
let selectedTable = null;
let allMenuItems = [];

// ============================================
// Initialize Application
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Application initialized');
    
    // Load menu items
    loadMenu();
    
    // Set up event listeners
    setupEventListeners();
    
    // Update current time
    updateTime();
    setInterval(updateTime, 1000);
});

// ============================================
// Update Current Time
// ============================================

function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    document.getElementById('current-time').textContent = timeString;
}

// ============================================
// Load Menu Items
// ============================================

async function loadMenu() {
    try {
        const response = await fetch(`${API_URL}/menu`);
        if (!response.ok) throw new Error('Failed to load menu');
        
        allMenuItems = await response.json();
        displayMenuItems(allMenuItems);
    } catch (error) {
        console.error('Error loading menu:', error);
        document.getElementById('menu-items').innerHTML = 
            '<div class="loading" style="grid-column: 1/-1; color: red;">Failed to load menu. Please check if the server is running.</div>';
    }
}

// ============================================
// Display Menu Items
// ============================================

function displayMenuItems(items) {
    const menuContainer = document.getElementById('menu-items');
    
    if (items.length === 0) {
        menuContainer.innerHTML = '<div class="loading" style="grid-column: 1/-1;">No items available</div>';
        return;
    }
    
    menuContainer.innerHTML = items.map(item => `
        <div class="menu-item" data-id="${item.id}">
            <div class="menu-item-category">${item.category}</div>
            <div class="menu-item-name">${item.name}</div>
            <div class="menu-item-price">₹${item.price.toFixed(2)}</div>
            <div class="menu-item-quantity">
                <button class="qty-btn" onclick="decrementQty(${item.id})">−</button>
                <input type="number" class="qty-input" id="qty-${item.id}" value="0" readonly>
                <button class="qty-btn" onclick="incrementQty(${item.id})">+</button>
            </div>
        </div>
    `).join('');
}

// ============================================
// Quantity Management
// ============================================

function incrementQty(itemId) {
    const input = document.getElementById(`qty-${itemId}`);
    let quantity = parseInt(input.value) || 0;
    quantity++;
    input.value = quantity;
    
    updateCart(itemId, quantity);
}

function decrementQty(itemId) {
    const input = document.getElementById(`qty-${itemId}`);
    let quantity = parseInt(input.value) || 0;
    if (quantity > 0) {
        quantity--;
        input.value = quantity;
        updateCart(itemId, quantity);
    }
}

// ============================================
// Update Cart
// ============================================

function updateCart(itemId, quantity) {
    const item = allMenuItems.find(i => i.id === itemId);
    
    if (!item) return;
    
    // Remove from cart if quantity is 0
    if (quantity === 0) {
        cart = cart.filter(c => c.id !== itemId);
    } else {
        // Check if item already in cart
        const existingItem = cart.find(c => c.id === itemId);
        if (existingItem) {
            existingItem.quantity = quantity;
        } else {
            cart.push({
                id: itemId,
                name: item.name,
                price: item.price,
                quantity: quantity
            });
        }
    }
    
    displayOrderItems();
    calculateBill();
}

// ============================================
// Display Order Items
// ============================================

function displayOrderItems() {
    const orderItemsContainer = document.getElementById('order-items');
    
    if (cart.length === 0) {
        orderItemsContainer.innerHTML = '<p class="empty-message">No items added yet</p>';
        return;
    }
    
    orderItemsContainer.innerHTML = cart.map(item => `
        <div class="order-item">
            <div class="order-item-info">
                <div class="order-item-name">${item.name}</div>
                <div class="order-item-qty">Qty: ${item.quantity}</div>
            </div>
            <div class="order-item-price">₹${(item.price * item.quantity).toFixed(2)}</div>
            <button class="order-item-remove" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
    `).join('');
}

// ============================================
// Remove from Cart
// ============================================

function removeFromCart(itemId) {
    cart = cart.filter(c => c.id !== itemId);
    document.getElementById(`qty-${itemId}`).value = 0;
    displayOrderItems();
    calculateBill();
}

// ============================================
// Calculate Bill
// ============================================

function calculateBill() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + tax;
    
    document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `₹${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `₹${total.toFixed(2)}`;
}

// ============================================
// Setup Event Listeners
// ============================================

function setupEventListeners() {
    // Category filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active state
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter menu items
            const category = this.dataset.category;
            if (category === 'all') {
                displayMenuItems(allMenuItems);
            } else {
                const filtered = allMenuItems.filter(item => item.category.toLowerCase() === category);
                displayMenuItems(filtered);
            }
        });
    });
    
    // Table selector
    document.getElementById('table-number').addEventListener('change', function() {
        selectedTable = this.value;
    });
    
    // Place Order button
    document.getElementById('place-order-btn').addEventListener('click', handlePlaceOrder);
    
    // Clear Order button
    document.getElementById('clear-order-btn').addEventListener('click', handleClearOrder);
    
    // Modal buttons
    document.getElementById('confirm-order-btn').addEventListener('click', submitOrder);
    document.getElementById('cancel-order-btn').addEventListener('click', closeOrderModal);
    document.getElementById('close-success-btn').addEventListener('click', closeSuccessModal);
    
    // Close modal on X click
    document.querySelector('.close').addEventListener('click', closeOrderModal);
}

// ============================================
// Place Order Handler
// ============================================

function handlePlaceOrder() {
    if (!selectedTable) {
        alert('Please select a table');
        return;
    }
    
    if (cart.length === 0) {
        alert('Please add items to the order');
        return;
    }
    
    // Show confirmation modal
    showOrderModal();
}

// ============================================
// Show Order Modal
// ============================================

function showOrderModal() {
    const modal = document.getElementById('order-modal');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.05;
    
    document.getElementById('modal-table').textContent = selectedTable;
    
    document.getElementById('modal-items').innerHTML = cart.map(item => `
        <div class="modal-item">
            <span>${item.name} (x${item.quantity})</span>
            <span>₹${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');
    
    document.getElementById('modal-total').textContent = `₹${total.toFixed(2)}`;
    
    modal.classList.add('show');
}

// ============================================
// Close Order Modal
// ============================================

function closeOrderModal() {
    document.getElementById('order-modal').classList.remove('show');
}

// ============================================
// Submit Order
// ============================================

async function submitOrder() {
    closeOrderModal();
    
    try {
        const orderData = {
            table_number: parseInt(selectedTable),
            items: cart.map(item => ({
                menu_id: item.id,
                quantity: item.quantity,
                price: item.price
            }))
        };
        
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) throw new Error('Failed to place order');
        
        const result = await response.json();
        
        // Show success modal
        showSuccessModal(result.orderId);
        
        // Clear cart and reset
        cart = [];
        selectedTable = null;
        document.getElementById('table-number').value = '';
        
        // Reset quantity inputs
        document.querySelectorAll('.qty-input').forEach(input => input.value = 0);
        
        displayOrderItems();
        calculateBill();
        
        // Refresh order status
        loadOrderStatus();
        
    } catch (error) {
        console.error('Error submitting order:', error);
        alert('Failed to submit order. Please try again.');
    }
}

// ============================================
// Show Success Modal
// ============================================

function showSuccessModal(orderId) {
    document.getElementById('order-id').textContent = orderId;
    document.getElementById('success-modal').classList.add('show');
}

// ============================================
// Close Success Modal
// ============================================

function closeSuccessModal() {
    document.getElementById('success-modal').classList.remove('show');
}

// ============================================
// Clear Order Handler
// ============================================

function handleClearOrder() {
    if (confirm('Are you sure you want to clear the order?')) {
        cart = [];
        document.querySelectorAll('.qty-input').forEach(input => input.value = 0);
        displayOrderItems();
        calculateBill();
    }
}

// ============================================
// Load Order Status
// ============================================

async function loadOrderStatus() {
    try {
        const response = await fetch(`${API_URL}/orders`);
        if (!response.ok) throw new Error('Failed to load orders');
        
        const orders = await response.json();
        displayOrderStatus(orders);
    } catch (error) {
        console.error('Error loading order status:', error);
    }
}

// ============================================
// Display Order Status
// ============================================

function displayOrderStatus(orders) {
    const statusContainer = document.getElementById('order-status');
    
    if (orders.length === 0) {
        statusContainer.innerHTML = '<p class="empty-message">No orders placed</p>';
        return;
    }
    
    // Show only last 5 orders
    const recentOrders = orders.slice(-5).reverse();
    
    statusContainer.innerHTML = recentOrders.map(order => {
        const orderTime = new Date(order.created_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        
        return `
            <div class="status-item">
                <div class="status-item-id">Order #${order.id} - Table ${order.table_number}</div>
                <div class="status-item-time">Placed at: ${orderTime}</div>
                <div class="status-item-badge">${order.status}</div>
            </div>
        `;
    }).join('');
}

// ============================================
// Auto-refresh Order Status
// ============================================

setInterval(loadOrderStatus, 5000);

// Load initial order status
loadOrderStatus();
