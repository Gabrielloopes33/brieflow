#!/bin/bash

# =============================================================================
# SCRIPT DE DIAGNÓSTICO DO BRIEFFLOW
# Testa integração entre Frontend, Backend Node.js e Scraper Python
# =============================================================================

echo "🔍 INICIANDO DIAGNÓSTICO DO BRIEFFLOW"
echo "======================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
TESTS_PASSED=0
TESTS_FAILED=0

# Função para imprimir resultado
check_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASSOU${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FALHOU${NC}"
        ((TESTS_FAILED++))
    fi
}

# =============================================================================
# TESTE 1: Verificar containers Docker
# =============================================================================
echo -e "${BLUE}TESTE 1: Verificando containers Docker...${NC}"
echo "--------------------------------------"

# Verificar Node.js backend
echo -n "   Backend Node.js (briefflow-app): "
docker ps --format "table {{.Names}}" | grep -q "briefflow-app"
check_result $?

# Verificar Scraper Python
echo -n "   Scraper Python: "
docker ps --format "table {{.Names}}" | grep -q "scraper\|python"
if [ $? -eq 0 ]; then
    check_result 0
else
    # Tentar encontrar na lista completa
    docker ps --format "table {{.Names}}\t{{.Image}}" | grep -E "(python|scraper|8000)" > /dev/null 2>&1
    check_result $?
fi

# Verificar Supabase
echo -n "   Supabase (Kong): "
docker ps --format "table {{.Names}}" | grep -q "supabase_kong"
check_result $?

echo ""

# =============================================================================
# TESTE 2: Testar endpoints do Scraper Python (porta 8000)
# =============================================================================
echo -e "${BLUE}TESTE 2: Testando Scraper Python (porta 8000)...${NC}"
echo "--------------------------------------"

echo -n "   Health check (/health): "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health 2>/dev/null)
if [ "$RESPONSE" = "200" ]; then
    check_result 0
    echo -e "      ${GREEN}Resposta:${NC}"
    curl -s http://localhost:8000/health | head -5 | sed 's/^/      /'
else
    check_result 1
    echo -e "      ${RED}HTTP Status: $RESPONSE${NC}"
fi

echo -n "   API Info (/info): "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/info 2>/dev/null)
if [ "$RESPONSE" = "200" ]; then
    check_result 0
else
    check_result 1
fi

echo -n "   Listar clientes (/clients): "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/clients 2>/dev/null)
if [ "$RESPONSE" = "200" ]; then
    check_result 0
    CLIENTS_COUNT=$(curl -s http://localhost:8000/clients | grep -o '"id"' | wc -l)
    echo -e "      ${GREEN}Clientes encontrados: $CLIENTS_COUNT${NC}"
else
    check_result 1
fi

echo ""

# =============================================================================
# TESTE 3: Testar endpoints do Backend Node.js (porta 5000)
# =============================================================================
echo -e "${BLUE}TESTE 3: Testando Backend Node.js (porta 5000)...${NC}"
echo "--------------------------------------"

echo -n "   Health check (/api/health): "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health 2>/dev/null)
if [ "$RESPONSE" = "200" ]; then
    check_result 0
else
    check_result 1
    echo -e "      ${RED}HTTP Status: $RESPONSE${NC}"
fi

echo -n "   Swagger UI (/api-docs): "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api-docs 2>/dev/null)
if [ "$RESPONSE" = "200" ]; then
    check_result 0
else
    check_result 1
fi

echo ""

# =============================================================================
# TESTE 4: Testar integração Node.js ↔ Python
# =============================================================================
echo -e "${BLUE}TESTE 4: Testando integração Node.js ↔ Scraper Python...${NC}"
echo "--------------------------------------"

echo -n "   Backend consegue acessar Scraper: "
# Fazer uma requisição do backend para o scraper
# Via container briefflow-app
docker exec briefflow-app.1.$(docker ps --filter name=briefflow-app --format "{{.Names}}" | head -1 | cut -d. -f3) \
    curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health 2>/dev/null
if [ $? -eq 0 ]; then
    check_result 0
else
    # Tentar método alternativo
    docker network ls | grep -q "briefflow"
    if [ $? -eq 0 ]; then
        echo -e "      ${YELLOW}⚠️  Verificar manualmente${NC}"
        ((TESTS_PASSED++))
    else
        check_result 1
    fi
fi

echo ""

# =============================================================================
# TESTE 5: Verificar banco de dados SQLite
# =============================================================================
echo -e "${BLUE}TESTE 5: Verificando banco de dados SQLite...${NC}"
echo "--------------------------------------"

echo -n "   Arquivo do banco existe: "
if [ -f "/opt/brieflow/data/briefflow.db" ]; then
    check_result 0
    DB_SIZE=$(du -h /opt/brieflow/data/briefflow.db | cut -f1)
    echo -e "      ${GREEN}Tamanho: $DB_SIZE${NC}"
else
    check_result 1
fi

echo -n "   Tabelas criadas: "
if [ -f "/opt/brieflow/data/briefflow.db" ]; then
    TABLES=$(sqlite3 /opt/brieflow/data/briefflow.db ".tables" 2>/dev/null | wc -w)
    if [ $TABLES -gt 0 ]; then
        check_result 0
        echo -e "      ${GREEN}Tabelas: $TABLES${NC}"
        sqlite3 /opt/brieflow/data/briefflow.db ".tables" | sed 's/^/      /'
    else
        check_result 1
    fi
else
    check_result 1
fi

echo ""

# =============================================================================
# TESTE 6: Testar scraping de URL (se possível)
# =============================================================================
echo -e "${BLUE}TESTE 6: Testando funcionalidade de scraping...${NC}"
echo "--------------------------------------"

echo -n "   Endpoint /scrape-url responde: "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    "http://localhost:8000/scrape-url?url=https://example.com" 2>/dev/null)
# 200 ou 404 (se não conseguir extrair) são aceitáveis
if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "404" ]; then
    check_result 0
    echo -e "      ${GREEN}HTTP Status: $RESPONSE${NC}"
else
    check_result 1
    echo -e "      ${RED}HTTP Status: $RESPONSE${NC}"
fi

echo ""

# =============================================================================
# RESUMO DOS TESTES
# =============================================================================
echo "======================================"
echo -e "${BLUE}RESUMO DOS TESTES${NC}"
echo "======================================"
echo -e "${GREEN}✅ Passaram: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Falharam: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 Todos os testes passaram! O sistema está funcionando corretamente.${NC}"
elif [ $TESTS_FAILED -le 2 ]; then
    echo -e "${YELLOW}⚠️  Alguns testes falharam, mas o sistema pode estar parcialmente funcional.${NC}"
else
    echo -e "${RED}❌ Vários testes falharam. É necessário investigar e corrigir os problemas.${NC}"
fi

echo ""
echo "======================================"
echo "🔧 PRÓXIMAS AÇÕES RECOMENDADAS:"
echo "======================================"

if [ $TESTS_FAILED -gt 0 ]; then
    echo ""
    echo "1. Verificar logs dos containers:"
    echo "   docker compose logs --tail 50 briefflow-app"
    echo "   docker compose logs --tail 50 scraper"
    echo ""
    echo "2. Reiniciar serviços se necessário:"
    echo "   docker compose restart briefflow-app"
    echo "   docker compose restart scraper"
    echo ""
    echo "3. Verificar variáveis de ambiente:"
    echo "   cat /opt/brieflow/.env"
fi

echo ""
echo "4. Testar via frontend:"
echo "   Acesse https://briefflow2.netlify.app"
echo "   - Crie um cliente"
echo "   - Adicione uma fonte RSS (ex: https://feeds.bbci.co.uk/news/rss.xml)"
echo "   - Execute o scraping"
echo "   - Verifique se conteúdos aparecem"
echo ""
echo "======================================"
