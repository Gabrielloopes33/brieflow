#!/bin/bash

# Script de PULL E DEPLOY na VPS
# Uso: cd /opt/brieflow && ./pull-and-deploy.sh

set -e

echo "🚀 === PULL E DEPLOY DO BRIEFLLOW ==="
echo ""

cd /opt/brieflow

echo "📥 Passo 1: Pull das mudanças do GitHub..."
git pull github main
echo "✅ Pull realizado!"
echo ""

echo "🧹 Passo 2: Limpando cache..."
rm -rf dist .vite
echo "✅ Cache limpo!"
echo ""

echo "🏗️  Passo 3: Executando build..."
npx vite build --config vite.config.ts --mode production
echo "✅ Build concluído!"
echo ""

echo "🔄 Passo 4: Reiniciando container..."
docker service scale brielflow_app=0
echo "⏳ Aguardando 10 segundos..."
sleep 10
docker service scale brielflow_app=1
echo "✅ Container reiniciado!"
echo ""

echo "⏳ Aguardando container ficar pronto..."
sleep 15

echo "📊 Status dos serviços:"
docker service ls | grep brielflow
echo ""

echo "✅ === DEPLOY CONCLUÍDO ==="
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
echo "✨ Nova interface de autenticação disponível!"
echo ""
