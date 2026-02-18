#!/bin/bash

# Script de build E deploy corrigido
# Uso: cd /opt/brieflow && ./final-build-deploy.sh

set -e

echo "🏗️  === BUILD E DEPLOY CORRIGIDO ==="
echo ""

cd /opt/brieflow

echo "🔍 Verificando se o pull foi feito..."
git status | grep -q "Your branch is behind" && {
    echo "⚠️  Pull necessário primeiro..."
    git pull github main
} || echo "✅ Branch atualizado"
echo ""

echo "🧹 Limpando build anterior..."
rm -rf dist .vite node_modules
echo "✅ Limpeza feita!"
echo ""

echo "📦 Instalando dependências (Node.js v20)..."
npm install
echo "✅ Dependências instaladas!"
echo ""

echo "🏗️  Build do frontend (Vite apenas)..."
npx vite build --config vite.config.ts --mode production

if [ ! -d "dist/public" ] || [ ! -f "dist/public/index.html" ]; then
    echo "❌ Erro: Build do frontend falhou!"
    echo "   Verifique se dist/public/index.html existe"
    exit 1
fi

echo "✅ Build do frontend concluído!"
echo "   Arquivos em dist/public/: $(find dist/public -type f | wc -l)"
echo ""

echo "🔄 Atualizando docker-compose..."
if [ -f "docker-compose.production.yml" ]; then
    echo "   Usando docker-compose.production.yml"
    cp docker-compose.production.yml /tmp/docker-compose-final.yml
else
    echo "   Usando docker-compose.portainer-tsx-direct.yml"
    cp docker-compose.portainer-tsx-direct.yml /tmp/docker-compose-final.yml
fi
echo "✅ Docker-compose atualizado!"
echo ""

echo "🔄 Reiniciando container..."
docker service scale brielflow_app=0
echo "⏳ Aguardando 15 segundos..."
sleep 15
docker service scale brielflow_app=1
echo "✅ Container reiniciado!"
echo ""

echo "⏳ Aguardando container ficar pronto..."
sleep 20

echo "📊 Status dos serviços:"
docker service ls | grep brielflow
echo ""

echo "📂 Verificando arquivos do build..."
if [ -d "dist/public" ]; then
    echo "✅ dist/public/ existe"
    echo "   Arquivos principais:"
    ls -la dist/public/ | head -10
else
    echo "❌ dist/public/ não existe!"
    exit 1
fi
echo ""

echo "✅ === BUILD E DEPLOY CONCLUÍDOS ==="
echo ""
echo "🚀 Acesse a aplicação:"
echo "   http://seu-servidor:5001"
echo ""
echo "🔐 Criar conta:"
echo "   1. Clique em: Fazer Login"
echo "   2. Clique em: Criar conta"
echo "   3. Preencher email e senha"
echo "   4. Confirmar email (se necessário)"
echo "   5. Fazer login e usar!"
echo ""
