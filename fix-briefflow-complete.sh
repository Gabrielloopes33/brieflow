#!/bin/bash

# Script de Diagnóstico e Correção do BriefFlow
# Autor: Claude
# Data: 2026-02-19

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  DIAGNÓSTICO E CORREÇÃO BRIEFFLOW${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Função para verificar se comando foi bem sucedido
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1"
    fi
}

# 1. VERIFICAR ARQUIVO .env
echo -e "${YELLOW}[1/8] Verificando arquivo .env...${NC}"
if [ -f "/opt/brieflow/.env" ]; then
    echo -e "${GREEN}✓${NC} Arquivo .env encontrado"
    echo ""
    echo "Variáveis críticas:"
    grep -E "^(SUPABASE_URL|SUPABASE_ANON_KEY|SUPABASE_SERVICE_KEY|OPENAI_API_KEY|DB_|JWT_SECRET|SESSION_SECRET)" /opt/brieflow/.env | while read line; do
        key=$(echo $line | cut -d'=' -f1)
        value=$(echo $line | cut -d'=' -f2-)
        if [ -z "$value" ]; then
            echo -e "  ${RED}✗${NC} $key= (VAZIO)"
        else
            echo -e "  ${GREEN}✓${NC} $key=****"
        fi
    done
else
    echo -e "${RED}✗${NC} Arquivo .env NÃO encontrado em /opt/brieflow/.env"
    exit 1
fi
echo ""

# 2. VERIFICAR IMAGEM DOCKER
echo -e "${YELLOW}[2/8] Verificando imagem Docker...${NC}"
if docker images | grep -q "briefflow-app"; then
    echo -e "${GREEN}✓${NC} Imagem briefflow-app encontrada"
    docker images | grep briefflow-app
else
    echo -e "${RED}✗${NC} Imagem briefflow-app NÃO encontrada"
    echo "  Será necessário rebuildar: cd /opt/brieflow && docker build -t briefflow-app:latest -f Dockerfile.prebuilt ."
fi
echo ""

# 3. VERIFICAR STATUS DOS SERVIÇOS
echo -e "${YELLOW}[3/8] Verificando status dos serviços...${NC}"
docker service ls | grep briefflow | while read line; do
    service=$(echo $line | awk '{print $2}')
    replicas=$(echo $line | awk '{print $4}')
    if [ "$replicas" = "1/1" ]; then
        echo -e "${GREEN}✓${NC} $service: $replicas"
    else
        echo -e "${RED}✗${NC} $service: $replicas (PROBLEMA)"
    fi
done
echo ""

# 4. VERIFICAR PORTAS EM USO
echo -e "${YELLOW}[4/8] Verificando conflitos de porta...${NC}"
PORTS=("5000" "5432" "6379" "8080")
for port in "${PORTS[@]}"; do
    if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
        process=$(netstat -tlnp 2>/dev/null | grep ":$port " | awk '{print $7}' | head -1)
        echo -e "${RED}✗${NC} Porta $port ocupada por: $process"
    else
        echo -e "${GREEN}✓${NC} Porta $port livre"
    fi
done
echo ""

# 5. VERIFICAR REDE DOCKER
echo -e "${YELLOW}[5/8] Verificando redes Docker...${NC}"
if docker network ls | grep -q "briefflow-network"; then
    echo -e "${GREEN}✓${NC} Rede briefflow-network encontrada"
else
    echo -e "${RED}✗${NC} Rede briefflow-network NÃO encontrada"
fi
echo ""

# 6. TESTAR CONECTIVIDADE DNS
echo -e "${YELLOW}[6/8] Testando resolução DNS interna...${NC}"
# Criar container temporário para testar
docker run --rm --network briefflow_briefflow-network alpine:latest nslookup briefflow_app 2>/dev/null && echo -e "${GREEN}✓${NC} DNS briefflow_app resolvível" || echo -e "${RED}✗${NC} DNS briefflow_app NÃO resolvível (app não está rodando)"
docker run --rm --network briefflow_briefflow-network alpine:latest nslookup briefflow_postgres 2>/dev/null && echo -e "${GREEN}✓${NC} DNS briefflow_postgres resolvível" || echo -e "${RED}✗${NC} DNS briefflow_postgres NÃO resolvível"
docker run --rm --network briefflow_briefflow-network alpine:latest nslookup briefflow_redis 2>/dev/null && echo -e "${GREEN}✓${NC} DNS briefflow_redis resolvível" || echo -e "${RED}✗${NC} DNS briefflow_redis NÃO resolvível"
echo ""

# 7. VERIFICAR VOLUMES
echo -e "${YELLOW}[7/8] Verificando volumes...${NC}"
docker volume ls | grep briefflow | while read line; do
    vol=$(echo $line | awk '{print $2}')
    echo -e "${GREEN}✓${NC} Volume: $vol"
done
echo ""

# 8. TENTAR INICIAR SERVIÇOS
echo -e "${YELLOW}[8/8] Tentando iniciar/reiniciar serviços...${NC}"
echo ""

# Verificar se há variáveis vazias no .env
echo "Verificando variáveis de ambiente críticas..."
MISSING_VARS=()
while IFS='=' read -r key value; do
    # Ignorar linhas comentadas ou vazias
    [[ "$key" =~ ^#.*$ ]] && continue
    [[ -z "$key" ]] && continue
    
    # Verificar se é uma variável crítica
    if [[ "$key" =~ ^(SUPABASE_URL|SUPABASE_ANON_KEY|SUPABASE_SERVICE_KEY|OPENAI_API_KEY|DB_NAME|DB_USER|DB_PASSWORD|JWT_SECRET|SESSION_SECRET)$ ]]; then
        if [ -z "$value" ]; then
            MISSING_VARS+=("$key")
            echo -e "${RED}✗${NC} $key está VAZIA"
        fi
    fi
done < /opt/brieflow/.env

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}❌ ERRO CRÍTICO: As seguintes variáveis estão vazias no .env:${NC}"
    printf '%s\n' "${MISSING_VARS[@]}"
    echo ""
    echo -e "${YELLOW}Por favor, preencha essas variáveis no arquivo /opt/brieflow/.env${NC}"
    echo "Exemplo de como deve ficar:"
    echo "SUPABASE_URL=https://seu-projeto.supabase.co"
    echo "SUPABASE_ANON_KEY=sua-chave-aqui"
    echo "..."
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Todas as variáveis críticas estão preenchidas${NC}"
echo ""

# Tentar iniciar a stack
echo -e "${YELLOW}Iniciando stack briefflow...${NC}"
cd /opt/brieflow

# Remover stack anterior (se existir)
echo "Removendo stack anterior..."
docker stack rm briefflow 2>/dev/null || true
sleep 5

# Verificar se há containers órfãos e remover
echo "Removendo containers órfãos..."
docker ps -a | grep briefflow | awk '{print $1}' | xargs -r docker rm -f 2>/dev/null || true

# Deploy da stack
echo "Deploy da nova stack..."
docker stack deploy -c docker-compose.prebuilt.yml briefflow

# Aguardar inicialização
echo ""
echo "Aguardando inicialização dos serviços (30 segundos)..."
sleep 30

# Verificar status final
echo ""
echo -e "${YELLOW}Status final dos serviços:${NC}"
docker service ls | grep briefflow | while read line; do
    service=$(echo $line | awk '{print $2}')
    replicas=$(echo $line | awk '{print $4}')
    if [ "$replicas" = "1/1" ]; then
        echo -e "${GREEN}✓${NC} $service: $replicas - OK"
    else
        echo -e "${RED}✗${NC} $service: $replicas - FALHA"
        echo "    Logs: docker service logs $service"
    fi
done

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  DIAGNÓSTICO CONCLUÍDO${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Se algum serviço ainda estiver falhando, execute:"
echo "  docker service logs <nome-do-servico>"
echo ""
echo "Para verificar o app:"
echo "  docker service logs briefflow_app"
