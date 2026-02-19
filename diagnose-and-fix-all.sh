#!/bin/bash

# Script de Diagnóstico e Correção Completo
# Analisa e tenta recuperar todos os serviços Docker Swarm

echo "🔧 DIAGNÓSTICO COMPLETO DA INFRAESTRUTURA"
echo "=========================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_error() { echo -e "${RED}❌ $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# 1. Verificar status do Swarm
echo "📋 1. Verificando Docker Swarm..."
docker info | grep -A 5 "Swarm"

# 2. Listar serviços com problema
echo ""
echo "📋 2. Serviços com problemas (0/1 replicas):"
docker service ls --format "table {{.Name}}\t{{.Replicas}}" | grep "0/1" | head -20

TOTAL_SERVICES=$(docker service ls -q | wc -l)
FAILED_SERVICES=$(docker service ls --format "{{.Replicas}}" | grep "0/" | wc -l)
echo ""
print_warning "Total de serviços: $TOTAL_SERVICES"
print_error "Serviços parados: $FAILED_SERVICES"

# 3. Verificar rede touchNet
echo ""
echo "📋 3. Verificando rede touchNet:"
docker network inspect touchNet --format 'Status: {{json .Containers}}' 

# 4. Verificar logs de erros recentes
echo ""
echo "📋 4. Últimos erros nos serviços:"
docker service ps portainer_portainer --no-trunc 2>&1 | grep -E "(Error|Failed)" | head -5

# 5. Verificar se há conflitos de porta
echo ""
echo "📋 5. Verificando portas em uso:"
ss -tlnp | grep -E ':(80|443|9000|8080|5432|6379)' || netstat -tlnp 2>/dev/null | grep -E ':(80|443|9000|8080|5432|6379)'

echo ""
echo "=========================================="
echo "🔍 ANÁLISE:"
echo ""

if [ "$FAILED_SERVICES" -gt 10 ]; then
    print_error "CRÍTICO: $FAILED_SERVICES serviços estão parados!"
    echo ""
    echo "Causa provável: A rede touchNet foi recriada e perdeu a conexão"
    echo "com todos os containers. Isso afetou TODOS os serviços."
    echo ""
    echo "Opções de correção:"
    echo ""
    echo "1. RECRIAR REDE (RISCO - afeta todos os serviços)"
    echo "   - Parar todos os serviços"
    echo "   - Recriar a rede touchNet"
    echo "   - Subir todos os serviços novamente"
    echo ""
    echo "2. REINICIAR SERVIÇOS (Menor risco)"
    echo "   - Tentar reiniciar os serviços um a um"
    echo "   - Verificar se reconectam à rede"
    echo ""
    echo "3. RESTAURAR BACKUP"
    echo "   - Se houver backup da configuração Docker"
    echo "   - Restaurar estado anterior"
    echo ""
    echo "Recomendo a OPÇÃO 2 primeiro (menor impacto)"
    echo ""
    read -p "Qual opção deseja tentar? (1/2/3): " CHOICE
    
    case $CHOICE in
        1)
            echo ""
            print_warning "Opção 1 selecionada: Recriar rede"
            echo "Isso vai parar TODOS os serviços temporariamente..."
            read -p "Tem certeza? (sim/nao): " CONFIRM
            if [ "$CONFIRM" = "sim" ]; then
                echo "Parando serviços críticos..."
                docker service rm portainer_portainer portainer_agent traefik_traefik
                sleep 5
                echo "Recriando rede touchNet..."
                docker network rm touchNet
                docker network create --driver overlay --attachable touchNet
                echo "Recriando serviços essenciais..."
                docker stack deploy -c traefik.yaml traefik
                sleep 10
                docker stack deploy -c portainer.yaml portainer
                print_success "Serviços essenciais recriados!"
            fi
            ;;
        2)
            echo ""
            print_warning "Opção 2 selecionada: Reiniciar serviços"
            echo "Tentando reiniciar serviços essenciais..."
            docker service update --force traefik_traefik
            sleep 5
            docker service update --force portainer_portainer
            sleep 5
            docker service update --force portainer_agent
            print_success "Serviços reiniciados! Aguarde 30 segundos..."
            sleep 30
            docker service ls | grep -E "(traefik|portainer)"
            ;;
        3)
            echo ""
            print_warning "Restauração de backup não implementada neste script"
            echo "Você precisa restaurar manualmente se tiver backup"
            ;;
        *)
            print_error "Opção inválida"
            ;;
    esac
else
    print_success "Situação não é crítica. Serviços funcionando normalmente."
fi

echo ""
echo "=========================================="
echo "Para verificar status após a correção:"
echo "  docker service ls"
echo "  docker network inspect touchNet --format '{{json .Containers}}' | jq ."
echo ""