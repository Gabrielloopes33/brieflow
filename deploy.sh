#!/bin/bash

# Script final de deploy - build completo
# Uso: cd /opt/brieflow && ./deploy.sh

set -e

echo "🚀 === DEPLOY FINAL ==="
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

echo "🏗️  Passo 4: Build completo..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Erro: dist/ não foi criado!"
    exit 1
fi

if [ ! -d "dist/public" ]; then
    echo "❌ Erro: dist/public/ não foi criado!"
    exit 1
fi

if [ ! -f "dist/public/index.html" ]; then
    echo "❌ Erro: dist/public/index.html não foi criado!"
    exit 1
fi

if [ ! -f "dist/index.cjs" ]; then
    echo "❌ Erro: dist/index.cjs não foi criado!"
    exit 1
fi

echo "✅ Build concluído com sucesso!"
echo "   - dist/public/index.html: ✅"
echo "   - dist/assets/: $(ls dist/assets/ | wc -l) arquivos"
echo "   - dist/index.cjs: $(ls -lh dist/index.cjs | awk '{print $5}')"
echo ""

echo "🔄 Passo 5: Reiniciando container..."
docker service scale brielflow_app=0
echo "⏳ Aguardando 15 segundos..."
sleep 15
docker service scale brielflow_app=1
echo "✅ Container reiniciado!"
echo ""

echo "⏳ Aguardando 20 segundos para o serviço ficar pronto..."
sleep 20

echo "📊 Status dos serviços:"
docker service ls | grep brielflow
echo ""

echo "📂 Verificando arquivos do build:"
echo "   dist/public/"
ls -la dist/public/ | head -10
echo ""

echo "✅ === DEPLOY CONCLUÍDO ==="
echo ""
echo "🚀 Acesse a aplicação:"
echo "   http://seu-servidor:5001"
echo ""
echo "🔐 Para criar conta:"
echo "   1. Clique em: Fazer Login"
echo "   2. Clique em: Criar conta"
echo "   3. Preencher email e senha"
echo "   4. Confirmar email (se necessário)"
echo "   5. Fazer login e usar!"
echo ""
