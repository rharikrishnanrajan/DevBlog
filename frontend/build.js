const fs = require('fs');
const path = require('path');

const srcDir = __dirname;
const distDir = path.join(__dirname, 'dist');

// 1. Clean and recreate dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Helper to copy files/directories recursively
function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      if (entry === 'node_modules' || entry === 'dist' || entry === '.git') continue;
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 2. Copy static files & directories to dist
const itemsToCopy = ['index.html', 'logo.jpg', 'app'];
for (const item of itemsToCopy) {
  const itemPath = path.join(srcDir, item);
  if (fs.existsSync(itemPath)) {
    copyRecursive(itemPath, path.join(distDir, item));
  }
}

// 3. Inject API_URL into dist/index.html if provided in environment
const distIndexPath = path.join(distDir, 'index.html');
if (fs.existsSync(distIndexPath)) {
  let html = fs.readFileSync(distIndexPath, 'utf8');
  const apiUrl = (process.env.API_URL || '').trim();
  if (apiUrl && apiUrl !== 'undefined' && apiUrl !== '${{ secrets.API_URL }}' && apiUrl !== '${{ vars.API_URL }}') {
    html = html.replace('__INJECT_API_URL__', apiUrl);
    console.log(`[build.js] Injected production API_URL: ${apiUrl}`);
  }
  fs.writeFileSync(distIndexPath, html, 'utf8');
}

console.log('✅ Static build completed successfully! Output: frontend/dist');
