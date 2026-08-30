const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'defaultdb';

// Create connection pool for MySQL (Aiven MySQL compatible with SSL)
const pool = mysql.createPool({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: process.env.DB_SSL === 'false' ? false : {
        rejectUnauthorized: false
    }
});

// Auto-initialize posts table on startup
async function initDatabase() {
    console.log(`🔌 Connecting to MySQL at ${dbHost}:${dbPort} (User: ${dbUser}, Database: ${dbName})...`);
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connected to MySQL database successfully.');

        // Auto-create posts table if it does not exist
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `;
        await connection.query(createTableQuery);
        console.log('✅ Verified `posts` table in database.');
        connection.release();
    } catch (error) {
        console.error('❌ Failed to connect to MySQL database:', error.message);
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('👉 Please check your DB_USER and DB_PASSWORD in backend/.env');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error(`👉 Database "${dbName}" does not exist. Change DB_NAME in backend/.env to an existing database like "defaultdb" or create "blog".`);
        }
    }
}

initDatabase();

module.exports = pool;
