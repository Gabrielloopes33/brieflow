#!/bin/bash
# Script para deploy na VPS após resolver conflitos de merge
# Execute na VPS: bash /opt/brieflow/deploy-after-merge-fix.sh

set -e  # Parar em caso de erro

echo "======================================"
echo "🚀 Deploy na VPS - Pós correção de conflitos"
echo "======================================"
echo ""

# 1. Atualizar código
echo "📥 Atualizando código do GitHub..."
cd /opt/brieflow
git pull github main
echo "✅ Código atualizado"
echo ""

# 2. Limpar cache do Docker (opcional)
echo "🧹 Limpando cache do Docker..."
docker system prune -f --volumes
echo "✅ Cache limpo"
echo ""

# 3. Build dos containers
echo "🔨 Building containers..."
docker compose build scraper app
echo "✅ Build concluído"
echo ""

# 4. Parar containers existentes
echo "🛑 Parando containers..."
docker compose stop scraper app
echo "✅ Containers parados"
echo ""

# 5. Subir novos containers
echo "🚀 Subindo novos containers..."
docker compose up -d scraper app
echo "✅ Containers iniciados"
echo ""

# 6. Aguardar containers iniciarem
echo "⏳ Aguardando containers iniciarem..."
sleep 10
echo "✅ Containers devem estar rodando"
echo ""

# 7. Verificar status dos containers
echo "📊 Status dos containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "NAMES|briefflow"
echo ""

# 8. Verificar logs do Scraper
echo "📋 Logs do Scraper (últimas 30 linhas):"
docker logs briefflow-scraper --tail 30
echo ""

# 9. Verificar logs do App
echo "📋 Logs do App (últimas 30 linhas):"
docker logs briefflow-app --tail 30
echo ""

# 10. Testar health checks
echo "🏥 Testando health checks..."
echo ""
echo "Scraper Health:"
curl -s http://localhost:8000/health | jq '.' || echo "Erro ao conectar com scraper"
echo ""
echo "App Health:"
curl -s http://localhost:5000/api/health | jq '.' || echo "Erro ao conectar com app"
echo ""

# 11. Testar novos endpoints
echo "🧪 Testando novos endpoints..."
echo ""

echo "Teste Search:"
curl -s -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query":"test","numResults":1}' | jq '.' || echo "Erro no search"
echo ""

echo "Teste Scrape:"
curl -s -X POST http://localhost:8000/scrape \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","formats":["markdown"]}' | jq '.' || echo "Erro no scrape"
echo ""

# 12. Testar proxy no backend
echo "🌉 Testando proxy no backend..."
echo ""
echo "Proxy Search:"
curl -s -X POST http://localhost:5000/api/scraper/search \
  -H "Content-Type: application/json" \
  -d '{"query":"test","numResults":1}' | jq '.' || echo "Erro no proxy search"
echo ""

# 13. Verificar conexão entre containers
echo "🔗 Verificando conexão entre containers..."
docker exec briefflow-app curl -s http://scraper:8000/health | jq '.' || echo "Erro na conexão app -> scraper"
echo ""

echo "======================================"
echo "✅ Deploy concluído!"
echo "======================================"
echo ""
echo "📝 Próximos passos:"
echo "1. Testar no frontend: https://briefflow2.netlify.app"
echo "2. Selecionar um cliente"
echo "3. Testar cada aba (Scrape, Search, Agent, Map, Crawl)"
echo "4. Verificar logs em tempo real: docker logs -f briefflow-scraper briefflow-app"
echo ""
