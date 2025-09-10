#!/bin/bash
# Clean development environment script
# Run this when you encounter ChunkLoadError or other webpack issues

echo "🧹 Cleaning development environment..."

# Kill any running Node.js processes
echo "📦 Stopping Node.js processes..."
pkill -f "node" || true

# Remove build cache
echo "🗑️  Removing .next directory..."
rm -rf .next

# Remove node_modules (optional - uncomment if needed)
# echo "🗑️  Removing node_modules..."
# rm -rf node_modules
# echo "📦 Reinstalling dependencies..."
# npm install

echo "✅ Cleanup complete!"
echo "🚀 Starting development server..."
npm run dev
