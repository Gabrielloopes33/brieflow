#!/bin/bash
# Script de Deploy do BriefFlow para VPS
# Uso: ./deploy.sh [update|restart|logs]

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

WORK_DIR="/opt/brieflow"

function print_info() {
    echo -e "${GREEN}ℹ${NC} $1"
}

function print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

function print_error() {
    echo -e "${RED}❌${NC} $1"
}

function print_warning() {
    echo -e "${YELLOW}⚠${NC}  $1"
}

# Função para atualizar código
function update_code() {
    print_info "Fazendo git pull..."
    cd "$WORK_DIR"
    git pull github main
    
    if [ $? -eq 0 ]; then
        print_success "Código atualizado com sucesso"
    else
        print_error "Erro ao atualizar código"
        exit 1
    fi
}

# Função para rebuild e restart
function redeploy_app() {
    print_info "Parando containers..."
    cd "$WORK_DIR"
    docker-compose down
    
    print_info "Rebuilding imagem Docker (sem cache)..."
    docker-compose build --no-cache app
    
    print_info "Subindo containers..."
    docker-compose up -d
    
    print_success "Aplicação redeployada!"
}

# Função para restart simples
function restart_app() {
    print_info "Reiniciando containers..."
    cd "$WORK_DIR"
    docker-compose restart
    print_success "Containers reiniciados!"
}

# Função para ver logs
function show_logs() {
    print_info "Mostrando logs do container brielflow-app (Ctrl+C para sair)..."
    cd "$WORK_DIR"
    docker logs -f brielflow-app
}

# Menu
case "${1:-update}" in
    update)
        print_info "=== ATUALIZAÇÃO DO BRIEFLLOW ==="
        update_code
        redeploy_app
        print_info "Logs em tempo real: docker logs -f brielflow-app"
        ;;
    restart)
        restart_app
        ;;
    logs)
        show_logs
        ;;
    *)
        echo "Uso: $0 [update|restart|logs]"
        echo ""
        echo "  update   - Atualiza código e redeploya aplicação"
        echo "  restart  - Reinicia containers sem atualizar código"
        echo "  logs     - Mostra logs da aplicação"
        exit 1
        ;;
esac
