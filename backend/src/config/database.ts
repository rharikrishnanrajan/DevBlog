import mysql, { Pool } from 'mysql2/promise';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'defaultdb';

// Configure secure SSL options for managed/cloud MySQL (e.g. Aiven, PlanetScale, AWS RDS)
const sslConfig =
  process.env.DB_SSL === 'false'
    ? undefined
    : {
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true' ? true : false
      };

// Create connection pool for MySQL with secure timeouts and limits
export const pool: Pool = mysql.createPool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 5, // Reduced to prevent exhausting DB connections
  queueLimit: 10, // Limit queue size when all connections are in use
  connectTimeout: 10000, // 10 seconds
  ssl: sslConfig
});

let dbConnected = false;

export function isDbConnected(): boolean {
  return dbConnected;
}

// Auto-initialize posts table on startup
export async function initDatabase(): Promise<boolean> {
  console.log(`🔌 Connecting to MySQL at ${dbHost}:${dbPort} (Database: ${dbName})...`);
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_posts_created_at (created_at DESC)
      );
    `;
    await connection.query(createTableQuery);
    console.log('✅ Verified `posts` table in database.');
    connection.release();
    dbConnected = true;
    return true;
  } catch (error: unknown) {
    dbConnected = false;
    const err = error as { message?: string; code?: string };
    console.warn('⚠️ MySQL database connection could not be established:', err.message);
    console.warn('ℹ️ Falling back to resilient in-memory storage so the application stays fully functional.');
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('👉 Authentication failed. Please check your DB_USER and DB_PASSWORD credentials.');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error(
        `👉 Database "${dbName}" does not exist. Change DB_NAME in backend/.env to an existing database.`
      );
    }
    return false;
  }
}

export default pool;

