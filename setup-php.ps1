$pkgDir = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages"
$php = Get-ChildItem -Path $pkgDir -Filter "php.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1

if (-not $php) {
    $cmd = Get-Command php -ErrorAction SilentlyContinue
    if ($cmd) {
        $php = Get-Item $cmd.Source
    }
}

if (-not $php) {
    Write-Host "PHP executable not found."
    exit 1
}

$phpExe = $php.FullName
$phpDir = $php.DirectoryName
$ini = Join-Path $phpDir "php.ini"
$ext = Join-Path $phpDir "ext"
$extFormatted = $ext.Replace('\', '/')

Write-Host "=========================================="
Write-Host "PHP Executable: $phpExe"
Write-Host "PHP Directory: $phpDir"
Write-Host "Ext Directory: $extFormatted"

# Write full php.ini directly in php directory so every thread finds it
$iniLines = @(
    "[PHP]",
    "extension_dir = `"$extFormatted`"",
    "extension = pdo_mysql",
    "extension = mysqli",
    "extension = curl",
    "extension = mbstring",
    "display_errors = On",
    "display_startup_errors = On",
    "error_reporting = E_ALL"
)

Set-Content -Path $ini -Value $iniLines -Force
Write-Host "Wrote php.ini to: $ini" -ForegroundColor Green

# Set PHPRC environment variable for the session
$env:PHPRC = $phpDir

# Test PDO MySQL driver in this environment
Write-Host "Verifying PDO drivers in PHP:" -ForegroundColor Cyan
& "$phpExe" -c "$ini" -r "echo 'Available PDO drivers: [' . implode(', ', PDO::getAvailableDrivers()) . ']' . PHP_EOL;"

Write-Host "=========================================="

# Kill any existing PHP built-in server on port 8000 to avoid stale processes
$stale = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($stale) {
    $stale | ForEach-Object {
        $proc = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
        if ($proc -and $proc.Name -like "php*") {
            Write-Host "Stopping stale PHP process (PID $($proc.Id))..." -ForegroundColor Yellow
            Stop-Process -Id $proc.Id -Force
        }
    }
    Start-Sleep -Milliseconds 500
}

Write-Host "🚀 Starting DevBlog server on http://localhost:8000 ..." -ForegroundColor Green
& "$phpExe" -c "$ini" -S localhost:8000 router.php
