#!/bin/bash
# Script de Deploy Completo do BriefFlow
# Script para atualização de código + rebuild completo da aplicação

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

function print_step() {
    echo -e "${YELLOW}▶${NC} $1"
}

# Parar containers
function stop_containers() {
    print_step "Parando containers..."
    cd "$WORK_DIR"
    docker-compose down
}

# Pull código atualizado
function pull_code() {
    print_step "Fazendo git pull do código..."
    cd "$WORK_DIR"
    git pull github main
    
    if [ $? -eq 0 ]; then
        print_success "Código atualizado"
    else
        print_error "Erro ao atualizar código"
        exit 1
    fi
}

# Limpar build antigo (IMPORTANTE)
function clean_build() {
    print_step "Limpando build antigo..."
    cd "$WORK_DIR"
    rm -rf dist
    print_success "Build limpo"
}

# Instalar dependências
function install_deps() {
    print_step "Instalando dependências..."
    cd "$WORK_DIR"
    cp /opt/brieflow/package*.json ./
    npm install --include=dev --silent
    
    if [ $? -eq 0 ]; then
        print_success "Dependências instaladas"
    else
        print_error "Erro ao instalar dependências"
        exit 1
    fi
}

# Build do projeto
function build_project() {
    print_step "Buildando projeto (production)..."
    cd "$WORK_DIR"
    npx tsx script/build.ts > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        print_success "Build concluído"
    else
        print_error "Erro ao buildar projeto"
        exit 1
    fi
}

# Iniciar containers
function start_containers() {
    print_step "Iniciando containers..."
    cd "$WORK_DIR"
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        print_success "Containers iniciados"
    else
        print_error "Erro ao iniciar containers"
        exit 1
    fi
}

# Verificar status após 5 segundos
function check_status() {
    echo ""
    print_step "Aguardando containers iniciarem..."
    sleep 5
    
    cd "$WORK_DIR"
    
    # Verificar se app está rodando
    if docker-compose ps | grep -q "brielflow-app.*Up"; then
        print_success "✨ Aplicação rodando!"
        echo ""
        echo "📱 Frontend: http://localhost:5000"
        echo "🔌 API: http://localhost:5000/api"
        echo ""
        echo "📝 Para ver logs: docker logs -f brielflow-app"
        echo "🔄 Para reiniciar: docker-compose restart"
    else
        print_error "Containers não iniciaram corretamente"
        echo ""
        echo "Verificando logs..."
        docker-compose logs --tail=50 brielflow-app
        exit 1
    fi
}

# Menu principal
case "${1:-all}" in
    all)
        print_info "=== DEPLOY COMPLETO DO BRIEFLLOW ==="
        stop_containers
        pull_code
        clean_build
        install_deps
        build_project
        start_containers
        check_status
        ;;
    code)
        print_info "=== ATUALIZAR CÓDIGO APENAS ==="
        stop_containers
        pull_code
        print_success "Código atualizado. Containers parados."
        echo ""
        echo "Para iniciar containers: docker-compose up -d"
        ;;
    restart)
        print_info "=== REINICIAR CONTAINERS ==="
        cd "$WORK_DIR"
        docker-compose restart
        if [ $? -eq 0 ]; then
            print_success "Containers reiniciados"
            check_status
        else
            print_error "Erro ao reiniciar containers"
        fi
        ;;
    logs)
        print_info "=== VER LOGS (Ctrl+C para sair) ==="
        cd "$WORK_DIR"
        docker logs -f brielflow-app
        ;;
    *)
        echo "Uso: $0 [all|code|restart|logs]"
        echo ""
        echo "  all    - Deploy completo (stop + pull + clean + install + build + start)"
        echo "  code   - Apenas atualizar código e parar containers"
        echo "  restart - Reiniciar containers existentes"
        echo "  logs   - Ver logs em tempo real"
        exit 1
        ;;
esac
