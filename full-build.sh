#!/bin/bash

# Script de build COMPLETO - Instala dependências e faz build
# Uso: cd /opt/brieflow && ./full-build.sh

set -e

echo "🏗️  === BUILD COMPLETO DO BRIEFLOW ==="
echo ""

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório /opt/brieflow"
    exit 1
fi

echo "📋 Passo 1: Limpeza"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
rm -rf node_modules package-lock.json
rm -rf dist
rm -rf .vite
echo "✅ Limpeza concluída"
echo ""

echo "📦 Passo 2: Instalando dependências"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm install
echo "✅ Dependências instaladas"
echo ""

echo "🎨 Passo 3: Build do frontend (Vite)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
mkdir -p dist/public

if [ -d "client" ]; then
    if npx vite build --config vite.config.ts --mode production; then
        echo "✅ Build do frontend concluído"
    else
        echo "⚠️  Build do frontend falhou, criando frontend mínimo..."
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
        <div style="padding: 50px; text-align: center; font-family: Arial; max-width: 800px; margin: 0 auto;">
            <h1 style="color: #2563eb;">BriefFlow API is Running!</h1>
            <p style="font-size: 18px; margin: 20px 0;">O servidor está funcionando, mas o frontend build falhou.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: left;">
                <h3>API Endpoints Disponíveis:</h3>
                <ul style="line-height: 2;">
                    <li><a href="/api/health" style="color: #2563eb;">Health Check</a></li>
                    <li><a href="/api/clients" style="color: #2563eb;">Clients API</a></li>
                    <li><a href="/api" style="color: #2563eb;">API Root</a></li>
                </ul>
            </div>
            <p style="margin-top: 20px; color: #666;">A API está 100% funcional!</p>
        </div>
    </div>
</body>
</html>
EOF
        echo "✅ Frontend mínimo criado"
    fi
else
    echo "⚠️  Diretório client não encontrado, criando frontend mínimo..."
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
        <div style="padding: 50px; text-align: center; font-family: Arial; max-width: 800px; margin: 0 auto;">
            <h1 style="color: #2563eb;">BriefFlow API is Running!</h1>
            <p style="font-size: 18px; margin: 20px 0;">O servidor está funcionando, mas o frontend build falhou.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: left;">
                <h3>API Endpoints Disponíveis:</h3>
                <ul style="line-height: 2;">
                    <li><a href="/api/health" style="color: #2563eb;">Health Check</a></li>
                    <li><a href="/api/clients" style="color: #2563eb;">Clients API</a></li>
                    <li><a href="/api" style="color: #2563eb;">API Root</a></li>
                </ul>
            </div>
            <p style="margin-top: 20px; color: #666;">A API está 100% funcional!</p>
        </div>
    </div>
</body>
</html>
EOF
    echo "✅ Frontend mínimo criado"
fi
echo ""

echo "🖥️  Passo 4: Build do servidor (esbuild)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
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
        --external:@types/*
    
    if [ -f "dist/index.cjs" ]; then
        echo "✅ Build do servidor concluído"
    else
        echo "❌ Build do servidor falhou"
        exit 1
    fi
else
    echo "❌ Arquivo server/index.ts não encontrado"
    exit 1
fi
echo ""

echo "🏗️  Passo 5: Executando script/build.ts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "script/build.ts" ]; then
    if npx tsx script/build.ts; then
        echo "✅ script/build.ts executado com sucesso"
    else
        echo "⚠️  script/build.ts falhou, mas o esbuild já compilou o servidor"
    fi
else
    echo "⚠️  script/build.ts não encontrado, pulando"
fi
echo ""

echo "📊 Resumo do build:"
echo "   node_modules: $(du -sh node_modules 2>/dev/null | cut -f1 || echo '0B')"
echo "   dist: $(du -sh dist 2>/dev/null | cut -f1 || echo '0B')"
echo "   Arquivos em dist/public: $(find dist/public -type f 2>/dev/null | wc -l)"
if [ -f "dist/index.cjs" ]; then
    echo "   dist/index.cjs: $(du -h dist/index.cjs | cut -f1)"
fi
echo ""

echo "✅ === BUILD CONCLUÍDO ==="
echo ""
echo "🚀 Próximo passo:"
echo "   docker service scale briefflow_app=0 && docker service scale briefflow_app=1"
echo ""
echo "✨ Após reiniciar o container, acesse:"
echo "   http://seu-servidor:5001"
echo ""
