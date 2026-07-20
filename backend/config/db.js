/* ============================================
   SERVE SMART - MySQL Database Configuration
   ============================================ */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// ============================================
// Database Connection Pool
// ============================================

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'servesmart',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelayMs: 0
});

// ============================================
// Test Database Connection
// ============================================

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✓ Database connection successful');
        connection.release();
        return true;
    } catch (error) {
        console.error('✗ Database connection failed:', error.message);
        return false;
    }
}

// ============================================
// Execute Query
// ============================================

async function executeQuery(query, values = []) {
    try {
        const connection = await pool.getConnection();
        const [results] = await connection.execute(query, values);
        connection.release();
        return results;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

// ============================================
// Initialize Database
// ============================================

async function initializeDatabase() {
    try {
        console.log('Initializing database...');
        
        // Test connection
        const connected = await testConnection();
        if (!connected) {
            console.error('Failed to connect to database');
            return false;
        }
        
        console.log('Database initialized successfully');
        return true;
    } catch (error) {
        console.error('Database initialization error:', error);
        return false;
    }
}

// ============================================
// Export Functions
// ============================================

module.exports = {
    pool,
    executeQuery,
    testConnection,
    initializeDatabase
};
