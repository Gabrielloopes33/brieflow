#!/bin/bash

# Script FINAL e SIMPLIFICADO de deploy
# Uso: cd /opt/brieflow && ./deploy-final.sh

set -e

echo "🚀 === DEPLOY FINAL - CORRIGINDO ERROS ==="
echo ""

cd /opt/brieflow

echo "📥 Passo 1: Pull das correções..."
git pull github main
echo "✅ Pull realizado!"
echo ""

echo "🧹 Passo 2: Limpando build anterior..."
rm -rf dist .vite node_modules package-lock.json
echo "✅ Limpeza feita!"
echo ""

echo "📦 Passo 3: Instalando dependências..."
npm install
echo "✅ Dependências instaladas!"
echo ""

echo "🔧 Passo 4: Build de DEVELOPMENT (sem minificação)..."
NODE_ENV=development npx vite build --config vite.config.ts --mode development

if [ ! -d "dist/public" ]; then
    echo "❌ Erro: dist/public não existe!"
    exit 1
fi

if [ ! -f "dist/public/index.html" ]; then
    echo "❌ Erro: dist/public/index.html não existe!"
    exit 1
fi

echo "✅ Build concluído!"
echo "   Arquivos: $(find dist/public -type f | wc -l)"
echo "   Build: development (sem minificação)"
echo ""

echo "🗑️  Passo 5: Removendo stack antiga..."
docker stack rm brielflow
echo "⏳ Aguardando 15 segundos..."
sleep 15
echo "✅ Stack removida!"
echo ""

echo "🚀 Passo 6: Deploy com docker-compose.dev.yml..."
docker stack deploy -c docker-compose.dev.yml brielflow
echo "✅ Deploy iniciado!"
echo ""

echo "⏳ Aguardando 20 segundos para os serviços iniciarem..."
sleep 20

echo "📊 Status dos serviços:"
docker service ls | grep brielflow
echo ""

echo "📂 Verificando arquivos do build:"
ls -la dist/public/ | head -15
echo ""

echo "✅ === DEPLOY FINAL CONCLUÍDO ==="
echo ""
echo "🚀 Acesse a aplicação:"
echo "   http://seu-servidor:5001"
echo ""
echo "🔐 Testar autenticação:"
echo "   1. Acesse http://seu-servidor:5001"
echo "   2. Clique em: Fazer Login"
echo "   3. Clique em: Criar conta"
echo "   4. Preencha email e senha"
echo "   5. Fazer login e usar!"
echo ""
echo "📝 Ver logs se necessário:"
echo "   docker service logs brielflow_app -f"
echo ""
