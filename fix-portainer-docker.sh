#!/bin/bash

echo "🔧 Corrigindo conexão Portainer com Docker"
echo "==========================================="

# 1. Verificar se o socket do Docker está acessível
echo "📋 Verificando Docker socket..."
ls -la /var/run/docker.sock

# 2. Recriar Portainer com socket correto
echo "🔄 Recriando Portainer com acesso ao Docker..."
docker stop portainer
docker rm portainer

# 3. Criar novamente com mount correto do socket
docker run -d \
  --name portainer \
  --restart always \
  -p 9000:9000 \
  -p 9443:9443 \
  --privileged \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest

# 4. Aguardar inicialização
echo "⏳ Aguardando..."
sleep 15

# 5. Verificar se conectou
echo "✅ Verificando conexão..."
docker logs portainer --tail 20 | grep -E "(Docker|environment|connected)"

echo ""
echo "🎉 Portainer recriado!"
echo ""
echo "🌐 Acesse: http://185.216.203.73:9000"
echo ""
echo "Se ainda mostrar 'unreachable':"
echo "1. Vá em Settings > Environments"
echo "2. Clique em 'Primary' > Edit"
echo "3. Verifique se a URL está: unix:///var/run/docker.sock"
echo "4. Ou adicione um novo environment com tipo 'Docker' e endpoint 'unix:///var/run/docker.sock'"