<?php
/**
 * Global Header Component
 * DevBlog Platform
 */
$pageTitle = $pageTitle ?? 'DevBlog - Developer Personal Blog';
$pageDescription = $pageDescription ?? 'A minimalist, developer-focused personal blog platform for sharing thoughts, tutorials, and experiences.';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?></title>
    <meta name="description" content="<?= htmlspecialchars($pageDescription, ENT_QUOTES, 'UTF-8') ?>">

    <!-- Favicon -->
    <link rel="icon" type="image/png" href="assets/images/logo.png">
    <meta name="theme-color" content="#0d1117">
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Code Syntax Highlighting Theme (GitHub Dark) -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">

    <!-- Markdown Parser & Highlighter JS -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/marked/12.0.2/marked.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>

    <!-- Custom CSS -->
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <!-- Navigation Header -->
    <header class="site-header">
        <div class="header-container">
            <a href="index.php" class="brand-logo">
                <span class="brand-prefix">&gt;</span>
                <span class="brand-title">DevBlog</span>
                <span class="cursor-blink">_</span>
            </a>
            <nav class="nav-links" id="site-nav">
                <a href="index.php" class="nav-link <?= (basename($_SERVER['PHP_SELF']) === 'index.php') ? 'active' : '' ?>">Home</a>
                <a href="create.php" class="nav-btn">+ Write a Blog</a>
            </nav>
            <button class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation">
                <span></span><span></span><span></span>
            </button>
        </div>
    </header>
    <main class="main-container">
