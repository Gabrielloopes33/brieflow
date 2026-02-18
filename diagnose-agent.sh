#!/bin/bash
# Script para diagnosticar o problema do Agent tab
# Execute na VPS: bash /opt/brieflow/diagnose-agent.sh

set -e

echo "======================================"
echo "🔍 Diagnóstico do Agent Tab"
echo "======================================"
echo ""

# 1. Verificar logs recentes do scraper
echo "📋 Logs do scraper (últimas 50 linhas):"
docker logs briefflow-scraper --tail 50
echo ""

# 2. Testar Agent diretamente no scraper
echo "🧪 Testando Agent diretamente..."
curl -s -X POST http://localhost:8000/agent \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Olá mundo, responda em 1 frase",
    "model": "glm-4-flash"
  }' | jq '.'

echo ""
echo "📝 Compare os resultados:"
echo ""
echo "✅ Se funcionar acima, o problema é no frontend/proxy"
echo "❌ Se falhar acima, o problema é no scraper/Z.ai"
echo ""
echo "======================================"
echo "🔍 Diagnóstico no Frontend"
echo "======================================"
echo ""
echo "Para diagnosticar no navegador:"
echo ""
echo "1. Abra https://briefflow2.netlify.app"
echo "2. Faça login e selecione um cliente"
echo "3. Vá para a aba Agent"
echo "4. Abra o Console (F12)"
echo "5. Digite um prompt e clique em 'Run Agent'"
echo "6. Observe as requisições na aba 'Network'"
echo ""
echo "Procure por:"
echo "  - Requisições para /api/scraper/agent"
echo "  - O corpo (body) da requisição"
echo "  - Qual erro aparece no Console"
echo "  - Qual erro aparece na Network tab"
echo ""
echo "======================================"
echo "📋 Possíveis Soluções"
echo "======================================"
echo ""
echo "Se o problema for no frontend/proxy:"
echo "  1. Verificar se há caracteres especiais no prompt"
echo "  2. Verificar o encoding da requisição"
echo " 3. Limpar cache do navegador"
echo ""
echo "Se o problema for no scraper/Z.ai:"
echo "  1. Modelo glm-4-flash pode não estar disponível"
echo "  2. API key pode ter problemas de permissão"
echo "  3. Tentar modelo diferente: glm-4, gpt-3.5-turbo"
echo "  4. Usar formato diferente da API Z.ai"
echo ""
echo "======================================"
echo "🚨 Solução Rápida (Se Agent não for crítico)"
echo "======================================"
echo ""
echo "Se o Agent não for essencial para funcionamento imediato:"
echo "1. Desabilitar a aba Agent temporariamente no frontend"
echo "2. Focar nas outras funções (Scrape, Search, Map, Crawl)"
echo "3. Resolver o problema do Agent depois"
echo ""
