#!/bin/bash

# Script FINAL de deploy com correções
# Uso: cd /opt/brieflow && ./final-deploy.sh

set -e

echo "🎉 === DEPLOY FINAL COM CORREÇÕES ==="
echo ""

cd /opt/brieflow

echo "📥 Passo 1: Pull das correções do GitHub..."
git pull github main
echo "✅ Pull realizado!"
echo ""

echo "🧹 Passo 2: Limpando build anterior..."
rm -rf dist .vite node_modules
echo "✅ Limpeza feita!"
echo ""

echo "📦 Passo 3: Instalando dependências..."
npm install
echo "✅ Dependências instaladas!"
echo ""

echo "🏗️  Passo 4: Build do frontend (apenas Vite)..."
npx vite build --config vite.config.ts --mode production

if [ ! -d "dist/public" ]; then
    echo "❌ Erro: dist/public não existe!"
    echo "   O build falhou."
    exit 1
fi

if [ ! -f "dist/public/index.html" ]; then
    echo "❌ Erro: dist/public/index.html não existe!"
    echo "   O build falhou."
    exit 1
fi

echo "✅ Build do frontend concluído!"
echo "   Arquivos criados:"
ls -la dist/public/ | head -15
echo ""

echo "📋 Passo 5: Copiando docker-compose de produção..."
cp docker-compose.production.yml /tmp/docker-compose-final.yml
echo "✅ Docker-compose copiado!"
echo ""

echo "🗑️  Passo 6: Removendo stack antiga..."
docker stack rm brielflow
echo "⏳ Aguardando 15 segundos..."
sleep 15
echo "✅ Stack removida!"
echo ""

echo "🚀 Passo 7: Deploy com novo docker-compose..."
docker stack deploy -c /tmp/docker-compose-final.yml brielflow
echo "✅ Deploy iniciado!"
echo ""

echo "⏳ Aguardando 20 segundos para os serviços iniciarem..."
sleep 20

echo "📊 Status dos serviços:"
docker service ls | grep brielflow
echo ""

echo "🔍 Verificando se o container app está rodando..."
APP_STATUS=$(docker ps | grep brielflow_app | awk '{print $7}' || echo "not-running")

if [ "$APP_STATUS" == "Up" ]; then
    echo "✅ Container brielflow_app está rodando!"
else
    echo "⚠️  Container brielflow_app ainda não está rodando (status: $APP_STATUS)"
    echo "   Verifique os logs: docker service logs brielflow_app --tail 50"
fi
echo ""

echo "📂 Verificando arquivos do build no container..."
docker exec $(docker ps -q -f name=brielflow_app) sh -c "ls -la /app/dist/public/" 2>/dev/null || echo "   Container ainda não disponível para verificar arquivos"
echo ""

echo "✅ === DEPLOY FINAL CONCLUÍDO ==="
echo ""
echo "🚀 Acesse a aplicação:"
echo "   http://seu-servidor:5001"
echo ""
echo "🔐 Testar autenticação:"
echo "   1. Clique em: Fazer Login"
echo "   2. Clique em: Criar conta"
echo "   3. Preencher email e senha"
echo "   4. Fazer login e usar!"
echo ""
echo "📝 Ver logs se necessário:"
echo "   docker service logs brielflow_app -f"
echo ""
