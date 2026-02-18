#!/bin/bash
# Script para atualizar apenas o modelo do Agent Scraper
# Execute na VPS: bash /opt/brieflow/update-agent-model.sh

set -e

echo "======================================"
echo "🔄 Update Agent Model - glm-4-flash"
echo "======================================"
echo ""

# 1. Atualizar código
echo "📥 Pulling latest code..."
cd /opt/brieflow
git pull github main
echo "✅ Code updated"
echo ""

# 2. Reiniciar scraper (sem rebuild)
echo "🔄 Restarting scraper..."
docker compose restart scraper
echo "✅ Scraper restarted"
echo ""

# 3. Aguardar startup
echo "⏳ Waiting for startup (30s)..."
sleep 30
echo "✅ Wait complete"
echo ""

# 4. Verificar status
echo "📊 Container status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Health}}" | grep briefflow-scraper
echo ""

# 5. Verificar logs
echo "📋 Scraper logs (last 20 lines):"
docker logs briefflow-scraper --tail 20
echo ""

# 6. Testar Agent endpoint
echo "🤖 Testing Agent endpoint..."
curl -s -X POST http://localhost:8000/agent \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Olá mundo, responda em 1 frase"}' | jq '.'
echo ""

echo "======================================"
echo "✅ Update complete!"
echo "======================================"
echo ""
echo "📝 Changed model from glm-5 to glm-4-flash"
echo "🧪 Agent tab should now work in the frontend"
echo ""
echo "🧪 Test in frontend:"
echo "1. Access: https://briefflow2.netlify.app"
echo "2. Select a client"
echo "3. Go to Agent tab"
echo "4. Enter a prompt (ex: Olá mundo)"
echo "5. Click 'Run Agent'"
echo "6. Should get a response from Z.ai!"
echo ""
