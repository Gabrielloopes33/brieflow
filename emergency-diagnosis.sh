#!/bin/bash
# Script de Diagnóstico e Recuperação do Stack BriefFlow
# Uso: ./emergency-diagnosis.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

WORK_DIR="/opt/brieflow"

function print_header() {
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "  ${1}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

function print_info() {
    echo -e "${GREEN}ℹ${NC} $1"
}

function print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

function print_error() {
    echo -e "${RED}❌${NC} $1"
}

function print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Função para verificar container
function check_container() {
    local container_name=$1
    local status=$(docker ps --format '{{.State}}' --filter "name=$container_name")
    
    if [ "$status" == "Up" ]; then
        print_success "$container_name está rodando"
    else
        print_error "$container_name NÃO está rodando (Status: $status)"
        return 1
    fi
    
    return 0
}

# Diagnóstico completo
print_header "DIAGNÓSTICO DE EMERGÊNCIA DO STACK"

echo "Data: $(date)"
echo ""

# 1. Verificar BriefFlow App
print_info "[1/5] Verificando container briefflow_app..."
check_container "briefflow_app"
echo ""

# 2. Verificar PostgreSQL
print_info "[2/5] Verificando container briefflow-postgres..."
check_container "briefflow-postgres"
echo ""

# 3. Verificar Redis
print_info "[3/5] Verificando container briefflow_redis..."
check_container "briefflow_redis"
echo ""

# 4. Verificar Nginx
print_info "[4/5] Verificando container briefflow-nginx..."
check_container "briefflow-nginx"
echo ""

# 5. Verificar Logs de Erros Recentes
print_header "ANÁLISE DE LOGS DE ERRO"
echo ""

echo "Verificando últimos erros no PostgreSQL:"
docker logs briefflow-postgres --tail 50 2>/dev/null | grep -i "fatal\|error\|failed" || echo "  Nenhum erro crítico encontrado"
echo ""

echo "Verificando logs do BriefFlow:"
docker logs briefflow-app --tail 50 2>/dev/null | grep -E "(GET|POST).*404" || echo "  Nenhum erro 404 recente"
echo ""

# 6. Verificar Uso de Memória
print_header "ANÁLISE DE RECURSOS DO SISTEMA"
echo ""

docker stats briefflow-postgres briefflow_redis briefflow_app --no-stream --format "table {{.Name}}\t{{.MemUsage}}\t{{.CPUPerc}}\t{{.NetIO}}"
echo ""

# 7. Verificar Volume Montado
print_header "VERIFICAÇÃO DE VOLUME"
echo ""

docker exec briefflow-app ls -la /app/dist/public/index.html 2>/dev/null
docker exec briefflow-app stat /app/dist/public/index.html 2>/dev/null || echo "  Erro ao verificar arquivo"
echo ""

# 8. Logs de Diagnóstico
print_header "GERANDO LOGS COMPLETOS"
echo ""

echo "Capturando logs dos últimos 2 minutos de todos os containers..."
{
    docker logs --since 2m briefflow-postgres > /tmp/redis-diagnosis.log 2>&1
    docker logs --since 2m briefflow_redis > /tmp/redis-diagnosis.log 2>&1
    docker logs --since 2m briefflow-app > /tmp/app-diagnosis.log 2>&1
} &

sleep 3

echo "Logs salvos em /tmp/"
echo "Você pode acessar:"
echo "  cat /tmp/app-diagnosis.log"
echo "  cat /tmp/redis-diagnosis.log"
echo "  docker logs briefflow-postgres"
echo "  docker logs briefflow_redis"
echo ""

# Recomendações
print_header "RECOMENDAÇÕES AUTOMÁTICAS"
echo ""

echo "1. Reiniciar containers problematicos:"
echo "   docker restart briefflow-postgres"
echo "   docker restart briefflow_redis"
echo ""

echo "2. Se PostgreSQL continuar com erros:"
echo "   - Parar container briefflow-postgres"
echo "   - Reiniciar todo o stack (docker-compose down && up)"
echo ""

echo "3. Verificar arquivo de logs:"
echo "   docker logs briefflow-postgres | tail -100"
echo ""

echo "4. Forçar rebuild completo:"
echo "   cd /opt/brieflow"
echo "   docker-compose down"
echo "   docker-compose build --no-cache"
echo "   docker-compose up -d"
echo ""

print_header "RESUMO DO DIAGNÓSTICO"
echo ""

echo "Para visualizar os diagnósticos:"
echo "   docker ps -a"
echo "   docker stats briefflow-postgres briefflow_redis briefflow_app --no-stream"
echo ""

echo "Para logs detalhados:"
echo "   docker logs briefflow-app --tail 100"
echo ""
