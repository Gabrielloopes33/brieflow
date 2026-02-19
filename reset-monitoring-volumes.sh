#!/bin/sh

# Script para resetar volumes de configuração do monitoring (Prometheus/Grafana)
# Use com cuidado - isso removerá as configurações atuais

set -e

echo "⚠️  AVISO: Isso vai remover os volumes de configuração do Prometheus e Grafana"
echo "Os dados de métricas serão preservados"
echo ""
read -p "Tem certeza? (y/N): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "❌ Operação cancelada"
    exit 0
fi

echo ""
echo "🧹 Limpando volumes de configuração..."

# Listar volumes
echo "Volumes atuais:"
docker volume ls | grep briefflow || echo "Nenhum volume encontrado"

# Remover volumes de config
echo ""
echo "Removendo volume prometheus_config..."
docker volume rm briefflow-prometheus_config 2>/dev/null || echo "Volume não existe"

echo "Removendo volume grafana_config..."
docker volume rm briefflow-grafana_config 2>/dev/null || echo "Volume não existe"

echo ""
echo "✅ Volumes removidos com sucesso"
echo ""
echo "📝 Próximos passos:"
echo "   1. Reinicie o docker-compose: docker-compose up -d"
echo "   2. O monitoring-init recriará as configurações automaticamente"
echo ""
