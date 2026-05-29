#!/bin/bash

# ============================================
# VERIFY BACKUP SCRIPT
# Verifica integridade do backup restaurado
# ============================================

set -e  # Para em caso de erro
set -u  # Variáveis não definidas causam erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Função de log
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_detail() {
    echo -e "${CYAN}[DETAIL]${NC} $1"
}

# Verifica se está rodando como root ou com sudo
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "Este script precisa ser executado como root ou com sudo"
        log_info "Use: sudo $0"
        exit 1
    fi
    log_success "Verificado: Executando com privilégios de root"
}

# Verifica estrutura de volumes
check_volume_structure() {
    log_info "=========================================="
    log_info "VERIFICANDO ESTRUTURA DE VOLUMES"
    log_info "=========================================="
    echo ""

    COOLIFY_VOLUMES="/opt/coolify/volumes"

    if [ ! -d "$COOLIFY_VOLUMES" ]; then
        log_error "Diretório de volumes não encontrado: $COOLIFY_VOLUMES"
        log_info "Execute primeiro: sudo ./restore-volumes.sh"
        exit 1
    fi

    log_success "Diretório de volumes encontrado"

    echo ""
    log_info "Estrutura de diretórios:"
    ls -lh "$COOLIFY_VOLUMES" | grep -E "^d"
}

# Verifica backup do Supabase
check_supabase_backup() {
    log_info ""
    log_info "=========================================="
    log_info "VERIFICANDO SUPABASE"
    log_info "=========================================="
    echo ""

    local supabase_data="$COOLIFY_VOLUMES/supabase/db_data"

    if [ ! -d "$supabase_data" ]; then
        log_error "Dados do Supabase não encontrados"
        return
    fi

    log_success "Dados do Supabase encontrados"

    # Tamanho do banco
    local size=$(du -sh "$supabase_data" | cut -f1)
    log_info "Tamanho: $size"

    # Verifica estrutura do PostgreSQL
    if [ -d "$supabase_data/base" ]; then
        log_success "Estrutura do PostgreSQL válida"

        # Lista databases
        echo ""
        log_info "Databases encontradas:"
        ls -1 "$supabase_data/base" | grep -E "^[0-9]+$" | while read db; do
            local db_size=$(du -sh "$supabase_data/base/$db" | cut -f1)
            log_detail "  Database ID $db: $db_size"
        done
    else
        log_warning "Estrutura do PostgreSQL inválida"
    fi

    # Verifica arquivos de inicialização
    echo ""
    log_info "Arquivos de inicialização:"
    local init_files=(
        "realtime.sql"
        "webhooks.sql"
        "roles.sql"
        "jwt.sql"
        "logs.sql"
        "pooler.sql"
        "_supabase.sql"
    )

    for file in "${init_files[@]}"; do
        if [ -f "$COOLIFY_VOLUMES/supabase/$file" ]; then
            log_success "  ✓ $file"
        else
            log_warning "  ✗ $file (não encontrado)"
        fi
    done

    # Verifica configuração do Kong
    echo ""
    log_info "Configuração do Kong:"
    if [ -f "$COOLIFY_VOLUMES/supabase/api/kong.yml" ]; then
        log_success "  ✓ kong.yml encontrado"
        log_detail "  Linhas: $(wc -l < "$COOLIFY_VOLUMES/supabase/api/kong.yml")"
    else
        log_warning "  ✗ kong.yml não encontrado"
    fi
}

# Verifica backup do MinIO
check_minio_backup() {
    log_info ""
    log_info "=========================================="
    log_info "VERIFICANDO MINIO"
    log_info "=========================================="
    echo ""

    local minio_data="$COOLIFY_VOLUMES/minio/data"

    if [ ! -d "$minio_data" ]; then
        log_warning "Dados do MinIO não encontrados"
        return
    fi

    log_success "Dados do MinIO encontrados"

    # Tamanho
    local size=$(du -sh "$minio_data" | cut -f1)
    log_info "Tamanho: $size"

    # Verifica buckets
    echo ""
    log_info "Buckets encontrados:"
    ls -1 "$minio_data" | grep -v "^\." | while read bucket; do
        if [ -d "$minio_data/$bucket" ]; then
            local bucket_size=$(du -sh "$minio_data/$bucket" | cut -f1)
            local files_count=$(find "$minio_data/$bucket" -type f | wc -l)
            log_detail "  $bucket: $bucket_size ($files_count arquivos)"
        fi
    done
}

# Verifica backup do BriefFlow
check_briefflow_backup() {
    log_info ""
    log_info "=========================================="
    log_info "VERIFICANDO BRIEFTLOW")
    log_info "=========================================="
    echo ""

    local briefflow_db="$COOLIFY_VOLUMES/briefflow/data/briefflow.db"

    if [ ! -f "$briefflow_db" ]; then
        log_warning "Banco do BriefFlow não encontrado"
        return
    fi

    log_success "Banco do BriefFlow encontrado"

    # Tamanho
    local size=$(du -sh "$briefflow_db" | cut -f1)
    log_info "Tamanho: $size"

    # Permissões
    local perms=$(stat -c "%a" "$briefflow_db")
    local owner=$(stat -c "%U:%G" "$briefflow_db")
    log_detail "Permissões: $perms ($owner)"

    # Verifica se é um SQLite válido
    if command -v file &> /dev/null; then
        local file_type=$(file "$briefflow_db" | cut -d: -f2)
        log_detail "Tipo de arquivo:$file_type"
    fi

    # Tenta acessar o banco (se tiver sqlite3)
    if command -v sqlite3 &> /dev/null; then
        echo ""
        log_info "Tabelas do BriefFlow:"
        sqlite3 "$briefflow_db" ".tables" 2>/dev/null | while read table; do
            if [ ! -z "$table" ]; then
                local count=$(sqlite3 "$briefflow_db" "SELECT COUNT(*) FROM $table" 2>/dev/null)
                log_detail "  $table: $count registros"
            fi
        done
    else
        log_warning "sqlite3 não encontrado para verificar conteúdo"
    fi
}

# Verifica permissões
check_permissions() {
    log_info ""
    log_info "=========================================="
    log_info "VERIFICANDO PERMISSÕES"
    log_info "=========================================="
    echo ""

    # Supabase PostgreSQL
    if [ -d "$COOLIFY_VOLUMES/supabase/db_data" ]; then
        local owner=$(stat -c "%U:%G" "$COOLIFY_VOLUMES/supabase/db_data")
        local perms=$(stat -c "%a" "$COOLIFY_VOLUMES/supabase/db_data")

        if [ "$owner" = "999:999" ]; then
            log_success "Supabase PostgreSQL: permissões corretas ($perms, $owner)"
        else
            log_warning "Supabase PostgreSQL: permissões incorretas ($perms, $owner - esperado 999:999)"
        fi
    fi

    # MinIO
    if [ -d "$COOLIFY_VOLUMES/minio/data" ]; then
        local owner=$(stat -c "%U:%G" "$COOLIFY_VOLUMES/minio/data")
        local perms=$(stat -c "%a" "$COOLIFY_VOLUMES/minio/data")

        if [ "$owner" = "1000:1000" ]; then
            log_success "MinIO: permissões corretas ($perms, $owner)"
        else
            log_warning "MinIO: permissões incorretas ($perms, $owner - esperado 1000:1000)"
        fi
    fi

    # BriefFlow
    if [ -f "$COOLIFY_VOLUMES/briefflow/data/briefflow.db" ]; then
        local owner=$(stat -c "%U:%G" "$COOLIFY_VOLUMES/briefflow/data/briefflow.db")
        local perms=$(stat -c "%a" "$COOLIFY_VOLUMES/briefflow/data/briefflow.db")

        if [ "$owner" = "1000:1000" ]; then
            log_success "BriefFlow: permissões corretas ($perms, $owner)"
        else
            log_warning "BriefFlow: permissões incorretas ($perms, $owner - esperado 1000:1000)"
        fi
    fi
}

# Verifica configuração de rede
check_network() {
    log_info ""
    log_info "=========================================="
    log_info "VERIFICANDO CONFIGURAÇÃO DE REDE"
    log_info "=========================================="
    echo ""

    # Verifica se Docker está rodando
    if ! command -v docker &> /dev/null; then
        log_warning "Docker não encontrado"
        return
    fi

    log_success "Docker instalado"

    # Verifica rede Docker
    if docker network ls | grep -q "supabase-network"; then
        log_success "Rede supabase-network encontrada"
    else
        log_warning "Rede supabase-network não encontrada (será criada no docker-compose)"
    fi

    # Verifica portas disponíveis
    local ports=("8000" "3000" "9000" "9001" "8081" "5432" "6379")
    echo ""
    log_info "Verificando portas:"
    for port in "${ports[@]}"; do
        if command -v lsof &> /dev/null; then
            if lsof -i :"$port" &> /dev/null; then
                log_warning "  Porta $port: EM USO"
            else
                log_success "  Porta $port: disponível"
            fi
        fi
    done
}

# Mostra resumo final
show_final_summary() {
    log_info ""
    log_info "=========================================="
    log_info "RESUMO FINAL"
    log_info "=========================================="
    echo ""

    local errors=0
    local warnings=0

    # Conta erros e avisos
    COOLIFY_VOLUMES="/opt/coolify/volumes"

    if [ ! -d "$COOLIFY_VOLUMES/supabase/db_data" ]; then
        ((errors++))
        log_error "✗ Supabase PostgreSQL não restaurado"
    else
        log_success "✓ Supabase PostgreSQL restaurado"
    fi

    if [ ! -d "$COOLIFY_VOLUMES/minio/data" ]; then
        ((warnings++))
        log_warning "✗ MinIO não restaurado"
    else
        log_success "✓ MinIO restaurado"
    fi

    if [ ! -f "$COOLIFY_VOLUMES/briefflow/data/briefflow.db" ]; then
        ((errors++))
        log_error "✗ BriefFlow não restaurado"
    else
        log_success "✓ BriefFlow restaurado"
    fi

    echo ""
    log_info "Total de erros: $errors"
    log_info "Total de avisos: $warnings"

    echo ""
    if [ $errors -eq 0 ]; then
        log_success "=========================================="
        log_success "VERIFICAÇÃO CONCLUÍDA COM SUCESSO!"
        log_success "=========================================="
        echo ""
        log_info "Próximos passos:"
        log_info "  1. Configure o docker-compose no Coolify"
        log_info "  2. Configure as environment variables"
        log_info "  3. Faça o deploy"
        log_info "  4. Verifique os logs dos containers"
        log_info "  5. Acesse as interfaces web"
        echo ""
        log_info "Interfaces:"
        log_info "  - Supabase Studio: http://localhost:3000"
        log_info "  - MinIO Console: http://localhost:9001"
        log_info "  - BriefFlow: http://localhost:8081"
    else
        log_error "=========================================="
        log_error "VERIFICAÇÃO ENCONTROU ERROS!"
        log_error "=========================================="
        log_error "Por favor, corrija os erros antes de continuar"
        exit 1
    fi
}

# Main
main() {
    log_info "=========================================="
    log_info "VERIFY BACKUP SCRIPT"
    log_info "=========================================="
    echo ""

    check_root
    check_volume_structure
    check_supabase_backup
    check_minio_backup
    check_briefflow_backup
    check_permissions
    check_network
    show_final_summary

    echo ""
    log_success "Script concluído com sucesso!"
}

# Executa main
main "$@"
