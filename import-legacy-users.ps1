# PowerShell script to import legacy users table
# Usage: .\import-legacy-users.ps1

param(
    [Parameter(Mandatory=$false)]
    [string]$Database = "movesbook_nextjs",
    
    [Parameter(Mandatory=$false)]
    [string]$Username = "root",
    
    [Parameter(Mandatory=$false)]
    [string]$Host = "localhost",
    
    [Parameter(Mandatory=$false)]
    [string]$Port = "3306"
)

Write-Host "🚀 Importing legacy users table..." -ForegroundColor Blue
Write-Host ""

$sqlFile = "sql_database\users_tables.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ Error: SQL file not found at: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "📄 SQL file found: $sqlFile" -ForegroundColor Green
Write-Host "📊 Database: $Database" -ForegroundColor Cyan
Write-Host "👤 Username: $Username" -ForegroundColor Cyan
Write-Host ""

# Prompt for password
$securePassword = Read-Host "Enter MySQL password" -AsSecureString
$password = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
)

Write-Host ""
Write-Host "⏳ Importing... This may take a few minutes for large files..." -ForegroundColor Yellow

# Method 1: Using Get-Content and piping to mysql
try {
    Get-Content $sqlFile -Raw | & mysql -h $Host -P $Port -u $Username -p$password $Database
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Successfully imported legacy users table!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Next steps:" -ForegroundColor Blue
        Write-Host "   1. Verify the table exists: SELECT COUNT(*) FROM users WHERE delete_status = 'N';" -ForegroundColor White
        Write-Host "   2. Test login with a legacy user account" -ForegroundColor White
        Write-Host "   3. Users will be automatically migrated to users_new on first login" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "❌ Import failed. Check the error messages above." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
}

