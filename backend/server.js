/* ============================================
   SERVE SMART - Express Server Setup
   ============================================ */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Middleware
// ============================================

// CORS configuration
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static file serving
app.use(express.static(path.join(__dirname, '../frontend')));

// ============================================
// Import Routes
// ============================================

const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');

// ============================================
// API Routes
// ============================================

app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// ============================================
// Root Endpoint
// ============================================

app.get('/', (req, res) => {
    res.json({
        message: 'Serve Smart - Real-Time Table Order & Billing System',
        version: '1.0.0',
        endpoints: {
            menu: '/api/menu',
            orders: '/api/orders'
        }
    });
});

// ============================================
// 404 Error Handling
// ============================================

app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.path,
        method: req.method
    });
});

// ============================================
// Error Handling Middleware
// ============================================

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        status: err.status || 500
    });
});

// ============================================
// Start Server
// ============================================

app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════╗
    ║   🍽️  Serve Smart Server Running         ║
    ║   Port: ${PORT}                             ║
    ║   Environment: ${process.env.NODE_ENV || 'development'}          ║
    ║   Database: ${process.env.DB_HOST}:${process.env.DB_PORT}          ║
    ╚═══════════════════════════════════════════╝
    `);
});

// ============================================
// Graceful Shutdown
// ============================================

process.on('SIGINT', () => {
    console.log('\nServer shutting down gracefully...');
    process.exit(0);
});

module.exports = app;
