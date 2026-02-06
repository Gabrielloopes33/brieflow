#!/bin/bash

# Script para iniciar o BriefFlow completo (Node.js + Python Scraper)
# Uso: ./start-briefflow.sh

set -e

echo "🚀 Iniciando BriefFlow..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se o .env existe
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado. Criando a partir de .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Por favor, edite o arquivo .env com suas configurações antes de continuar.${NC}"
    exit 1
fi

# Verificar se o scraper está configurado
if ! grep -q "SCRAPER_API_URL" .env; then
    echo -e "${YELLOW}⚠️  Adicionando configuração do scraper ao .env...${NC}"
    echo "" >> .env
    echo "# Scraper Python API Configuration" >> .env
    echo "SCRAPER_API_URL=http://localhost:8000" >> .env
fi

# Verificar dependências do Node.js
echo -e "${GREEN}📦 Verificando dependências do Node.js...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Instalando dependências do Node.js..."
    npm install
fi

# Verificar dependências do Python
echo -e "${GREEN}🐍 Verificando dependências do Python...${NC}"
cd scraper
if [ ! -d "venv" ]; then
    echo "Criando ambiente virtual Python..."
    python3 -m venv venv
fi

# Ativar ambiente virtual e instalar dependências
source venv/bin/activate
if [ ! -f "venv/installed" ]; then
    echo "Instalando dependências do Python..."
    pip install -r requirements.txt
    touch venv/installed
fi
cd ..

echo ""
echo -e "${GREEN}✅ Dependências verificadas!${NC}"
echo ""

# Função para limpar processos ao sair
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Encerrando serviços...${NC}"
    kill $SCRAPER_PID $NODE_PID 2>/dev/null || true
    wait $SCRAPER_PID $NODE_PID 2>/dev/null || true
    echo -e "${GREEN}✅ Serviços encerrados${NC}"
    exit 0
}

# Capturar sinais de término
trap cleanup SIGINT SIGTERM

# Iniciar o scraper Python em background
echo -e "${GREEN}🕷️  Iniciando Scraper Python na porta 8000...${NC}"
cd scraper
source venv/bin/activate
python src/api/server.py &
SCRAPER_PID=$!
cd ..

# Aguardar o scraper iniciar
echo "Aguardando scraper iniciar..."
sleep 3

# Verificar se o scraper está rodando
if ! kill -0 $SCRAPER_PID 2>/dev/null; then
    echo -e "${RED}❌ Falha ao iniciar o scraper Python${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Scraper Python iniciado (PID: $SCRAPER_PID)${NC}"
echo ""

# Iniciar o backend Node.js
echo -e "${GREEN}🖥️  Iniciando Backend Node.js na porta 5000...${NC}"
export SCRAPER_API_URL=http://localhost:8000
npm run dev &
NODE_PID=$!

# Aguardar o Node.js iniciar
echo "Aguardando backend iniciar..."
sleep 5

# Verificar se o Node.js está rodando
if ! kill -0 $NODE_PID 2>/dev/null; then
    echo -e "${RED}❌ Falha ao iniciar o backend Node.js${NC}"
    kill $SCRAPER_PID 2>/dev/null || true
    exit 1
fi

echo -e "${GREEN}✅ Backend Node.js iniciado (PID: $NODE_PID)${NC}"
echo ""

echo "═══════════════════════════════════════════════════"
echo -e "${GREEN}🎉 BriefFlow está rodando!${NC}"
echo "═══════════════════════════════════════════════════"
echo ""
echo "📱 Frontend:     http://localhost:5000"
echo "🔌 API Node.js:  http://localhost:5000/api"
echo "🕷️  Scraper API:  http://localhost:8000"
echo "📚 API Docs:     http://localhost:5000/api-docs"
echo ""
echo "Pressione Ctrl+C para encerrar todos os serviços"
echo ""

# Aguardar os processos
wait $SCRAPER_PID $NODE_PID
