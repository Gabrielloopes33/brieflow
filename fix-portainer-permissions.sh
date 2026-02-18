#!/bin/bash

echo "🔧 Corrigindo permissões Docker no Portainer"
echo "============================================"

# 1. Verificar grupo do socket Docker
echo "📋 Verificando grupo Docker..."
DOCKER_GID=$(stat -c '%g' /var/run/docker.sock)
echo "Docker GID: $DOCKER_GID"

# 2. Parar portainer
echo "🛑 Parando portainer..."
docker stop portainer

# 3. Remover container
echo "🗑️  Removendo container..."
docker rm portainer

# 4. Criar com grupo correto
echo "🚀 Criando portainer com grupo docker..."
docker run -d \
  --name portainer \
  --restart always \
  --group-add $DOCKER_GID \
  -p 9000:9000 \
  -p 9443:9443 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest

# 5. Aguardar
echo "⏳ Aguardando 15 segundos..."
sleep 15

# 6. Verificar
echo "✅ Verificando..."
docker exec portainer ls -la /var/run/docker.sock || echo "❌ Socket não acessível"
docker logs portainer --tail 5

echo ""
echo "🎉 Portainer recriado com permissões corretas!"
echo "🌐 Acesse: http://185.216.203.73:9000"
echo ""
echo "Se ainda mostrar erro:"
echo "1. Entre no Portainer"
echo "2. Vá em Environments > local"
echo "3. Em 'TLS', desmarque 'TLS' se estiver marcado"
echo "4. Salve e teste a conexão"