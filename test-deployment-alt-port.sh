#!/bin/bash

echo "🚀 Testing BriefFlow Deployment"
echo "================================"

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker compose -f docker-compose.portainer-alt-port.yml down

# Wait a moment for ports to be released
sleep 2

# Start the application
echo "🚀 Starting deployment with alternative port configuration..."
docker compose -f docker-compose.portainer-alt-port.yml up --build -d

# Check status
echo "📊 Checking container status..."
sleep 10
docker compose -f docker-compose.portainer-alt-port.yml ps

echo ""
echo "🔍 Checking logs for any errors..."
docker compose -f docker-compose.portainer-alt-port.yml logs --tail=20 app

echo ""
echo "✅ Deployment test complete!"
echo "📝 Expected ports:"
echo "   - App: http://localhost:5000"
echo "   - PostgreSQL: localhost:5433 (for external connections)"
echo "   - Redis: localhost:6379"
echo "   - Nginx: localhost:80"