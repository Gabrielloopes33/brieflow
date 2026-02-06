# Script para iniciar o BriefFlow completo (Node.js + Python Scraper)
# Uso: .\start-briefflow.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 Iniciando BriefFlow..." -ForegroundColor Green
Write-Host ""

# Verificar se o .env existe
if (-not (Test-Path .env)) {
    Write-Host "⚠️  Arquivo .env não encontrado. Criando a partir de .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "⚠️  Por favor, edite o arquivo .env com suas configurações antes de continuar." -ForegroundColor Yellow
    exit 1
}

# Verificar se o scraper está configurado
if (-not (Select-String -Path .env -Pattern "SCRAPER_API_URL" -Quiet)) {
    Write-Host "⚠️  Adicionando configuração do scraper ao .env..." -ForegroundColor Yellow
    Add-Content .env ""
    Add-Content .env "# Scraper Python API Configuration"
    Add-Content .env "SCRAPER_API_URL=http://localhost:8000"
}

# Verificar dependências do Node.js
Write-Host "📦 Verificando dependências do Node.js..." -ForegroundColor Green
if (-not (Test-Path node_modules)) {
    Write-Host "Instalando dependências do Node.js..."
    npm install
}

# Verificar dependências do Python
Write-Host "🐍 Verificando dependências do Python..." -ForegroundColor Green
Push-Location scraper
if (-not (Test-Path venv)) {
    Write-Host "Criando ambiente virtual Python..."
    python -m venv venv
}

# Ativar ambiente virtual e instalar dependências
& .\venv\Scripts\Activate.ps1
if (-not (Test-Path venv/installed)) {
    Write-Host "Instalando dependências do Python..."
    pip install -r requirements.txt
    New-Item -ItemType File -Path venv/installed -Force | Out-Null
}
Pop-Location

Write-Host ""
Write-Host "✅ Dependências verificadas!" -ForegroundColor Green
Write-Host ""

# Iniciar o scraper Python
Write-Host "🕷️  Iniciando Scraper Python na porta 8000..." -ForegroundColor Green
Push-Location scraper
& .\venv\Scripts\Activate.ps1
$scraperJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    & .\venv\Scripts\Activate.ps1
    python src/api/server.py
} -ArgumentList (Get-Location)
Pop-Location

# Aguardar o scraper iniciar
Write-Host "Aguardando scraper iniciar..."
Start-Sleep -Seconds 3

# Verificar se o scraper está rodando
if ($scraperJob.State -eq "Failed") {
    Write-Host "❌ Falha ao iniciar o scraper Python" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Scraper Python iniciado" -ForegroundColor Green
Write-Host ""

# Iniciar o backend Node.js
Write-Host "🖥️  Iniciando Backend Node.js na porta 5000..." -ForegroundColor Green
$env:SCRAPER_API_URL = "http://localhost:8000"
$nodeJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    npm run dev
} -ArgumentList (Get-Location)

# Aguardar o Node.js iniciar
Write-Host "Aguardando backend iniciar..."
Start-Sleep -Seconds 5

# Verificar se o Node.js está rodando
if ($nodeJob.State -eq "Failed") {
    Write-Host "❌ Falha ao iniciar o backend Node.js" -ForegroundColor Red
    Stop-Job $scraperJob
    exit 1
}

Write-Host "✅ Backend Node.js iniciado" -ForegroundColor Green
Write-Host ""

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🎉 BriefFlow está rodando!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Frontend:     http://localhost:5000"
Write-Host "🔌 API Node.js:  http://localhost:5000/api"
Write-Host "🕷️  Scraper API:  http://localhost:8000"
Write-Host "📚 API Docs:     http://localhost:5000/api-docs"
Write-Host ""
Write-Host "Pressione Ctrl+C para encerrar todos os serviços"
Write-Host ""

# Manter o script rodando
try {
    while ($true) {
        Start-Sleep -Seconds 1
        
        # Verificar se os jobs ainda estão rodando
        if ($scraperJob.State -ne "Running" -and $nodeJob.State -ne "Running") {
            break
        }
    }
} finally {
    Write-Host ""
    Write-Host "🛑 Encerrando serviços..." -ForegroundColor Yellow
    Stop-Job $scraperJob -ErrorAction SilentlyContinue
    Stop-Job $nodeJob -ErrorAction SilentlyContinue
    Remove-Job $scraperJob -ErrorAction SilentlyContinue
    Remove-Job $nodeJob -ErrorAction SilentlyContinue
    Write-Host "✅ Serviços encerrados" -ForegroundColor Green
}
