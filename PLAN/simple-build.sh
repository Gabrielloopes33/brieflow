#!/bin/bash

# Script de build SIMPLES para rodar no servidor
# Este script NÃO usa tsx direto, apenas npx
# Uso: cd /opt/brieflow && ./PLAN/simple-build.sh

set -e

echo "🏗️  === BUILD SIMPLES DO BRIEFLOW ==="
echo ""

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório /opt/brieflow"
    echo "   cd /opt/brieflow && ./PLAN/simple-build.sh"
    exit 1
fi

# Limpar instalação anterior
echo "🧹 Limpando instalação anterior..."
rm -rf node_modules package-lock.json
rm -rf dist
rm -rf .vite
echo "✅ Limpeza concluída"
echo ""

# Instalar dependências
echo "📥 Instalando dependências..."
npm ci --silent
echo "✅ Dependências instaladas"
echo ""

# Criar diretórios necessários
mkdir -p dist/public

# Build do frontend com Vite (se existir client/)
if [ -d "client" ]; then
    echo "🎨 Build do frontend com Vite..."
    if npx vite build --config vite.config.ts --mode production 2>&1 | tee /tmp/vite-build.log; then
        echo "✅ Build do frontend concluído"
        echo "   Arquivos criados:"
        ls -la dist/public/ | head -20
    else
        echo "⚠️  Build do frontend falhou (veja /tmp/vite-build.log)"
        echo "   Criando frontend mínimo..."
        cat > dist/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BriefFlow</title>
</head>
<body>
    <div id="root">
        <div style="padding: 50px; text-align: center; font-family: Arial;">
            <h1>BriefFlow API is Running!</h1>
            <p>Frontend build falhou, mas a API está funcionando.</p>
            <p><a href="/api/health">Check API Health</a></p>
            <p><a href="/api/clients">API Clients</a></p>
        </div>
    </div>
</body>
</html>
EOF
        echo "✅ Frontend mínimo criado"
    fi
else
    echo "⚠️  Diretório client não encontrado"
    echo "   Criando frontend mínimo..."
    cat > dist/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BriefFlow</title>
</head>
<body>
    <div id="root">
        <div style="padding: 50px; text-align: center; font-family: Arial;">
            <h1>BriefFlow API is Running!</h1>
            <p>API endpoints disponíveis:</p>
            <p><a href="/api/health">Health Check</a></p>
            <p><a href="/api/clients">Clients</a></p>
        </div>
    </div>
</body>
</html>
EOF
    echo "✅ Frontend mínimo criado"
fi
echo ""

# Build do servidor com esbuild
echo "🖥️  Build do servidor com esbuild..."
if [ -f "server/index.ts" ]; then
    npx esbuild server/index.ts \
        --bundle \
        --platform=node \
        --format=cjs \
        --outfile=dist/index.cjs \
        --minify \
        --log-level=info \
        --external:react \
        --external:react-dom \
        --external:@vitejs/plugin-react \
        --external:vite \
        --external:tailwindcss \
        --external:postcss \
        --external:autoprefixer \
        --external:@tailwindcss/* \
        --external:esbuild \
        --external:tsx \
        --external:@types/* \
        2>&1 | tee /tmp/esbuild.log
    
    if [ -f "dist/index.cjs" ]; then
        echo "✅ Build do servidor concluído"
        echo "   Arquivo criado: dist/index.cjs ($(du -h dist/index.cjs | cut -f1))"
    else
        echo "❌ Build do servidor falhou"
        echo "   Veja /tmp/esbuild.log para detalhes"
    fi
else
    echo "⚠️  Arquivo server/index.ts não encontrado"
    echo "   O servidor será executado diretamente com tsx"
fi
echo ""

# Resumo
echo "📊 Resumo do build:"
echo "   - node_modules: $(du -sh node_modules 2>/dev/null | cut -f1 || echo '0B')"
echo "   - dist: $(du -sh dist 2>/dev/null | cut -f1 || echo '0B')"
echo "   - Arquivos em dist/public: $(find dist/public -type f 2>/dev/null | wc -l)"
if [ -f "dist/index.cjs" ]; then
    echo "   - dist/index.cjs: $(du -h dist/index.cjs | cut -f1)"
fi
echo ""

echo "✅ === BUILD SIMPLES CONCLUÍDO ==="
echo ""
echo "🚀 Próximo passo:"
echo "   docker stack deploy -c /opt/brieflow/PLAN/docker-compose.portainer-no-build.yml briefflow"
echo ""
echo "📝 Logs:"
echo "   - Vite: /tmp/vite-build.log"
echo "   - esbuild: /tmp/esbuild.log"
echo ""
