#!/bin/bash

# LinkBird Clone - Demo Setup Commands
# Run these commands to set up the demo environment

echo "🚀 Setting up LinkBird Clone Demo Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating template..."
    cat > .env.local << EOF
# Better Auth Secret (generate a random string)
BETTER_AUTH_SECRET=your-secret-key-here

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Your user ID for seeding
SEED_OWNER_USER_ID=your-user-id-here
EOF
    echo "📝 Please update .env.local with your actual credentials"
fi

# Generate database migrations
echo "🗄️  Generating database migrations..."
npm run db:generate

# Run database migrations
echo "🔄 Running database migrations..."
npm run db:migrate

# Seed the database
echo "🌱 Seeding database with sample data..."
npm run db:seed

# Start the development server
echo "🚀 Starting development server..."
echo "📱 Open http://localhost:3000 in your browser"
echo "🔑 Use any email/password or Google OAuth to sign in"
echo "📊 Sample data includes 3 campaigns and ~60 leads"

# Start the server in background
npm run dev &

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 10

# Test API endpoints
echo "🧪 Testing API endpoints..."

# Test health endpoint
echo "Testing health endpoint..."
curl -s http://localhost:3000/api/health || echo "Health endpoint not available"

# Test leads API
echo "Testing leads API..."
curl -s "http://localhost:3000/api/leads?limit=5" | jq '.' || echo "Leads API not available"

# Test campaigns API
echo "Testing campaigns API..."
curl -s "http://localhost:3000/api/campaigns" | jq '.' || echo "Campaigns API not available"

echo "✅ Demo environment is ready!"
echo "🌐 Open http://localhost:3000 in your browser"
echo "📱 Use the following test accounts:"
echo "   Email: test@example.com"
echo "   Password: password123"
echo "   Or use Google OAuth"

# Keep the script running
echo "Press Ctrl+C to stop the server"
wait