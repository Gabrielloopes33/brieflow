#!/bin/bash

# Script de Emergência - Recuperação Completa da Infraestrutura
# Execute em caso de falha massiva na rede Docker

set -e  # Para execução se houver erro

echo "🚨 SCRIPT DE EMERGÊNCIA - RECUPERAÇÃO DE INFRAESTRUTURA"
echo "======================================================"
echo ""
echo "⚠️  AVISO: Isso vai causar downtime de 10-15 minutos"
echo "⚠️  Todos os serviços serão reiniciados"
echo ""
read -p "Tem certeza que deseja continuar? (digite 'SIM' para confirmar): " CONFIRM

if [ "$CONFIRM" != "SIM" ]; then
    echo "❌ Cancelado pelo usuário"
    exit 1
fi

echo ""
echo "🚀 Iniciando recuperação em 5 segundos..."
sleep 5

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# ============================================
# FASE 1: BACKUP E PREPARAÇÃO
# ============================================
echo ""
echo "📦 FASE 1: BACKUP E PREPARAÇÃO"
echo "==============================="

BACKUP_DIR="/root/emergency-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

print_status "Criando backup em $BACKUP_DIR..."
docker service ls > "$BACKUP_DIR/services-before.txt"
docker network inspect touchNet > "$BACKUP_DIR/network-before.json" 2>/dev/null || echo "Rede não acessível" > "$BACKUP_DIR/network-before.txt"
cp *.yaml "$BACKUP_DIR/" 2>/dev/null || true
print_success "Backup criado!"

# ============================================
# FASE 2: PARAR SERVIÇOS CRÍTICOS
# ============================================
echo ""
echo "🛑 FASE 2: PARANDO SERVIÇOS CRÍTICOS"
echo "======================================"

print_status "Parando serviços problemáticos..."

# Lista de serviços para parar (os que estão com erro)
SERVICES_TO_STOP="
portainer_portainer
portainer_agent
traefik_traefik
briefflow_app
briefflow_nginx
"

for service in $SERVICES_TO_STOP; do
    if docker service ls --format "{{.Name}}" | grep -q "^${service}$"; then
        print_status "Parando $service..."
        docker service rm "$service" 2>/dev/null || true
    fi
done

print_success "Serviços críticos parados!"
sleep 3

# ============================================
# FASE 3: RECRIAR REDE TOUCHNET
# ============================================
echo ""
echo "🌐 FASE 3: RECRIANDO REDE TOUCHNET"
echo "==================================="

print_status "Removendo rede touchNet antiga..."
docker network rm touchNet 2>/dev/null || print_warning "Rede já removida ou não existe"

print_status "Criando nova rede touchNet (com attachable=true)..."
docker network create \
    --driver overlay \
    --attachable \
    --opt encrypted \
    --subnet 10.0.1.0/24 \
    --gateway 10.0.1.1 \
    touchNet

print_success "Rede touchNet recriada com sucesso!"
sleep 5

# Verificar rede
print_status "Verificando status da nova rede..."
docker network inspect touchNet --format 'Name: {{.Name}}, Driver: {{.Driver}}, Attachable: {{.Attachable}}'

# ============================================
# FASE 4: SUBIR SERVIÇOS ESSENCIAIS
# ============================================
echo ""
echo "🔧 FASE 4: SUBINDO SERVIÇOS ESSENCIAIS"
echo "======================================="

cd /root

# 4.1 Traefik (Load Balancer / SSL)
echo ""
print_status "4.1 Subindo Traefik (Load Balancer)..."
docker stack deploy -c traefik.yaml traefik
print_success "Traefik iniciado!"
print_status "Aguardando 20 segundos para inicialização..."
sleep 20

# Verificar Traefik
if docker service ps traefik_traefik --format "{{.CurrentState}}" | grep -q "Running"; then
    print_success "✅ Traefik está rodando!"
else
    print_error "⚠️  Traefik pode ter problemas. Verifique: docker service ps traefik_traefik"
fi

# 4.2 Portainer (Gerenciamento)
echo ""
print_status "4.2 Subindo Portainer..."
docker stack deploy -c portainer.yaml portainer
print_success "Portainer iniciado!"
print_status "Aguardando 20 segundos para inicialização..."
sleep 20

# Verificar Portainer
if docker service ps portainer_portainer --format "{{.CurrentState}}" | grep -q "Running"; then
    print_success "✅ Portainer está rodando!"
    print_status "Acesse: https://port.agenciatouch.com.br (após DNS propagar)"
    print_status "Ou: http://185.216.203.73:9000"
else
    print_error "⚠️  Portainer pode ter problemas. Verifique: docker service ps portainer_portainer"
fi

# 4.3 BriefFlow (Seu Projeto)
echo ""
print_status "4.3 Subindo BriefFlow..."
cd /opt/brieflow

# Garantir que .env está configurado
if [ ! -f .env ]; then
    print_warning "Arquivo .env não encontrado em /opt/brieflow!"
    print_status "Copiando de .env.docker..."
    cp .env.docker .env
    print_warning "⚠️  IMPORTANTE: Verifique se OPENAI_API_KEY está configurada no .env!"
fi

# Subir BriefFlow
docker stack deploy -c docker-compose.prebuilt.yml briefflow
print_success "BriefFlow iniciado!"
print_status "Aguardando 30 segundos para inicialização..."
sleep 30

# Verificar BriefFlow
if docker service ps briefflow_app --format "{{.CurrentState}}" | grep -q "Running"; then
    print_success "✅ BriefFlow está rodando!"
    print_status "Acesse: http://185.216.203.73:5000"
else
    print_error "⚠️  BriefFlow pode ter problemas. Verifique: docker service ps briefflow_app"
fi

# ============================================
# FASE 5: VERIFICAÇÃO FINAL
# ============================================
echo ""
echo "✅ FASE 5: VERIFICAÇÃO FINAL"
echo "============================"

print_status "Verificando status dos serviços principais..."
echo ""

echo "Traefik:"
docker service ps traefik_traefik --format "{{.Name}}: {{.CurrentState}}" 2>/dev/null || echo "Não encontrado"

echo ""
echo "Portainer:"
docker service ps portainer_portainer --format "{{.Name}}: {{.CurrentState}}" 2>/dev/null || echo "Não encontrado"
docker service ps portainer_agent --format "{{.Name}}: {{.CurrentState}}" 2>/dev/null || echo "Agent não encontrado"

echo ""
echo "BriefFlow:"
docker service ps briefflow_app --format "{{.Name}}: {{.CurrentState}}" 2>/dev/null || echo "Não encontrado"

echo ""
echo "Rede touchNet:"
docker network inspect touchNet --format '{{range .Containers}}{{.Name}}: {{.IPv4Address}}{{println}}{{end}}' 2>/dev/null | head -10 || echo "Sem containers conectados ainda"

# ============================================
# PRÓXIMOS PASSOS
# ============================================
echo ""
echo "🎉 RECUPERAÇÃO CONCLUÍDA!"
echo "========================="
echo ""
echo "✅ Serviços essenciais restaurados:"
echo "   • Traefik (Load Balancer/SSL)"
echo "   • Portainer (Gerenciamento Docker)"
echo "   • BriefFlow (Seu projeto)"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. VERIFICAR PORTAINER"
echo "   Acesse: http://185.216.203.73:9000"
echo "   Configure usuário/senha se necessário"
echo ""
echo "2. VERIFICAR BRIEFFLOW"
echo "   Backend: http://185.216.203.73:5000/api/health"
echo "   Frontend: https://briefflow2.netlify.app"
echo ""
echo "3. SUBIR DEMAIS SERVIÇOS (se necessário)"
echo "   cd /root"
echo "   docker stack deploy -c supabase.yaml supabase"
echo "   docker stack deploy -c n8n.yaml n8n"
echo "   # ... etc"
echo ""
echo "4. MONITORAR LOGS"
echo "   docker service logs traefik_traefik --tail 50"
echo "   docker service logs portainer_portainer --tail 50"
echo "   docker service logs briefflow_app --tail 50"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   Se algum serviço não subir, verifique os logs:"
echo "   docker service ps NOME_DO_SERVICO"
echo "   docker service logs NOME_DO_SERVICO --tail 100"
echo ""
echo "💾 Backup salvo em: $BACKUP_DIR"
echo ""
print_success "Script concluído!"