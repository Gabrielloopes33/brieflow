#!/bin/bash
set -e

echo "🚀 Iniciando BriefFlow Scraper API..."
echo "📅 $(date)"
echo ""

# Verificar variáveis de ambiente
if [ -z "$DATABASE_PATH" ]; then
    echo "⚠️  DATABASE_PATH não definido, usando padrão: /app/data/briefflow.db"
    export DATABASE_PATH="/app/data/briefflow.db"
fi

if [ -z "$API_PORT" ]; then
    echo "⚠️  API_PORT não definido, usando padrão: 8000"
    export API_PORT="8000"
fi

if [ -z "$API_HOST" ]; then
    echo "⚠️  API_HOST não definido, usando padrão: 0.0.0.0"
    export API_HOST="0.0.0.0"
fi

echo "📊 Configurações:"
echo "   Database: $DATABASE_PATH"
echo "   API: $API_HOST:$API_PORT"
echo ""

# Verificar se banco de dados existe
if [ ! -f "$DATABASE_PATH" ]; then
    echo "⚠️  Banco de dados não encontrado em: $DATABASE_PATH"
    echo "   O scraper criará as tabelas automaticamente."
    echo ""
fi

# Iniciar a API FastAPI com uvicorn
echo "🌐 Iniciando servidor FastAPI..."
exec python -m uvicorn main:app --host $API_HOST --port $API_PORT --reload
