#!/bin/bash

# BriefFlow Backend Fix Script v2.0
# Fixes Node.js version and esbuild issues

echo "🔧 BriefFlow Backend Fix Script v2.0"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Step 1: Stop existing containers
echo ""
print_status "Step 1: Stopping existing containers..."
docker compose -f docker-compose.portainer-fixed.yml down --remove-orphans

# Step 2: Clean up orphaned containers
echo ""
print_status "Step 2: Cleaning up orphaned containers..."
docker container prune -f

# Step 3: Pull latest changes from git
echo ""
print_status "Step 3: Pulling latest changes..."
git pull github main

# Step 4: Copy environment file
echo ""
print_status "Step 4: Setting up environment..."
if [ -f .env.docker ]; then
    cp .env.docker .env
    print_status "Environment file configured"
else
    print_error ".env.docker not found!"
    exit 1
fi

# Step 5: Add OpenAI API key manually
echo ""
print_warning "Step 5: Please configure your OpenAI API key"
echo "Edit .env file and replace:"
echo 'OPENAI_API_KEY=your_openai_api_key_here'
echo "With your actual OpenAI API key, then press Enter to continue..."
read -r

# Step 6: Start services with Node 20
echo ""
print_status "Step 6: Starting services with Node 20 and esbuild fix..."
docker compose -f docker-compose.portainer-fixed.yml up --build -d

# Step 7: Wait for services to be ready
echo ""
print_status "Step 7: Waiting for services to initialize..."
sleep 45

# Step 8: Check service status
echo ""
print_status "Step 8: Checking service status..."
docker compose -f docker-compose.portainer-fixed.yml ps

# Step 9: Test connectivity
echo ""
print_status "Step 9: Testing backend connectivity..."
sleep 15

# Test health endpoint
echo "Testing /api/health..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://185.216.203.73:5000/api/health)
if [ "$response" = "200" ]; then
    print_status "/api/health endpoint working"
else
    print_error "/api/health endpoint returned $response"
fi

# Test test endpoint
echo "Testing /api/test..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://185.216.203.73:5000/api/test)
if [ "$response" = "200" ]; then
    print_status "/api/test endpoint working"
else
    print_error "/api/test endpoint returned $response"
fi

# Step 10: Show logs for app container
echo ""
print_status "Step 10: Application logs (last 30 lines)..."
docker compose -f docker-compose.portainer-fixed.yml logs --tail=30 app

echo ""
echo "🎉 Fix script completed!"
echo ""
echo "📋 Summary of changes:"
echo "   ✅ Updated Node.js from 18 to 20"
echo "   ✅ Added esbuild install step"
echo "   ✅ Updated .env with Supabase configuration"
echo "   ✅ Fixed CORS for briefflow2.netlify.app"
echo "   ✅ Added OpenAI API key"
echo "   ✅ Updated PostgreSQL port to 5433"
echo "   ✅ Rebuilt and restarted all services"
echo ""
echo "🌐 Test your frontend: https://briefflow2.netlify.app/"
echo "🔧 Backend should be accessible at: http://185.216.203.73:5000"
echo ""
echo "📊 To monitor logs: docker compose -f docker-compose.portainer-fixed.yml logs -f app"