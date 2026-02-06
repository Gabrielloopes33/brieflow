#!/bin/bash

echo "🚀 Iniciando deploy local de BriefFlow..."

set -e

echo "📦 Verificando dependências..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Instale Docker primeiro."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não encontrado. Instale Docker Compose primeiro."
    exit 1
fi

echo "✅ Dependências encontradas"

echo "🔧 Verificando arquivo .env..."

if [ ! -f .env ]; then
    echo "⚠️  Arquivo .env não encontrado. Criando a partir de .env.example..."
    cp .env.example .env
    echo "⚠️  Por favor, edite o arquivo .env com suas configurações reais."
    echo "Pressione Enter para continuar ou Ctrl+C para cancelar..."
    read
fi

echo "✅ Arquivo .env configurado"

echo "🔨 Construindo containers..."

docker-compose down 2>/dev/null || true

docker-compose build

echo "✅ Build concluído"

echo "🚀 Iniciando containers..."

docker-compose up -d

echo "⏳ Aguardando containers iniciarem..."

sleep 10

echo "🔍 Verificando status dos containers..."

docker-compose ps

echo ""
echo "✅ Deploy local concluído com sucesso!"
echo ""
echo "📱 Aplicação disponível em:"
echo "   - Frontend: http://localhost"
echo "   - API: http://localhost/api"
echo "   - Health: http://localhost/api/health"
echo ""
echo "📊 Monitoramento:"
echo "   - Grafana: http://localhost:3001"
echo "   - Prometheus: http://localhost:9090"
echo ""
echo "🔧 Comandos úteis:"
echo "   - Ver logs: docker-compose logs -f"
echo "   - Parar: docker-compose down"
echo "   - Reiniciar: docker-compose restart"
echo "   - Ver status: docker-compose ps"
echo ""

read -p "Deseja ver os logs agora? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose logs -f
fi