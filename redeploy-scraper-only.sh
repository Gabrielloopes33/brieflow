#!/bin/bash
# Script simplificado para redeploy na VPS após fix do requirements.txt
# Execute na VPS: bash /opt/brieflow/redeploy-scraper-only.sh

set -e

echo "======================================"
echo "🚀 Redeploy - Fix requirements.txt"
echo "======================================"
echo ""

# 1. Atualizar código
echo "📥 Atualizando código do GitHub..."
cd /opt/brieflow
git pull github main
echo "✅ Código atualizado"
echo ""

# 2. Fazer build apenas do scraper
echo "🔨 Rebuild do scraper (app já foi buildado antes)..."
docker compose build --no-cache scraper
echo "✅ Scraper rebuild concluído"
echo ""

# 3. Parar e remover o container scraper existente
echo "🛑 Parando container scraper..."
docker compose stop scraper
docker compose rm -f scraper
echo "✅ Container scraper removido"
echo ""

# 4. Subir novo container scraper
echo "🚀 Subindo novo container scraper..."
docker compose up -d scraper
echo "✅ Scraper iniciado"
echo ""

# 5. Aguardar iniciar
echo "⏳ Aguardando scraper iniciar..."
sleep 10
echo "✅ Scraper deve estar rodando"
echo ""

# 6. Verificar status
echo "📊 Status dos containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "NAMES|briefflow"
echo ""

# 7. Verificar logs
echo "📋 Logs do Scraper (últimas 50 linhas):"
docker logs briefflow-scraper --tail 50
echo ""

# 8. Testar health check
echo "🏥 Testando health check do scraper..."
curl -s http://localhost:8000/health | jq '.' || echo "Erro ao conectar"
echo ""

# 9. Testar endpoint scrape
echo "🔪 Testando endpoint /scrape..."
curl -s -X POST http://localhost:8000/scrape \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","formats":["markdown"]}' | jq '.' || echo "Erro no scrape"
echo ""

# 10. Testar endpoint search
echo "🔍 Testando endpoint /search..."
curl -s -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query":"test","numResults":1}' | jq '.' || echo "Erro no search"
echo ""

# 11. Testar proxy via app
echo "🌉 Testando proxy via app backend..."
docker exec briefflow-app curl -s -X POST http://scraper:8000/scrape \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","formats":["markdown"]}' | jq '.' || echo "Erro no proxy"
echo ""

echo "======================================"
echo "✅ Redeploy concluído!"
echo "======================================"
echo ""
echo "📝 Próximos passos:"
echo "1. Testar no frontend: https://briefflow2.netlify.app"
echo "2. Acessar cada aba e testar os botões"
echo "3. Verificar se conteúdo é salvo no banco"
echo "4. Monitorar logs: docker logs -f briefflow-scraper"
echo ""
