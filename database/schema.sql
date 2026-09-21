-- Database schema for Developer-Centric Personal Blog Platform (DevBlog)
-- Target: MySQL 8.x / Local MySQL

CREATE DATABASE IF NOT EXISTS `blog` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `blog`;

CREATE TABLE IF NOT EXISTS `posts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `content` MEDIUMTEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_posts_created_at` (`created_at` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert starter sample posts if table is empty
INSERT INTO `posts` (`id`, `title`, `content`, `created_at`, `updated_at`)
SELECT 1, 
'Welcome to DevBlog: Modern Engineering & Thoughts', 
'# Welcome to DevBlog

This is a **developer-first** personal blog platform designed for clean, distraction-free technical writing.

## Key Features
- **Markdown Native**: Write your posts using standard Markdown formatting.
- **Code Syntax Highlighting**: Automatic highlighting for PHP, JavaScript, Python, SQL, and more.
- **Instant Search**: Filter and discover articles in real-time.
- **Responsive Terminal Design**: Crafted with custom dark aesthetics and developer typography.

```php
<?php
// Hello World in PHP
function greetDeveloper(string $name): string {
    return "Welcome to DevBlog, {$name}!";
}

echo greetDeveloper("Engineer");
```

Enjoy reading and sharing insights!', 
NOW() - INTERVAL 2 DAY, 
NOW() - INTERVAL 2 DAY
WHERE NOT EXISTS (SELECT 1 FROM `posts` WHERE `id` = 1);

INSERT INTO `posts` (`id`, `title`, `content`, `created_at`, `updated_at`)
SELECT 2, 
'Building Fast & Secure Web Applications with PHP & MySQL', 
'# Building Fast & Secure Web Applications

PHP and MySQL remain one of the most reliable and efficient backbones for modern web development.

### Best Practices for Secure PHP
1. **Always use PDO Prepared Statements** to eliminate SQL Injection risks.
2. **Sanitize user output** using `htmlspecialchars()` to prevent XSS.
3. **Use strict types** (`declare(strict_types=1);`) for predictable data flows.

```sql
-- Secure index lookup
SELECT id, title, content, created_at 
FROM posts 
WHERE id = :id 
LIMIT 1;
```

With modern PHP 8+ features like named arguments, union types, and match expressions, PHP is faster and more expressive than ever before.', 
NOW() - INTERVAL 1 DAY, 
NOW() - INTERVAL 1 DAY
WHERE NOT EXISTS (SELECT 1 FROM `posts` WHERE `id` = 2);
