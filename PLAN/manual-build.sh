#!/bin/bash

# Script de build MANUAL para rodar no servidor
# Execute este script NO SERVIDOR, no diretório /opt/brieflow
# Uso: cd /opt/brieflow && ./PLAN/manual-build.sh

set -e

echo "🏗️  === BUILD MANUAL DO BRIEFLOW ==="
echo ""

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório /opt/brieflow"
    echo "   cd /opt/brieflow && ./PLAN/manual-build.sh"
    exit 1
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Erro: Node.js não encontrado"
    exit 1
fi

echo "📦 Versões instaladas:"
node --version
npm --version
echo ""

# Limpar instalação anterior
echo "🧹 Limpando instalação anterior..."
rm -rf node_modules package-lock.json
rm -rf dist
rm -rf .vite
echo "✅ Limpeza concluída"
echo ""

# Instalar dependências
echo "📥 Instalando dependências..."
npm ci --include=dev
echo "✅ Dependências instaladas"
echo ""

# Verificar se existe o diretório client
if [ -d "client" ]; then
    echo "🎨 Build do frontend com Vite..."
    
    # Tentar build normal
    if npx vite build --config vite.config.ts --mode production 2>&1; then
        echo "✅ Build do frontend concluído"
    else
        echo "⚠️  Build do frontend falhou, mas continuando com build do servidor..."
    fi
else
    echo "⚠️  Diretório client não encontrado, pulando build do frontend"
fi
echo ""

# Build do servidor
echo "🖥️  Build do servidor..."
if [ -f "server/index.ts" ]; then
    npx esbuild server/index.ts \
        --bundle \
        --platform=node \
        --format=cjs \
        --outfile=dist/index.cjs \
        --minify \
        --log-level=info
    echo "✅ Build do servidor concluído"
else
    echo "⚠️  Arquivo server/index.ts não encontrado"
fi
echo ""

# Tentar executar o script/build.ts se existir
if [ -f "script/build.ts" ]; then
    echo "🏗️  Executando script/build.ts..."
    if npx tsx script/build.ts 2>&1; then
        echo "✅ script/build.ts executado com sucesso"
    else
        echo "⚠️  script/build.ts falhou, mas o build do esbuild foi feito"
    fi
fi
echo ""

# Criar diretório dist/public se não existir
mkdir -p dist/public

# Verificar se o build do frontend gerou arquivos
if [ -d "dist/public" ] && [ "$(ls -A dist/public)" ]; then
    echo "✅ Arquivos do frontend encontrados em dist/public"
else
    echo "⚠️  Nenhum arquivo do frontend encontrado"
    echo "   Criando index.html básico..."
    cat > dist/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BriefFlow API</title>
</head>
<body>
    <h1>BriefFlow API is Running!</h1>
    <p>Frontend not built. API endpoints are available.</p>
    <p><a href="/api/health">Check API Health</a></p>
</body>
</html>
EOF
    echo "✅ index.html básico criado"
fi

echo ""
echo "📊 Resumo do build:"
echo "   - node_modules: $(du -sh node_modules 2>/dev/null | cut -f1)"
echo "   - dist: $(du -sh dist 2>/dev/null | cut -f1)"
echo "   - Arquivos em dist/public: $(find dist/public -type f 2>/dev/null | wc -l)"
echo ""

echo "✅ === BUILD CONCLUÍDO ==="
echo ""
echo "🚀 Próximo passo:"
echo "   docker stack deploy -c /opt/brieflow/PLAN/docker-compose.portainer-no-build.yml briefflow"
echo ""
