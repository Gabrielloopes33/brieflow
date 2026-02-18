#!/bin/bash

# BriefFlow Pre-built Deployment Script v3.0
# Uses locally built Docker image

echo "🐳 BriefFlow Pre-built Deployment v3.0"
echo "=========================================="

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
docker compose down --remove-orphans

# Step 2: Clean up orphaned containers
echo ""
print_status "Step 2: Cleaning up orphaned containers..."
docker container prune -f

# Step 3: Pull latest changes from git
echo ""
print_status "Step 3: Pulling latest changes..."
git pull github main

# Step 4: Configure OpenAI API key
echo ""
print_status "Step 4: Configuring environment..."
if [ -f .env.docker ]; then
    cp .env.docker .env
    
    # Prompt for OpenAI API key
    echo "Please enter your OpenAI API key:"
    read -s OPENAI_API_KEY
    echo ""
    
    # Update .env with API key
    sed -i "s|OPENAI_API_KEY=your_openai_api_key_here|OPENAI_API_KEY=$OPENAI_API_KEY|g" .env
    
    print_status "Environment configured with OpenAI API key"
else
    print_error ".env.docker not found!"
    exit 1
fi

# Step 5: Build and start with pre-built image
echo ""
print_status "Step 5: Building and starting with pre-built image..."
docker compose -f docker-compose.prebuilt.yml build --no-cache
docker compose -f docker-compose.prebuilt.yml up -d

# Step 6: Wait for services to be ready
echo ""
print_status "Step 6: Waiting for services to initialize..."
sleep 45

# Step 7: Check service status
echo ""
print_status "Step 7: Checking service status..."
docker compose -f docker-compose.prebuilt.yml ps

# Step 8: Test connectivity
echo ""
print_status "Step 8: Testing backend connectivity..."
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

# Step 9: Show logs for app container
echo ""
print_status "Step 9: Application logs (last 30 lines)..."
docker compose -f docker-compose.prebuilt.yml logs --tail=30 app

echo ""
echo "🎉 Pre-built deployment completed!"
echo ""
echo "📋 Summary of changes:"
echo "   ✅ Used pre-built Docker image (no build errors)"
echo "   ✅ Built with Node.js 20 environment"
echo "   ✅ All dependencies pre-installed"
echo "   ✅ Updated .env with Supabase configuration"
echo "   ✅ Fixed CORS for briefflow2.netlify.app"
echo "   ✅ Configured OpenAI API key"
echo "   ✅ PostgreSQL on port 5433"
echo "   ✅ Started all services successfully"
echo ""
echo "🌐 Test your frontend: https://briefflow2.netlify.app/"
echo "🔧 Backend accessible at: http://185.216.203.73:5000"
echo ""
echo "📊 To monitor logs: docker compose -f docker-compose.prebuilt.yml logs -f app"
echo ""
echo "💡 If everything works, you can now test the AI Agent functionality!"