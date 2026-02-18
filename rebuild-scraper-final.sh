#!/bin/bash
# Script para rebuild e restart do scraper (FINAL)
# Execute na VPS: bash /opt/brieflow/rebuild-scraper-final.sh

set -e

echo "======================================"
echo "🔨 Rebuild Scraper - FINAL"
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

# 3. Rebuild (COM cache, só muda o Dockerfile)
echo "🔨 Rebuilding scraper (with cache)..."
docker compose build scraper
echo "✅ Scraper rebuilt"
echo ""

# 4. Iniciar scraper
echo "🚀 Starting scraper..."
docker compose up -d scraper
echo "✅ Scraper started"
echo ""

# 5. Aguardar startup
echo "⏳ Waiting 60s for startup..."
for i in {60..1}; do
    if [ $((i % 15)) -eq 0 ] && [ $i -ne 60 ]; then
        echo "   ${i}s remaining..."
    fi
    sleep 1
done
echo "✅ Wait complete"
echo ""

# 6. Verificar status
echo "📊 Container status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Health}}" | grep briefflow-scraper || echo "Container not running"
echo ""

# 7. Testar curl de dentro do container
echo "🧪 Testing curl from inside container..."
if docker exec briefflow-scraper which curl > /dev/null 2>&1; then
    echo "✅ Curl is installed!"
    
    echo "Testing HTTP from inside..."
    docker exec briefflow-scraper curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/ || echo "Failed"
    
    echo ""
    echo "Testing health endpoint from inside..."
    docker exec briefflow-scraper curl -s http://127.0.0.1:8000/ || echo "Failed"
else
    echo "❌ Curl is NOT installed!"
fi
echo ""

# 8. Testar de fora
echo "🧪 Testing HTTP from outside..."
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/ 2>/dev/null || echo "000")
echo "HTTP Status: $HEALTH"
echo ""

if [ "$HEALTH" = "200" ]; then
    echo "✅ External HTTP test PASSED!"
    echo ""
    echo "Full response:"
    curl -s http://localhost:8000/ | head -20
else
    echo "⚠️  External HTTP test failed ($HEALTH)"
    echo "Waiting another 30s..."
    sleep 30
    
    echo ""
    echo "Retry testing HTTP from outside..."
    HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/ 2>/dev/null || echo "000")
    echo "HTTP Status: $HEALTH"
    
    if [ "$HEALTH" = "200" ]; then
        echo "✅ External HTTP test PASSED on retry!"
    else
        echo "❌ External HTTP test still failing ($HEALTH)"
    fi
fi

# 9. Verificar logs
echo ""
echo "📋 Scraper logs (last 30 lines):"
docker logs briefflow-scraper --tail 30
echo ""

# 10. Verificar status final
echo "📊 Final status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Health}}\t{{.Ports}}" | grep briefflow-scraper || echo "Container not running"
echo ""

echo "======================================"
echo "✅ Done! Check status in 1-2 minutes"
echo "======================================"
echo ""
echo "Monitor: docker logs -f briefflow-scraper"
echo "Status: docker ps | grep briefflow-scraper"
echo ""
echo "🎯 Expected result:"
echo "   Container: briefflow-scraper"
echo "   Status: Up X minutes (healthy)"
echo "   Port: 0.0.0.0:8000->8000/tcp"
echo ""
