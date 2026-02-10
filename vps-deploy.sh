#!/bin/bash
# Script de Deploy Completo do BriefFlow
# Script para atualização de código + rebuild completo da aplicação

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

WORK_DIR="/opt/brieflow"

function print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
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

# Configurar git remotes
function setup_git_remotes() {
    print_step "Configurando git remotes..."
    cd "$WORK_DIR"

    # Mostrar remotes atuais
    echo ""
    print_info "Remotes atuais:"
    git remote -v
    echo ""

    # Verificar e criar remote 'github' se não existir
    if git remote | grep -q "^github$"; then
        print_success "Remote 'github' já existe"
    else
        print_info "Criando remote 'github' para compatibilidade com workflow..."
        git remote add github git@github.com:Gabriellopes33/brieflow.git
        print_success "Remote 'github' criado"
    fi

    # Verificar remote 'origin'
    if git remote | grep -q "^origin$"; then
        print_success "Remote 'origin' existe"
    else
        print_info "Criando remote 'origin'..."
        git remote add origin git@github.com:Gabriellopes33/brieflow.git
        print_success "Remote 'origin' criado"
    fi

    echo ""
}

# Pull código atualizado com retry
function pull_code() {
    print_step "Atualizando código..."
    cd "$WORK_DIR"

    # Função de pull com retry
    attempt_pull() {
        local remote=$1
        local max_attempts=3
        local attempt=1

        print_info "Tentando git pull $remote main (atual $max_attempts)..."
        while [ $attempt -le $max_attempts ]; do
            if timeout 60 git pull "$remote" main 2>&1; then
                print_success "Código atualizado com sucesso via $remote"
                return 0
            else
                print_error "Tentativa $attempt falhou"
                if [ $attempt -lt $max_attempts ]; then
                    print_info "Aguardando 5 segundos antes de tentar novamente..."
                    sleep 5
                    attempt=$((attempt + 1))
                else
                    print_error "Todas as $max_attempts tentativas falharam via $remote"
                    return 1
                fi
            fi
        done
    }

    # Tentar primeiro com 'github', depois fallback para 'origin'
    if attempt_pull "github"; then
        return 0
    elif attempt_pull "origin"; then
        print_success "Código atualizado com sucesso via origin (fallback)"
        return 0
    else
        print_error "Falha ao atualizar código de todos os remotes"
        print_info "Possíveis causas:"
        print_info "  1. Chave SSH não está configurada: cat ~/.ssh/authorized_keys"
        print_info "  2. Problema de rede ou firewall"
        print_info "  3. Repositório não existe ou permissões alteradas"
        echo ""
        print_info "Tente manualmente:"
        print_info "  ssh $USER@$(hostname)"
        print_info "  cd $WORK_DIR"
        print_info "  git pull origin main"
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
    npx tsx script/build.ts

    if [ $? -eq 0 ]; then
        print_success "Build concluído"
    else
        print_error "Erro ao buildar projeto"
        print_info "Verificando logs de erro..."
        npx tsx script/build.ts 2>&1 | tail -20
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
        setup_git_remotes
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
        setup_git_remotes
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
    setup)
        print_info "=== CONFIGURAR GIT REMOTES APENAS ==="
        setup_git_remotes
        print_success "Remotes configurados!"
        ;;
    *)
        echo "Uso: $0 [all|code|restart|logs|setup]"
        echo ""
        echo "  all     - Deploy completo (setup + stop + pull + clean + install + build + start)"
        echo "  code    - Apenas atualizar código e parar containers"
        echo "  restart - Reiniciar containers existentes"
        echo "  logs    - Ver logs em tempo real"
        echo "  setup   - Configurar git remotes (github + origin)"
        exit 1
        ;;
esac
