/* ============================================
   SERVE SMART - Main Server File
   ============================================ */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const db = require('./config/db');

// Load environment variables
dotenv.config();

// ============================================
// Initialize Express App
// ============================================

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Middleware
// ============================================

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

// Body Parser middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// ============================================
// Routes
// ============================================

const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');

// API Routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// ============================================
// Health Check Endpoint
// ============================================

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// ============================================
// Root Endpoint
// ============================================

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to Serve Smart API',
        version: '1.0.0',
        endpoints: {
            menu: '/api/menu',
            orders: '/api/orders',
            health: '/health'
        }
    });
});

// ============================================
// 404 Error Handler
// ============================================

app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `The requested endpoint ${req.method} ${req.path} does not exist`,
        path: req.path
    });
});

// ============================================
// Global Error Handler
// ============================================

app.use((err, req, res, next) => {
    console.error('Global Error:', err);
    res.status(err.status || 500).json({
        error: 'Internal Server Error',
        message: err.message || 'An unexpected error occurred',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ============================================
// Start Server
// ============================================

async function startServer() {
    try {
        // Test database connection
        console.log('Testing database connection...');
        const dbConnected = await db.testConnection();
        
        if (!dbConnected) {
            console.error('Failed to connect to database. Exiting...');
            process.exit(1);
        }
        
        // Initialize database
        await db.initializeDatabase();
        
        // Start listening
        app.listen(PORT, () => {
            console.log('');
            console.log('╔════════════════════════════════════════╗');
            console.log('║      SERVE SMART SERVER STARTED        ║');
            console.log('╠════════════════════════════════════════╣');
            console.log(`║ Port: ${PORT}`.padEnd(41) + '║');
            console.log(`║ Environment: ${process.env.NODE_ENV || 'development'}`.padEnd(41) + '║');
            console.log(`║ Database: ${process.env.DB_NAME}`.padEnd(41) + '║');
            console.log('╠════════════════════════════════════════╣');
            console.log('║ API Endpoints:                         ║');
            console.log('║ • GET  /api/menu                       ║');
            console.log('║ • POST /api/menu                       ║');
            console.log('║ • GET  /api/orders                     ║');
            console.log('║ • POST /api/orders                     ║');
            console.log('╚════════════════════════════════════════╝');
            console.log('');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nServer terminated');
    process.exit(0);
});

// Start the server
startServer();

module.exports = app;
