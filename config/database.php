<?php
/**
 * Database Configuration & Connection Handler
 * DevBlog Platform
 * 
 * Target: MySQL 8.x
 */

declare(strict_types=1);

class Database {
    private static ?PDO $instance = null;

    private static string $host = '127.0.0.1';
    private static string $port = '3306';
    private static string $dbname = 'blog';
    private static string $username = 'root';
    private static string $password = 'Hari@2906';
    private static string $charset = 'utf8mb4';

    /**
     * Get singleton PDO database connection instance.
     */
    public static function getConnection(): PDO {
        if (self::$instance === null) {
            // Allow environment variables to override defaults if set
            $host = getenv('DB_HOST') ?: self::$host;
            $port = getenv('DB_PORT') ?: self::$port;
            $dbname = getenv('DB_NAME') ?: self::$dbname;
            $username = getenv('DB_USER') ?: self::$username;
            $password = getenv('DB_PASSWORD') !== false ? getenv('DB_PASSWORD') : self::$password;

            $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=" . self::$charset;
            
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false
            ];

            try {
                self::$instance = new PDO($dsn, $username, $password, $options);
            } catch (PDOException $e) {
                // Return JSON error response if this is an API request
                if (str_contains($_SERVER['REQUEST_URI'] ?? '', '/api/')) {
                    header('Content-Type: application/json; charset=utf-8', true, 500);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Database connection failed: ' . $e->getMessage()
                    ]);
                    exit;
                }
                throw $e;
            }
        }

        return self::$instance;
    }
}
