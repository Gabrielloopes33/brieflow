#!/bin/bash

# Script de ajuda para configurar Supabase no docker-compose
# Uso: cd /opt/brieflow && ./configure-supabase.sh

echo "🔧 === CONFIGURAÇÃO DO SUPABASE ==="
echo ""

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute no diretório /opt/brieflow"
    exit 1
fi

echo "📝 Este script vai ajudá-lo a configurar as chaves do Supabase."
echo ""
echo "🔑 Você precisa das seguintes informações do Supabase:"
echo "   1. Project URL (https://seu-projeto.supabase.co)"
echo "   2. anon public key"
echo "   3. service_role key"
echo ""
echo "📍 Onde encontrar:"
echo "   - Acesse: https://supabase.com/dashboard"
echo "   - Selecione seu projeto"
echo "   - Vá em: Settings → API"
echo "   - Copie as chaves lá"
echo ""

read -p "🌐 Project URL: " supabase_url
read -p "🔑 anon public key: " supabase_anon_key
read -p "🔐 service_role key: " supabase_service_key

# Validar inputs
if [ -z "$supabase_url" ] || [ -z "$supabase_anon_key" ] || [ -z "$supabase_service_key" ]; then
    echo ""
    echo "❌ Erro: Todas as chaves são obrigatórias!"
    exit 1
fi

# Criar arquivo de configuração
cat > supabase.env << EOF
SUPABASE_URL=$supabase_url
SUPABASE_ANON_KEY=$supabase_anon_key
SUPABASE_SERVICE_KEY=$supabase_service_key
EOF

echo ""
echo "✅ Arquivo supabase.env criado!"
echo ""
echo "📋 Próximo passo:"
echo "   1. Abra o Portainer"
echo "   2. Vá em: Stacks → briefflow → Editor"
echo "   3. Vá para a aba: Environment variables"
echo "   4. Adicione estas variáveis:"
echo ""
echo "      Name: SUPABASE_URL"
echo "      Value: $supabase_url"
echo ""
echo "      Name: SUPABASE_ANON_KEY"
echo "      Value: $supabase_anon_key"
echo ""
echo "      Name: SUPABASE_SERVICE_KEY"
echo "      Value: $supabase_service_key"
echo ""
echo "   5. Clique em: Update the stack"
echo ""
echo "✨ Ou via comando:"
echo "   docker stack deploy -c /opt/brieflow/docker-compose.portainer-tsx-direct.yml --env-file /opt/brieflow/supabase.env briefflow"
echo ""
echo "📝 As chaves também foram salvas em: /opt/brieflow/supabase.env"
echo ""
echo "✅ === CONFIGURAÇÃO CONCLUÍDA ==="
echo ""
