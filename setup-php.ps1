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

Write-Host "=========================================="
Write-Host "PHP Exe: $phpExe"
Write-Host "PHP Dir: $phpDir"
Write-Host "Ext Dir: $ext"

# Check if ext folder and mysql dlls exist
if (Test-Path $ext) {
    Write-Host "Files in ext folder matching *mysql*:"
    $dlls = Get-ChildItem -Path $ext -Filter "*mysql*" -ErrorAction SilentlyContinue
    if ($dlls) {
        foreach ($d in $dlls) { Write-Host "  Found: $($d.Name)" -ForegroundColor Green }
    } else {
        Write-Host "  No *mysql* DLLs found in $ext!" -ForegroundColor Red
        Write-Host "  All DLLs in $ext:"
        Get-ChildItem -Path $ext -Filter "*.dll" -ErrorAction SilentlyContinue | ForEach-Object { Write-Host "    $($_.Name)" }
    }
} else {
    Write-Host "EXT FOLDER DOES NOT EXIST AT: $ext" -ForegroundColor Red
    # Search for ext anywhere in phpDir
    $foundExt = Get-ChildItem -Path $phpDir -Directory -Filter "ext" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($foundExt) {
        $ext = $foundExt.FullName
        Write-Host "Found ext folder at: $ext" -ForegroundColor Green
    }
}

# Create / update php.ini with exact paths
$iniContent = @"
[PHP]
extension_dir = "$($ext.Replace('\', '/'))"
extension = pdo_mysql
extension = mysqli
extension = php_pdo_mysql.dll
extension = php_mysqli.dll
display_errors = On
error_reporting = E_ALL
"@

Set-Content -Path $ini -Value $iniContent -Force
Write-Host "Wrote clean php.ini to: $ini" -ForegroundColor Cyan

# Test PDO drivers
Write-Host "`nTesting PDO drivers currently reported by PHP:" -ForegroundColor Cyan
& "$phpExe" -c "$ini" -r "echo 'Available PDO drivers: ' . implode(', ', PDO::getAvailableDrivers()) . PHP_EOL;"

Write-Host "==========================================`n"
Write-Host "Starting DevBlog on http://localhost:8000 ..." -ForegroundColor Green
& "$phpExe" -c "$ini" -S localhost:8000 router.php
