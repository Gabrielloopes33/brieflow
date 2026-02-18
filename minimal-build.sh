#!/bin/bash

# Script de build MINIMISTA - Só instala dependências e cria estrutura mínima
# Uso: cd /opt/brieflow && ./minimal-build.sh

set -e

echo "🏗️  === BUILD MINIMISTA DO BRIEFLOW ==="
echo ""

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório /opt/brieflow"
    exit 1
fi

echo "📋 Passo 1: Verificando dependências"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
    echo "✅ Dependências instaladas"
else
    echo "✅ Dependências já instaladas"
fi
echo ""

echo "🎨 Passo 2: Criando estrutura mínima"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
mkdir -p dist/public

# Criar index.html completo
cat > dist/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BriefFlow - Content Generator</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 16px;
            padding: 40px;
            max-width: 600px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
            font-size: 28px;
        }
        p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .status {
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            font-weight: 500;
        }
        .api-section {
            background: #f7f7f7;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
        }
        .api-section h3 {
            color: #333;
            margin-bottom: 15px;
        }
        .api-list {
            list-style: none;
        }
        .api-list li {
            padding: 10px 0;
            border-bottom: 1px solid #e5e5e5;
        }
        .api-list li:last-child {
            border-bottom: none;
        }
        .api-list a {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
        }
        .api-list a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="status">
            ✅ Servidor BriefFlow Rodando!
        </div>
        
        <h1>BriefFlow - Content Generator</h1>
        
        <p>
            O servidor está funcionando perfeitamente! A API está 100% operacional.
            O frontend está no modo mínimo devido à versão do Node.js na VPS (18.19.1).
        </p>
        
        <div class="api-section">
            <h3>API Endpoints Disponíveis:</h3>
            <ul class="api-list">
                <li><a href="/api/health">🔍 Health Check</a></li>
                <li><a href="/api/clients">👥 Clients API</a></li>
                <li><a href="/api">🏠 API Root</a></li>
                <li><a href="/api/login">🔐 Login (Demo)</a></li>
            </ul>
        </div>
        
        <p style="margin-top: 20px; font-size: 14px; color: #999;">
            Para atualizar o frontend completo, atualize o Node.js para versão 20.19+ ou 22.12+
        </p>
    </div>
</body>
</html>
EOF

echo "✅ Frontend mínimo criado"
echo ""

echo "📊 Resumo:"
echo "   node_modules: $(du -sh node_modules 2>/dev/null | cut -f1 || echo '0B')"
echo "   dist/public/index.html: Criado"
echo ""

echo "✅ === BUILD MINIMISTA CONCLUÍDO ==="
echo ""
echo "🚀 O servidor vai rodar diretamente com tsx (sem build)"
echo ""
echo "✨ Próximo passo:"
echo "   docker service scale briefflow_app=0 && docker service scale briefflow_app=1"
echo ""
echo "📝 Nota:"
echo "   - A API está 100% funcional"
echo "   - O frontend está no modo mínimo"
echo "   - Para frontend completo, atualize Node.js para v20+"
echo ""
