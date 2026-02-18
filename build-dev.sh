#!/bin/bash

# Script de build sem minificação para debug
# Uso: cd /opt/brieflow && ./build-dev.sh

set -e

echo "🔧 === BUILD SEM MINIFICAÇÃO (DEBUG) ==="
echo ""

cd /opt/brieflow

echo "🧹 Limpando..."
rm -rf dist .vite
echo "✅ Limpeza feita!"
echo ""

echo "📦 Instalando dependências..."
npm install
echo "✅ Dependências instaladas!"
echo ""

echo "🏗️  Build sem minificação..."
NODE_ENV=development npx vite build --config vite.config.ts --mode development

if [ ! -d "dist/public" ]; then
    echo "❌ Erro: dist/public não existe!"
    exit 1
fi

echo "✅ Build concluído!"
echo "   Sourcemap habilitado"
echo "   Sem minificação"
echo "   Ideal para debug"
echo ""

echo "📊 Arquivos:"
ls -la dist/public/ | head -10
echo ""

echo "✅ === BUILD CONCLUÍDO ==="
