# Clean development environment script for Windows PowerShell
# Run this when you encounter ChunkLoadError or other webpack issues

Write-Host "🧹 Cleaning development environment..." -ForegroundColor Green

# Kill any running Node.js processes
Write-Host "📦 Stopping Node.js processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Remove build cache
Write-Host "🗑️  Removing .next directory..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Remove node_modules (optional - uncomment if needed)
# Write-Host "🗑️  Removing node_modules..." -ForegroundColor Yellow
# Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
# Write-Host "📦 Reinstalling dependencies..." -ForegroundColor Yellow
# npm install

Write-Host "✅ Cleanup complete!" -ForegroundColor Green
Write-Host "🚀 Starting development server..." -ForegroundColor Cyan
npm run dev
