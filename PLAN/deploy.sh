#!/bin/bash

# Script de Deploy para Supabase - BriefFlow

echo "🚀 Iniciando deploy do BriefFlow para Supabase..."

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: execute este script na raiz do projeto (onde está o package.json)"
    exit 1
fi

# 1. Instalar dependências
echo ""
echo "📦 Instalando dependências..."
npm install

# 2. Fazer build
echo ""
echo "🔨 Fazendo build do projeto..."
npm run build

# 3. Rodar migrations no Supabase
echo ""
echo "🗄️ Rodando migrations no Supabase..."
echo "   Migration 001: Initial Schema..."
docker exec -i supabase_db psql -U postgres -d postgres -f supabase/migrations/001_initial_schema.sql

echo "   Migration 002: RLS Policies..."
docker exec -i supabase_db psql -U postgres -d postgres -f supabase/migrations/002_rls_policies.sql

echo "✅ Migrations concluídas!"

# 4. Copiar .env.example para .env se não existir
if [ ! -f ".env" ]; then
    echo ""
    echo "📝 Criando .env a partir do exemplo..."
    cp PLAN/.env.supabase.example .env
    echo "⚠️  Por favor, edite o .env e configure as credenciais corretas"
    exit 1
fi

# 5. Verificar se Supabase está rodando
echo ""
echo "🔍 Verificando status do Supabase..."
if docker ps | grep -q "supabase"; then
    echo "✅ Supabase está rodando"
else
    echo "⚠️  Supabase não parece estar rodando. Iniciando..."
    cd /root/supabase
    docker-compose up -d
fi

# 6. Reiniciar o serviço do app
echo ""
echo "🔄 Reiniciando Content-Generator..."
# Assume que o container do app se chama briefflow-app
docker restart briefflow-app 2>/dev/null || echo "⚠️  Container não encontrado, pode estar rodando com outro nome"

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "📱 Acesse: http://185.216.203.73:5000"
echo "🔧 Supabase Studio: https://supa.agenciatouch.com.br"
echo ""
echo "📝 Próximos passos:"
echo "   1. Teste a aplicação"
echo "   2. Verifique o Supabase Studio para ver as tabelas"
echo "   3. Crie uma conta e teste a criação de clientes"
echo "   4. Verifique no banco que o user_id foi preenchido corretamente"
