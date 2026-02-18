#!/bin/bash

# Script de Debug para Container App
# Uso: docker exec -it <container_id> sh -c "$(cat debug_container.sh)"

set -e

echo "🔍 === DEBUG CONTAINER APP ==="
echo ""

echo "📁 Estrutura de diretórios:"
ls -la /app
echo ""

echo "📦 Verificando node_modules:"
if [ -d "/app/node_modules" ]; then
    echo "✅ node_modules existe"
    echo "   Total de arquivos: $(find /app/node_modules -type f | wc -l)"
else
    echo "❌ node_modules NÃO existe"
fi
echo ""

echo "📋 Verificando arquivos do projeto:"
for dir in client server shared script; do
    if [ -d "/app/$dir" ]; then
        echo "✅ /app/$dir existe"
    else
        echo "❌ /app/$dir NÃO existe"
    fi
done
echo ""

echo "📄 Verificando arquivos de configuração:"
for file in package.json vite.config.ts tsconfig.json; do
    if [ -f "/app/$file" ]; then
        echo "✅ /app/$file existe"
    else
        echo "❌ /app/$file NÃO existe"
    fi
done
echo ""

echo "🎯 Verificando script/build.ts:"
if [ -f "/app/script/build.ts" ]; then
    echo "✅ script/build.ts existe"
else
    echo "❌ script/build.ts NÃO existe"
fi
echo ""

echo "📊 Uso de disco:"
df -h
echo ""

echo "🧠 Uso de memória:"
free -h
echo ""

echo "🔧 Informações do Node:"
node --version
npm --version
echo ""

echo "📦 Lista de dependências instaladas:"
npm list --depth=0 2>&1 | head -20
echo ""

echo "🚀 Tentando executar build manualmente:"
cd /app
npx tsx script/build.ts || echo "❌ Build falhou com código: $?"
echo ""

echo "🔍 === FIM DO DEBUG ==="
