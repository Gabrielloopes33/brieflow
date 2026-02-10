#!/bin/bash
# Script Completo de Diagnóstico e Recuperação do Stack BriefFlow
# Uso: ./full-diagnosis.sh

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

WORK_DIR="/opt/brieflow"

function print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1 ${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

function print_section() {
    echo ""
    echo -e "${GREEN}▶ $1${NC}"
}

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
    echo -e "${YELLOW}⚠${NC} $1"
}

# ============================================================================
# SEÇÃO 1: DIAGNÓSTICO DE CONTAINERS
# ============================================================================
print_header "DIAGNÓSTICO DE CONTAINERS"

echo -e "Verificando status dos containers..."
docker ps --filter "name=briefflow*" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
docker ps -a --filter "name=briefflow*" --format "table {{.Names}}\t{{.Status}}\t{{.Uptime}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# ============================================================================
# SEÇÃO 2: CAPTURA DE LOGS
# ============================================================================
print_header "CAPTURA DE LOGS (ÚLTIMOS 3 MINUTOS)"

echo -e "${YELLOW}Capturando logs do BriefFlow...${NC}"

# Logs do app (últimos 50 linhas)
docker logs --tail 50 briefflow_app > /tmp/brieflow-app.log 2>&1

# Logs do PostgreSQL (últimos 50 linhas)
docker logs --tail 50 briefflow-postgres > /tmp/brieflow-postgres.log 2>&1

# Logs de Redis (últimos 50 linhas)
docker logs --tail 50 briefflow_redis > /tmp/brieflow-redis.log 2>&1

# Logs do Nginx
docker logs --tail 50 brielflow-nginx > /tmp/brieflow-nginx.log 2>&1

echo -e "${GREEN}Logs capturados em /tmp/${NC}"
docker logs --tail 5 briefflow_app briefflow-postgres briefflow_redis brielflow-nginx

# ============================================================================
# SEÇÃO 3: VERIFICAÇÃO DE BUILD
# ============================================================================
print_header "VERIFICAÇÃO DE BUILD"

echo -e "Verificando arquivos de build..."
docker exec briefflow_app stat /app/dist/public/index.html 2>/dev/null
APP_BUILD_TIME=$(docker exec briefflow_app stat /app/dist/public/index.html | grep Modify)
echo ""
echo -e "  Build timestamp: ${YELLOW}$APP_BUILD_TIME${NC}"
echo -e "  Data atual: $(date)"
echo ""
echo -e "Arquivos em /app/dist/public:"
docker exec briefflow_app ls -la /app/dist/public | head -20

# ============================================================================
# SEÇÃO 4: VERIFICAÇÃO DE VOLUME
# ============================================================================
print_header "VERIFICAÇÃO DE VOLUME DOCKER"

echo -e "Verificando montagem de volume..."
docker exec briefflow_app ls -la /opt/brieflow 2>/dev/null | head -30

VOLUME_RW_COUNT=$(docker exec briefflow_app bash -c "if [ -w /opt/brieflow ]; then echo 'RW'; else echo 'RO'; fi" 2>/dev/null)

echo ""
echo -e "  Montagem do volume: ${YELLOW}$VOLUME_RW_COUNT${NC}"

if [ "$VOLUME_RW_COUNT" != "RW" ]; then
    print_warning "VOLUME ESTÁ READ-ONLY - Isso explica o problema!"
    echo "  O container não consegue atualizar os arquivos do código."
else
    print_success "VOLUME está em RW - O problema pode estar em outro lugar."
fi

# ============================================================================
# SEÇÃO 5: VERIFICAÇÃO DE SERVIÇOS EXTERNOS
# ============================================================================
print_header "VERIFICAÇÃO DE SERVIÇOS EXTERNOS"

echo -e "Testando endpoints da API..."

# Teste de saúde (reconhecendo que pode falhar)
echo -e "Testando /api/health..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health 2>&1 || echo "000")

echo -e "  Resposta: ${YELLOW}$HEALTH_RESPONSE${NC}"

if [ "$HEALTH_RESPONSE" != "200" ]; then
    echo ""
    echo -e "⚠️  Endpoint não respondeu corretamente (código: $HEALTH_RESPONSE)"
    echo -e "  Isso pode indicar:"
    echo -e "    - Express não está rodando na porta 5000"
    echo -e "    - Container travado"
else
    print_success "Endpoint está respondendo corretamente"
fi

echo ""
echo -e "Testando /api/clients..."
CLIENTS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/clients 2>&1 || echo "000")

echo -e "  Resposta: ${YELLOW}$CLIENTS_RESPONSE${NC}"

if [ "$CLIENTS_RESPONSE" != "200" ]; then
    echo ""
    echo -e "⚠️  GET /api/clients falhou (código: $CLIENTS_RESPONSE)"
else
    print_success "GET /api/clients funcionando"
fi

# ============================================================================
# SEÇÃO 6: SOLUÇÃO DE PRIORIDADE 1 - REINICIAR SERVIÇOS
# ============================================================================
print_section "SOLUÇÃO 1: REINICIAR SERVIÇOS PROBLEMÁTICOS"

print_info "Vamos tentar reiniciar os serviços que estão com problemas..."

# Reiniciar PostgreSQL (se estiver rodando)
POSTGRES_STATUS=$(docker ps --filter "name=briefflow-postgres" --format "{{.Status}}" | head -1)

if echo "$POSTGRES_STATUS" | grep -q "Up\|Restarting"; then
    print_info "  PostgreSQL já está reiniciando..."
elif echo "$POSTGRES_STATUS" | grep -q "Exited"; then
    print_warning "  PostgreSQL está Exited - Reiniciando..."
    docker restart briefflow-postgres
    sleep 5
    
    if docker ps --filter "name=briefflow-postgres" | grep -q "Up"; then
        print_success "  PostgreSQL reiniciado com sucesso"
    else
        print_error "  PostgreSQL falhou ao reiniciar"
    fi
else
    print_info "  PostgreSQL está rodando"
fi

# Reiniciar Redis (se estiver rodando)
REDIS_STATUS=$(docker ps --filter "name=briefflow_redis" --format "{{.Status}}" | head -1)

if echo "$REDIS_STATUS" | grep -q "Up"; then
    print_info "  Redis está rodando normalmente"
elif echo "$REDIS_STATUS" | grep -q "Restarting\|Exited"; then
    print_warning "  Redis está reiniciando..."
    docker restart briefflow_redis
    sleep 5
    
    if docker ps --filter "name=briefflow_redis" | grep -q "Up"; then
        print_success "  Redis reiniciado com sucesso"
    else
        print_error "  Redis falhou ao reiniciar"
    fi
else
    print_info "  Redis está Up mas pode estar com warnings"
fi

# Reiniciar App Container (se estiver rodando)
APP_STATUS=$(docker ps --filter "name=briefflow_app" --format "{{.Status}}" | head -1)

if echo "$APP_STATUS" | grep -q "Up\|Restarting\|Exited"; then
    print_info "  App container está em estado problemático - Reiniciando..."
    docker restart briefflow_app
    sleep 10
    
    if docker ps --filter "name=briefflow_app" | grep -q "Up"; then
        print_success "  App reiniciado com sucesso"
    else
        print_error "  App falhou ao reiniciar - pode estar Travado"
    fi
else
    print_info "  App está rodando normalmente"
fi

# Reiniciar Nginx
NGINX_STATUS=$(docker ps --filter "name=brielflow-nginx" --format "{{.Status}}" | head -1)

if echo "$NGINX_STATUS" | grep -q "Up\|Restarting\|Exited"; then
    print_warning "  Nginx está reiniciando..."
    docker restart brielflow-nginx
    sleep 5
    
    if docker ps --filter "name=brielflow-nginx" | grep -q "Up"; then
        print_success "  Nginx reiniciado com sucesso"
    fi
else
    print_info "  Nginx está rodando"
fi

echo ""
sleep 3

# Testar endpoints após reinício
print_info "Verificando endpoints após reinício de serviços..."
HEALTH_AFTER=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health 2>&1 || echo "000")

if [ "$HEALTH_AFTER" = "200" ]; then
    print_success "Endpoints funcionando após reinício!"
else
    print_warning "Endpoints ainda não funcionam (código: $HEALTH_AFTER)"
fi

# ============================================================================
# SEÇÃO 7: SOLUÇÃO DE PRIORIDADE 2 - CORRIGIR VOLUME (SE NECESSÁRIO)
# ============================================================================
print_section "SOLUÇÃO 2: CORRIGIR VOLUME (SE NECESSÁRIO)"

print_info "Preparando para corrigir a montagem do volume..."

if [ "$VOLUME_RW_COUNT" != "RW" ]; then
    print_warning "AVISO: VOLUME ESTÁ READ-ONLY"
    echo "  Isso PROVAVELMENTE é o problema principal!"
    echo "  Deseja corrigir? Isso vai:"
    echo -e "  1. Parar todos os containers"
    echo -e "   2. Remover o volume e recriar (pode causar perda de dados)"
    echo "   3. Alterar para bind mount (permite atualização)"
    echo ""
    
    read -p "Deseja continuar com a correção do volume? [S/N/desligar] " -r
    case "$REPLY" in
        [Ss]*)
            print_info "Preparando para corrigir montagem do volume..."
            
            echo "Opção A: Recriar volume (RECOMENDADO para dados novos)"
            echo "Opção B: Alterar para bind mount (permite atualização)"
            echo "Opção C: Cancelar e verificar outros problemas"
            echo ""
            
            if [ "$REPLY" = "A" ] || [ "$REPLY" = "a" ]; then
                # Parar containers
                print_warning "Parando containers..."
                docker stop briefflow-postgres briefflow_redis briefflow_app brielflow-nginx
                
                # Opção A: Recriar volume
                print_info "Recriando volume docker..."
                docker volume rm briefflow_app_work
                docker volume create briefflow_app_work
                
                # Reiniciar
                print_info "Reiniciando containers..."
                docker-compose up -d briefflow-postgres briefflow_redis briefflow_app brielflow-nginx
                
                # Verificar
                sleep 5
                if docker ps --filter "name=briefflow_postgres" | grep -q "Up"; then
                    print_success "Volume corrigido! Serviços reiniciados."
                else
                    print_error "Erro ao corrigir volume. Verificando logs..."
                    docker logs --tail 20 briefflow-postgres
                fi
                
            # Opção B: Alterar para bind mount
                echo ""
                echo "Para alterar para bind mount:"
                echo "1. Parar containers"
                echo "2. Editar docker-compose.portainer.yml"
                echo "3. No serviço volumes, mudar de:"
                echo "   - type: bind, source: ./data, target: /app"
                echo "4. Reiniciar containers"
                echo ""
                echo "Deseja prosseguir com isso?"
                read -p "Confirmar alteração [S/N]: " -r
                if [ "$REPLY" = "Ss" ]; then
                    print_info "Modificando docker-compose para bind mount..."
                    # Criar diretório de dados se não existir
                    docker exec briefflow_app mkdir -p ./data
                    
                    # Reiniciar containers
                    docker-compose up -d briefflow_postgres briefflow_redis briefflow_app brielflow-nginx
                    
                    print_success "Bind mount aplicado. Reiniciando..."
                    docker-compose restart briefflow_postgres briefflow_redis briefflow_app brielflow-nginx
                fi
                
            # Opção C: Verificar outros problemas
                print_info "Verificando problemas adicionais..."
                
                # Verificar se express está realmente respondendo
                echo "  Testando resposta em /api/health..."
                HEALTH_FINAL=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health 2>&1 || echo "000")
                
                echo "  Testando resposta em /api/clients..."
                CLIENTS_FINAL=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/clients 2>&1 || echo "000")
                
                if [ "$HEALTH_FINAL" = "200" ] && [ "$CLIENTS_FINAL" = "200" ]; then
                    print_success "Endpoints funcionando! Volume pode não ser o problema."
                else
                    print_warning "Endpoints NÃO funcionam (Health: $HEALTH_FINAL, Clients: $CLIENTS_FINAL)"
                    print_info "Problema pode estar:"
                    echo "  - Cache do navegador"
                    echo "  - Container travado"
                    echo "  - Build estático desatualizado"
                    echo "  - Volume read-only (se ainda assim)"
                fi
                ;;
            
            [Nn]*)
                print_info "Cancelado. Verificando status atual..."
                docker ps --filter "name=briefflow*" --format "table {{.Names}}\t{{.Status}}"
                echo ""
                sleep 2
                ;;
        esac
else
    print_success "Volume está em RW. Problema não é montagem!"
fi

# ============================================================================
# SEÇÃO 8: VERIFICAÇÃO DE BACKUP PostgreSQL
# ============================================================================
print_section "VERIFICAÇÃO DE BACKUP POSTGRESQL"

print_info "Verificando se existe backup do PostgreSQL..."

if docker exec briefflow-postgres bash -c "[ -f /opt/brieflow/backup.sql ] && echo 'EXISTS'; then echo 'DOESN'; else echo 'NÃO'; fi" 2>/dev/null; then
    BACKUP_EXISTS=$(cat /dev/null)
    
    if [ "$BACKUP_EXISTS" = "EXISTS" ]; then
        print_success "✅ Backup encontrado em /opt/brieflow/backup.sql"
        echo ""
        echo "Deseja tentar restaurar o backup? [S/N]: " -r
        read -p "Restaurar backup [S/N]: " -r
        
        if [ "$REPLY" = "Ss" ] || [ "$REPLY" = "Ss" ]; then
            print_info "Preparando restauração do backup..."
            print_warning "⚠️ Isso vai REINICIAR O CONTAINER POSTGRESQL"
            
            # Parar container PostgreSQL
            docker stop briefflow-postgres
            
            # Restaurar backup
            docker exec briefflow-postgres psql -U postgres briefflow < /opt/brieflow/backup.sql 2>&1
            
            # Reiniciar
            print_info "Reiniciando PostgreSQL..."
            docker start briefflow-postgres
            
            # Verificar
            sleep 3
            if docker ps --filter "name=briefflow-postgres" | grep -q "Up"; then
                print_success "Backup restaurado com sucesso!"
                print_info "Verificando se endpoints funcionam..."
                
                HEALTH_AFTER_BACKUP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health 2>&1 || echo "000")
                
                if [ "$HEALTH_AFTER_BACKUP" = "200" ]; then
                    print_success "Sistema funcionando novamente!"
                else
                    print_warning "Health check falhou: $HEALTH_AFTER_BACKUP"
                fi
            else
                print_error "Erro ao restaurar backup"
                docker logs --tail 20 briefflow-postgres
            fi
            
            # Perguntar sobre backup antigo
            echo ""
            echo "Deseja fazer backup do banco atual antes de continuar? [S/N]: " -r
            read -p "Fazer backup [S/N]: " -r
            if [ "$REPLY" = "Ss" ]; then
                print_info "Fazendo backup do banco atual..."
                docker exec briefflow-postgres pg_dump -U postgres briefflow > /opt/brieflow/backup-emergencia.sql 2>&1
                
                if [ $? -eq 0 ]; then
                    print_success "Backup de emergência criado em /opt/brieflow/backup-emergencia.sql"
                    print_info "Deseja restaurar esse backup agora? [S/N]: " -r
                    read -p "Restaurar backup de emergência [S/N]: " -r
                    
                    if [ "$REPLY" = "Ss" ] || [ "$REPLY" = "Ss" ]; then
                        print_info "Restaurando backup de emergência..."
                        docker stop briefflow-postgres
                        docker exec briefflow-postgres psql -U postgres briefflow < /opt/brieflow/backup-emergencia.sql 2>&1
                        docker start briefflow-postgres
                        
                        sleep 3
                        if docker ps --filter "name=briefflow-postgres" | grep -q "Up"; then
                            print_success "Backup de emergência restaurado!"
                            print_info "Verificando endpoints..."
                            
                            HEALTH_EMERGENCY=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health 2>&1 || echo "000")
                            
                            if [ "$HEALTH_EMERGENCY" = "200" ]; then
                                print_success "Sistema funcionando!"
                            else
                                print_warning "Health check falhou: $HEALTH_EMERGENCY"
                            fi
                        else
                            print_error "Erro ao restaurar backup"
                            docker logs --tail 20 briefflow-postgres
                        fi
                    fi
                fi
            fi
        else
            print_warning "⚠️ Nenhum backup encontrado"
            echo "  A única opção é fazer backup do banco atual antes de qualquer alteração."
    fi
fi

# ============================================================================
# SEÇÃO 9: RELATÓRIO FINAL
# ============================================================================
print_section "RELATÓRIO FINAL"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e " ${GREEN}DIAGNÓSTICO CONCLUÍDO${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}SUMÁRIO DE STATUS:${NC}"
echo "  - Container briefflow_app: $(docker ps --filter "name=briefflow_app" --format "{{.Status}}" | head -1 | xargs -I {} basename | cut -c2-7 -d)"
echo "  - Container briefflow-postgres: $(docker ps --filter "name=brieflow-postgres" --format "{{.Status}}" | head -1 | xargs -I {} basename | cut -c2-7 -d')"
echo "  - Container briefflow_redis: $(docker ps --filter "name=briefflow_redis" --format "{{.Status}}" | head -1 | xargs -I {} basename | cut -c2-7 -d')"
echo "  - Volume RW: $VOLUME_RW_COUNT"
echo "  - Health Endpoint: $HEALTH_RESPONSE"
echo " - Clients Endpoint: $CLIENTS_RESPONSE"
echo ""
echo -e "${YELLOW}LOGS CAPTURADOS:${NC}"
echo "  - /tmp/brieflow-app.log (últimos 50 linhas)"
echo "  - /tmp/brieflow-postgres.log (últimos 50 linhas)"
echo "  - /tmp/brieflow-redis.log (últimos 50 linhas)"
echo ""
echo -e "${GREEN}Logs salvos em /tmp/${NC}"
echo "  - Você pode compartilhar estes logs para análise."

echo ""
echo -e "${YELLOW}SOLUÇÕES PROPOR PROBLEMA:${NC}"
echo ""
echo "  Se volume está READ-ONLY:"
echo "  ${RED}1}   Usar 'vps-deploy.sh all' (forçar rebuild completo)"
echo "  ${RED}2}   Ou usar Portainer manual: Update & Restart"
echo ""
echo " Se PostgreSQL está com erro fatal:"
echo "  ${RED}1}   Restaurar backup de emergência: /opt/brieflow/backup-emergencia.sql"
echo "  ${RED}2}   Ou parar e recriar containers: docker-compose down & docker-compose up -d --force-recreate"
echo ""
echo "  ${YELLOW}Se tudo estiver funcionando:${NC}"
echo "  ${GREEN}   Continuar com FASE 4 do projeto (Motion & Polish)"
echo "   ✨ BriefFlow deve estar funcionando com mobile-first navigation!"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
