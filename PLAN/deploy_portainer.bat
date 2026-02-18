@echo off
REM Script de Deploy Rápido para Portainer (Windows)
REM Uso: deploy_portainer.bat

setlocal enabledelayedexpansion

set STACK_NAME=briefflow
set COMPOSE_FILE=PLAN\docker-compose.portainer.yml
set BACKUP_DIR=PLAN\backups

echo 🚀 Iniciando deploy da stack %STACK_NAME%...

REM Criar diretório de backup se não existir
if not exist "%BACKUP_DIR%" (
    mkdir "%BACKUP_DIR%"
)

REM Backup do deploy anterior
if exist "%COMPOSE_FILE%" (
    set BACKUP_FILE=%BACKUP_DIR%\docker-compose.portainer-%date:~-4,4%%date:~-7,2%%date:~-10,2%-%time:~-11,2%%time:~-8,2%%time:~-5,2%.yml
    copy "%COMPOSE_FILE%" "%BACKUP_FILE%" >nul
    echo ✅ Backup salvo em: !BACKUP_FILE!
)

REM Verificar se o arquivo existe
if not exist "%COMPOSE_FILE%" (
    echo ❌ Erro: Arquivo %COMPOSE_FILE% não encontrado!
    pause
    exit /b 1
)

REM Verificar se o Docker Swarm está ativo
docker info | findstr /C:"Swarm: active" >nul
if %errorlevel% neq 0 (
    echo ❌ Erro: Docker Swarm não está ativo!
    echo    Execute: docker swarm init
    pause
    exit /b 1
)

REM Verificar se a stack já existe
docker stack ls | findstr /C:"%STACK_NAME%" >nul
if %errorlevel% equ 0 (
    echo ⚠️  Stack %STACK_NAME% já existe. Atualizando...
    docker stack deploy -c "%COMPOSE_FILE%" %STACK_NAME%
) else (
    echo 📦 Criando nova stack %STACK_NAME%...
    docker stack deploy -c "%COMPOSE_FILE%" %STACK_NAME%
)

echo ✅ Deploy iniciado com sucesso!
echo.
echo 📊 Comandos úteis:
echo    Ver serviços:        docker service ls
echo    Ver logs do app:     docker service logs %STACK_NAME%_app -f
echo    Ver logs do nginx:   docker service logs %STACK_NAME%_nginx -f
echo    Ver logs do redis:   docker service logs %STACK_NAME%_redis -f
echo    Reiniciar stack:     docker service scale %STACK_NAME%_app=0 ^&^& docker service scale %STACK_NAME%_app=1
echo    Remover stack:       docker stack rm %STACK_NAME%
echo.
echo ⏳ Aguardando serviços ficarem prontos (pode levar 3-5 minutos)...
timeout /t 10 /nobreak >nul

REM Verificar status dos serviços
echo.
echo 📈 Status dos serviços:
docker service ls | findstr "%STACK_NAME%" || echo    Serviços ainda iniciando...

echo.
echo ✨ Deploy concluído! Acesse:
echo    App:   http://localhost:5001
echo    Nginx: http://localhost:8082
echo.
echo ⚠️  IMPORTANTE: Configure as variáveis de ambiente no Portainer!
echo    Vá em Stacks → briefflow → Editor → Environment variables

pause
