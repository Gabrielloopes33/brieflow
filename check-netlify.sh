#!/bin/bash

# ============================================
# SCRIPT DE VERIFICAÇÃO PRÉ-DEPLOY NETLIFY
# ============================================
# Execute antes de fazer o deploy para garantir
# que tudo está configurado corretamente
# ============================================

echo "🔍 Verificando configuração para deploy no Netlify..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de erros
ERRORS=0

# ============================================
# 1. Verificar se vite.config.ts existe
# ============================================
echo "1️⃣ Verificando vite.config.ts..."
if [ -f "vite.config.ts" ]; then
    echo -e "${GREEN}✅ vite.config.ts encontrado${NC}"
else
    echo -e "${RED}❌ vite.config.ts não encontrado${NC}"
    ((ERRORS++))
fi
echo ""

# ============================================
# 2. Verificar netlify.toml
# ============================================
echo "2️⃣ Verificando netlify.toml..."
if [ -f "netlify.toml" ]; then
    echo -e "${GREEN}✅ netlify.toml encontrado${NC}"
    
    # Verificar se substituiu a URL da VPS
    if grep -q "SUA-VPS-AQUI.com" netlify.toml; then
        echo -e "${YELLOW}⚠️  ATENÇÃO: Você ainda precisa substituir 'SUA-VPS-AQUI.com' pela URL real da sua VPS no netlify.toml${NC}"
        ((ERRORS++))
    else
        echo -e "${GREEN}✅ URL da VPS configurada${NC}"
    fi
    
    # Verificar comandos básicos
    if grep -q "npx vite build" netlify.toml; then
        echo -e "${GREEN}✅ Comando de build correto (npx vite build)${NC}"
    else
        echo -e "${RED}❌ Comando de build incorreto. Deve ser 'npx vite build'${NC}"
        ((ERRORS++))
    fi
else
    echo -e "${RED}❌ netlify.toml não encontrado${NC}"
    ((ERRORS++))
fi
echo ""

# ============================================
# 3. Verificar package.json
# ============================================
echo "3️⃣ Verificando package.json..."
if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ package.json encontrado${NC}"
    
    # Verificar se tem vite como devDependency
    if grep -q '"vite"' package.json; then
        echo -e "${GREEN}✅ Vite está nas dependências${NC}"
    else
        echo -e "${RED}❌ Vite não encontrado em package.json${NC}"
        ((ERRORS++))
    fi
else
    echo -e "${RED}❌ package.json não encontrado${NC}"
    ((ERRORS++))
fi
echo ""

# ============================================
# 4. Verificar estrutura do projeto
# ============================================
echo "4️⃣ Verificando estrutura do projeto..."
if [ -d "client" ]; then
    echo -e "${GREEN}✅ Pasta client/ encontrada${NC}"
    
    if [ -f "client/index.html" ]; then
        echo -e "${GREEN}✅ client/index.html encontrado${NC}"
    else
        echo -e "${RED}❌ client/index.html não encontrado${NC}"
        ((ERRORS++))
    fi
    
    if [ -f "client/src/main.tsx" ]; then
        echo -e "${GREEN}✅ client/src/main.tsx encontrado${NC}"
    else
        echo -e "${RED}❌ client/src/main.tsx não encontrado${NC}"
        ((ERRORS++))
    fi
else
    echo -e "${RED}❌ Pasta client/ não encontrada${NC}"
    ((ERRORS++))
fi
echo ""

# ============================================
# 5. Verificar arquivos de ambiente
# ============================================
echo "5️⃣ Verificando arquivos de ambiente..."
if [ -f ".env.netlify.example" ]; then
    echo -e "${GREEN}✅ .env.netlify.example encontrado${NC}"
    echo -e "${YELLOW}💡 Lembre-se de copiar as variáveis de .env.netlify.example para o painel do Netlify${NC}"
else
    echo -e "${YELLOW}⚠️  .env.netlify.example não encontrado${NC}"
fi
echo ""

# ============================================
# 6. Testar build localmente (opcional)
# ============================================
echo "6️⃣ Deseja testar o build localmente? (y/n)"
read -r TEST_BUILD
if [ "$TEST_BUILD" = "y" ]; then
    echo "🔨 Executando build..."
    if npm install && npx vite build; then
        echo -e "${GREEN}✅ Build executado com sucesso!${NC}"
        
        # Verificar se dist/public foi criado
        if [ -d "dist/public" ]; then
            echo -e "${GREEN}✅ Pasta dist/public criada${NC}"
        else
            echo -e "${RED}❌ Pasta dist/public não foi criada${NC}"
            ((ERRORS++))
        fi
    else
        echo -e "${RED}❌ Build falhou!${NC}"
        ((ERRORS++))
    fi
fi
echo ""

# ============================================
# RESUMO
# ============================================
echo "============================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 Tudo pronto para deploy no Netlify!${NC}"
    echo ""
    echo "Próximos passos:"
    echo "1. Faça commit e push das alterações"
    echo "2. No Netlify, importe seu repositório GitHub"
    echo "3. Configure as variáveis de ambiente no painel do Netlify"
    echo "4. Deploy! 🚀"
else
    echo -e "${RED}⚠️  Encontrados $ERRORS problema(s)${NC}"
    echo ""
    echo "Corrija os problemas acima antes de fazer o deploy."
    exit 1
fi
