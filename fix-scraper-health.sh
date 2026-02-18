#!/bin/bash
# Script para corrigir o problema de health check do scraper
# Execute na VPS: bash /opt/brieflow/fix-scraper-health.sh

set -e

echo "======================================"
echo "🔧 Corrigir Health Check do Scraper"
echo "======================================"
echo ""

# 1. Atualizar código
echo "📥 Atualizando código do GitHub..."
cd /opt/brieflow
git pull github main
echo "✅ Código atualizado"
echo ""

# 2. Parar container scraper
echo "🛑 Parando container scraper..."
docker compose stop scraper
docker compose rm -f scraper
echo "✅ Container removido"
echo ""

# 3. Limpar imagens antigas (opcional)
echo "🧹 Limpando imagens antigas..."
docker rmi briefflow-scraper 2>/dev/null || echo "Nenhuma imagem antiga encontrada"
echo "✅ Imagens limpas"
echo ""

# 4. Rebuild do scraper (sem cache para garantir mudanças)
echo "🔨 Rebuild do scraper..."
docker compose build --no-cache scraper
echo "✅ Build concluído"
echo ""

# 5. Iniciar scraper
echo "🚀 Iniciando scraper..."
docker compose up -d scraper
echo "✅ Scraper iniciado"
echo ""

# 6. Aguardar startup (agora sem --reload, deve ser mais rápido)
echo "⏳ Aguardando scraper inicializar..."
sleep 15
echo "✅ Tempo de espera concluído"
echo ""

# 7. Verificar status inicial
echo "📊 Status inicial dos containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "NAMES|briefflow-scraper"
echo ""

# 8. Verificar logs
echo "📋 Logs do scraper (últimas 30 linhas):"
docker logs briefflow-scraper --tail 30
echo ""

# 9. Testar health check manualmente
echo "🏥 Testando health check (1ª tentativa)..."
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health || echo "000")
echo "HTTP Status: $HEALTH"

if [ "$HEALTH" = "200" ]; then
    echo "✅ Health check passou na 1ª tentativa!"
else
    echo "⏳ Health check ainda não pronto, aguardando mais 15s..."
    sleep 15
    
    echo "🏥 Testando health check (2ª tentativa)..."
    HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health || echo "000")
    echo "HTTP Status: $HEALTH"
    
    if [ "$HEALTH" = "200" ]; then
        echo "✅ Health check passou na 2ª tentativa!"
    else
        echo "⚠️  Health check ainda falhando..."
        echo ""
        echo "📋 Logs completos:"
        docker logs briefflow-scraper --tail 100
        echo ""
        echo "======================================"
        echo "⚠️  Container pode estar unhealthy temporariamente"
        echo "======================================"
        echo ""
        echo "O Docker health check tentará novamente em 30s."
        echo "Se continuar unhealthy após alguns minutos, investigue logs acima."
        echo ""
        exit 0
    fi
fi

# 10. Mostrar resposta completa do health check
echo ""
echo "📋 Resposta completa do health check:"
curl -s http://localhost:8000/health | jq '.'
echo ""

# 11. Testar rota principal também
echo "📋 Testando rota principal (/)..."
curl -s http://localhost:8000/ | jq '.'
echo ""

# 12. Verificar status final dos containers
echo "📊 Status final dos containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Health}}\t{{.Ports}}" | grep briefflow-scraper
echo ""

echo "======================================"
echo "✅ Correção concluída!"
echo "======================================"
echo ""
echo "📝 O que foi corrigido:"
echo "   - Removido flag --reload do entrypoint.sh"
echo "   - --reload é para desenvolvimento, causa race conditions em produção"
echo "   - Agora o FastAPI roda em foreground corretamente"
echo ""
echo "🧪 Verifique se o status mudou para 'healthy' em alguns minutos:"
echo "   docker ps | grep briefflow-scraper"
echo ""
echo "📊 Ou no Portainer, veja se o status mudou."
echo ""
echo "⏳ O Docker health check tentará a cada 30s."
echo "   Se estiver 'starting' agora, deve mudar para 'healthy' logo."
echo ""
