#!/bin/bash

# ============================================
# RESTORE VOLUMES SCRIPT
# Restaura volumes do backup para Docker
# ============================================

set -e  # Para em caso de erro
set -u  # Variáveis não definidas causam erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Verifica se está rodando como root ou com sudo
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "Este script precisa ser executado como root ou com sudo"
        log_info "Use: sudo $0"
        exit 1
    fi
    log_success "Verificado: Executando com privilégios de root"
}

# Define diretórios
setup_directories() {
    BACKUP_DIR="/tmp/restore_backup_20260220"
    COOLIFY_VOLUMES="/opt/coolify/volumes"

    log_info "Diretório do backup: $BACKUP_DIR"
    log_info "Diretório de volumes do Coolify: $COOLIFY_VOLUMES"

    # Verifica se o backup existe
    if [ ! -d "$BACKUP_DIR" ]; then
        log_error "Diretório de backup não encontrado: $BACKUP_DIR"
        log_info "Por favor, copie o backup para: $BACKUP_DIR"
        exit 1
    fi
    log_success "Backup encontrado"
}

# Cria estrutura de volumes
create_volume_structure() {
    log_info "Criando estrutura de volumes..."

    mkdir -p "$COOLIFY_VOLUMES/supabase"
    mkdir -p "$COOLIFY_VOLUMES/minio"
    mkdir -p "$COOLIFY_VOLUMES/briefflow"

    log_success "Estrutura de volumes criada"
}

# Restaura volumes do Supabase
restore_supabase_volumes() {
    log_info "Restaurando volumes do Supabase..."

    local supabase_backup="$BACKUP_DIR/supabase/volumes"
    local supabase_target="$COOLIFY_VOLUMES/supabase"

    if [ ! -d "$supabase_backup" ]; then
        log_warning "Backup do Supabase não encontrado, pulando..."
        return
    fi

    # Copia volumes do Supabase
    log_info "Copiando dados do PostgreSQL..."
    if [ -d "$supabase_backup/db/data" ]; then
        cp -r "$supabase_backup/db/data" "$supabase_target/db_data"
        chown -R 999:999 "$supabase_target/db_data"
        chmod -R 750 "$supabase_target/db_data"
        log_success "Dados do PostgreSQL restaurados"
    fi

    # Copia arquivos de inicialização
    log_info "Copiando arquivos de inicialização..."
    cp "$supabase_backup/db/realtime.sql" "$supabase_target/realtime.sql" 2>/dev/null || true
    cp "$supabase_backup/db/webhooks.sql" "$supabase_target/webhooks.sql" 2>/dev/null || true
    cp "$supabase_backup/db/roles.sql" "$supabase_target/roles.sql" 2>/dev/null || true
    cp "$supabase_backup/db/jwt.sql" "$supabase_target/jwt.sql" 2>/dev/null || true
    cp "$supabase_backup/db/logs.sql" "$supabase_target/logs.sql" 2>/dev/null || true
    cp "$supabase_backup/db/pooler.sql" "$supabase_target/pooler.sql" 2>/dev/null || true
    cp "$supabase_backup/db/_supabase.sql" "$supabase_target/_supabase.sql" 2>/dev/null || true

    # Copia configuração do Kong
    if [ -d "$supabase_backup/api" ]; then
        cp -r "$supabase_backup/api" "$supabase_target/"
        log_success "Configuração do Kong restaurada"
    fi

    # Copia storage, functions, pooler, logs
    cp -r "$supabase_backup/storage" "$supabase_target/" 2>/dev/null || true
    cp -r "$supabase_backup/functions" "$supabase_target/" 2>/dev/null || true
    cp -r "$supabase_backup/pooler" "$supabase_target/" 2>/dev/null || true
    cp -r "$supabase_backup/logs" "$supabase_target/" 2>/dev/null || true

    log_success "Volumes do Supabase restaurados"
}

# Restaura volumes do MinIO
restore_minio_volumes() {
    log_info "Restaurando volumes do MinIO..."

    local minio_backup="$BACKUP_DIR/minio/minio_data"
    local minio_target="$COOLIFY_VOLUMES/minio/data"

    if [ ! -d "$minio_backup" ]; then
        log_warning "Backup do MinIO não encontrado, pulando..."
        return
    fi

    cp -r "$minio_backup" "$minio_target"
    chown -R 1000:1000 "$minio_target"
    chmod -R 755 "$minio_target"

    log_success "Volumes do MinIO restaurados"
}

# Restora dados do BriefFlow
restore_briefflow_volumes() {
    log_info "Restorando dados do BriefFlow..."

    local briefflow_backup="$BACKUP_DIR/briefflow/briefflow.db"
    local briefflow_target="$COOLIFY_VOLUMES/briefflow/data"

    if [ ! -f "$briefflow_backup" ]; then
        log_warning "Backup do BriefFlow não encontrado, pulando..."
        return
    fi

    mkdir -p "$briefflow_target"
    cp "$briefflow_backup" "$briefflow_target/briefflow.db"
    chown 1000:1000 "$briefflow_target/briefflow.db"
    chmod 644 "$briefflow_target/briefflow.db"

    log_success "Dados do BriefFlow restaurados"
}

# Ajusta permissões finais
set_final_permissions() {
    log_info "Ajustando permissões finais..."

    # Supabase PostgreSQL
    if [ -d "$COOLIFY_VOLUMES/supabase/db_data" ]; then
        chown -R 999:999 "$COOLIFY_VOLUMES/supabase/db_data"
        chmod -R 750 "$COOLIFY_VOLUMES/supabase/db_data"
    fi

    # MinIO
    if [ -d "$COOLIFY_VOLUMES/minio/data" ]; then
        chown -R 1000:1000 "$COOLIFY_VOLUMES/minio/data"
        chmod -R 755 "$COOLIFY_VOLUMES/minio/data"
    fi

    # BriefFlow
    if [ -d "$COOLIFY_VOLUMES/briefflow/data" ]; then
        chown -R 1000:1000 "$COOLIFY_VOLUMES/briefflow/data"
        chmod -R 755 "$COOLIFY_VOLUMES/briefflow/data"
    fi

    # Permissões gerais
    chown -R 1000:1000 "$COOLIFY_VOLUMES"
    chmod -R 755 "$COOLIFY_VOLUMES"

    log_success "Permissões ajustadas"
}

# Mostra resumo
show_summary() {
    log_info "=========================================="
    log_info "RESUMO DA RESTAURAÇÃO"
    log_info "=========================================="
    echo ""

    log_info "Estrutura de volumes:"
    ls -lh "$COOLIFY_VOLUMES" 2>/dev/null | grep -E "^d" || echo "  Nenhuma pasta encontrada"

    echo ""
    log_info "Supabase PostgreSQL:"
    du -sh "$COOLIFY_VOLUMES/supabase/db_data" 2>/dev/null || echo "  Não restaurado"

    echo ""
    log_info "MinIO:"
    du -sh "$COOLIFY_VOLUMES/minio/data" 2>/dev/null || echo "  Não restaurado"

    echo ""
    log_info "BriefFlow:"
    du -sh "$COOLIFY_VOLUMES/briefflow/data" 2>/dev/null || echo "  Não restaurado"

    echo ""
    log_success "Restauração concluída com sucesso!"
    log_info "Próximos passos:"
    log_info "  1. Execute: sudo ./verify-backup.sh"
    log_info "  2. Configure o docker-compose no Coolify"
    log_info "  3. Faça o deploy"
}

# Main
main() {
    log_info "=========================================="
    log_info "RESTORE VOLUMES SCRIPT"
    log_info "=========================================="
    echo ""

    check_root
    setup_directories
    create_volume_structure
    restore_supabase_volumes
    restore_minio_volumes
    restore_briefflow_volumes
    set_final_permissions
    show_summary

    echo ""
    log_success "Script concluído com sucesso!"
}

# Executa main
main "$@"
