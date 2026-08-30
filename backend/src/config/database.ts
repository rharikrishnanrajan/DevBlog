import mysql, { Pool } from 'mysql2/promise';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'defaultdb';

// Create connection pool for MySQL (Aiven MySQL compatible with SSL)
export const pool: Pool = mysql.createPool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl:
    process.env.DB_SSL === 'false'
      ? undefined
      : {
          rejectUnauthorized: false
        }
});

// Auto-initialize posts table on startup
export async function initDatabase(): Promise<void> {
  console.log(
    `🔌 Connecting to MySQL at ${dbHost}:${dbPort} (User: ${dbUser}, Database: ${dbName})...`
  );
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
  } catch (error: unknown) {
    const err = error as { message?: string; code?: string };
    console.error('❌ Failed to connect to MySQL database:', err.message);
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('👉 Please check your DB_USER and DB_PASSWORD in backend/.env');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error(
        `👉 Database "${dbName}" does not exist. Change DB_NAME in backend/.env to an existing database like "defaultdb" or create "blog".`
      );
    }
  }
}

export default pool;
