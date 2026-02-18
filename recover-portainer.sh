#!/bin/bash

echo "🔄 Recuperando Portainer com dados antigos..."
echo "=========================================="

# 1. Parar portainer atual
echo "🛑 Parando portainer atual..."
docker stop brieflow-portainer-1

# 2. Remover container atual (mantém o volume)
echo "🗑️  Removendo container atual..."
docker rm brieflow-portainer-1

# 3. Recriar portainer com dados antigos
echo "🚀 Criando portainer com dados antigos..."
docker run -d \
  --name portainer \
  --restart always \
  -p 9000:9000 \
  -p 9443:9443 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest

# 4. Aguardar inicialização
echo "⏳ Aguardando inicialização..."
sleep 10

# 5. Verificar status
echo "✅ Verificando status..."
docker ps | grep portainer

echo ""
echo "🎉 Portainer recuperado com dados antigos!"
echo ""
echo "🌐 Acesse: http://185.216.203.73:9000"
echo "🔐 Use suas credenciais antigas"
echo ""
echo "Se não funcionar imediatamente, aguarde mais 30 segundos e tente novamente."