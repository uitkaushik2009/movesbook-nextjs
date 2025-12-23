$files = Get-ChildItem -Path "src\app\api" -Recurse -Filter "*.ts" | Where-Object { (Get-Content $_.FullName -Raw) -match "const prisma = new PrismaClient\(\)" }

Write-Host "Found $($files.Count) files to fix..."

foreach ($file in $files) {
    Write-Host "Fixing: $($file.FullName)"
    $content = Get-Content $file.FullName -Raw
    
    # Replace the import
    $content = $content -replace "import \{ PrismaClient \} from '@prisma/client';", "import { prisma } from '@/lib/prisma';"
    $content = $content -replace "const prisma = new PrismaClient\(\);", ""
    
    # Remove extra blank lines
    $content = $content -replace "\r?\n\r?\n\r?\n", "`n`n"
    
    Set-Content -Path $file.FullName -Value $content -NoNewline
}

Write-Host "âœ… Fixed $($files.Count) files!"
