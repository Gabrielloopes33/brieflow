#!/bin/bash

# Script de Deploy Rápido para Portainer
# Uso: ./PLAN/deploy_portainer.sh

set -e

STACK_NAME="briefflow"
COMPOSE_FILE="PLAN/docker-compose.portainer.yml"
BACKUP_DIR="PLAN/backups"

echo "🚀 Iniciando deploy da stack $STACK_NAME..."

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

# Backup do deploy anterior
if [ -f "$COMPOSE_FILE" ]; then
    BACKUP_FILE="$BACKUP_DIR/docker-compose.portainer-$(date +%Y%m%d-%H%M%S).yml"
    cp "$COMPOSE_FILE" "$BACKUP_FILE"
    echo "✅ Backup salvo em: $BACKUP_FILE"
fi

# Verificar se o arquivo existe
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ Erro: Arquivo $COMPOSE_FILE não encontrado!"
    exit 1
fi

# Verificar se o Docker Swarm está ativo
if ! docker info | grep -q "Swarm: active"; then
    echo "❌ Erro: Docker Swarm não está ativo!"
    echo "   Execute: docker swarm init"
    exit 1
fi

# Verificar se a stack já existe
if docker stack ls | grep -q "$STACK_NAME"; then
    echo "⚠️  Stack $STACK_NAME já existe. Atualizando..."
    docker stack deploy -c "$COMPOSE_FILE" "$STACK_NAME"
else
    echo "📦 Criando nova stack $STACK_NAME..."
    docker stack deploy -c "$COMPOSE_FILE" "$STACK_NAME"
fi

echo "✅ Deploy iniciado com sucesso!"
echo ""
echo "📊 Comandos úteis:"
echo "   Ver serviços:        docker service ls"
echo "   Ver logs do app:     docker service logs ${STACK_NAME}_app -f"
echo "   Ver logs do nginx:   docker service logs ${STACK_NAME}_nginx -f"
echo "   Ver logs do redis:   docker service logs ${STACK_NAME}_redis -f"
echo "   Reiniciar stack:     docker service scale ${STACK_NAME}_app=0 && docker service scale ${STACK_NAME}_app=1"
echo "   Remover stack:       docker stack rm $STACK_NAME"
echo ""
echo "⏳ Aguardando serviços ficarem prontos (pode levar 3-5 minutos)..."
sleep 10

# Verificar status dos serviços
echo ""
echo "📈 Status dos serviços:"
docker service ls | grep "$STACK_NAME" || echo "   Serviços ainda iniciando..."

echo ""
echo "✨ Deploy concluído! Acesse:"
echo "   App:   http://localhost:5001"
echo "   Nginx: http://localhost:8082"
echo ""
echo "⚠️  IMPORTANTE: Configure as variáveis de ambiente no Portainer!"
echo "   Vá em Stacks → briefflow → Editor → Environment variables"
