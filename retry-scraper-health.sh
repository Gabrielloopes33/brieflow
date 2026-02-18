#!/bin/bash
# Script para corrigir o health check do scraper (versão simplificada)
# Execute na VPS: bash /opt/brieflow/retry-scraper-health.sh

set -e

echo "======================================"
echo "🔧 Retry Scraper Health Check"
echo "======================================"
echo ""

# 1. Atualizar código
echo "📥 Pulling latest code..."
cd /opt/brieflow
git pull github main
echo "✅ Code updated"
echo ""

# 2. Parar scraper
echo "🛑 Stopping scraper..."
docker compose stop scraper
docker compose rm -f scraper
echo "✅ Scraper stopped and removed"
echo ""

# 3. Iniciar scraper
echo "🚀 Starting scraper..."
docker compose up -d scraper
echo "✅ Scraper started"
echo ""

# 4. Aguardar startup
echo "⏳ Waiting 60s for startup..."
for i in {60..1}; do
    if [ $((i % 10)) -eq 0 ] && [ $i -ne 60 ]; then
        echo "   ${i}s remaining..."
    fi
    sleep 1
done
echo "✅ Wait complete"
echo ""

# 5. Verificar status
echo "📊 Container status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Health}}" | grep briefflow-scraper
echo ""

# 6. Testar health check
echo "🏥 Testing health check..."
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/ 2>/dev/null || echo "000")
echo "HTTP Status: $HEALTH"
echo ""

if [ "$HEALTH" = "200" ]; then
    echo "✅ Health check PASSED!"
    echo ""
    echo "Full response:"
    curl -s http://localhost:8000/ | jq '.' 2>/dev/null || curl -s http://localhost:8000/
else
    echo "⚠️ Health check still failing ($HEALTH)"
    echo ""
    echo "Logs:"
    docker logs briefflow-scraper --tail 30
fi

echo ""
echo "======================================"
echo "✅ Done! Check status in 1-2 minutes"
echo "======================================"
echo ""
echo "Monitor: docker ps -a | grep briefflow-scraper"
echo "Logs: docker logs -f briefflow-scraper"
echo ""
