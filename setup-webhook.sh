#!/bin/bash

# Script para configurar webhook do GitHub para deploy automático no Portainer
# Uso: ./setup-webhook.sh <portainer-url> <stack-webhook-url> <github-token>

set -e

echo "🚀 Configurador de Webhook GitHub → Portainer"
echo "=============================================="
echo ""

# Verificar argumentos
if [ $# -lt 3 ]; then
    echo "❌ Uso incorreto!"
    echo ""
    echo "Uso:"
    echo "  ./setup-webhook.sh <portainer-url> <stack-webhook-url> <github-token>"
    echo ""
    echo "Exemplo:"
    echo "  ./setup-webhook.sh https://seu-vps:9443 https://seu-vps:9443/api/stacks/webhooks/abc123 ghp_seutokenaqui"
    echo ""
    echo "Para obter o Stack Webhook URL:"
    echo "  1. Acesse o Portainer → Stacks → brielflow"
    echo "  2. Clique em 'Copy webhook'"
    echo ""
    exit 1
fi

PORTAINER_URL=$1
WEBHOOK_URL=$2
GITHUB_TOKEN=$3

# Configurações
REPO_OWNER="$(git remote get-url origin | sed 's/.*github.com[:/]//' | cut -d'/' -f1)"
REPO_NAME="$(git remote get-url origin | sed 's/.*github.com[:/]//' | cut -d'/' -f2 | sed 's/.git$//')"
WEBHOOK_CONFIG_URL="https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/hooks"

echo "📋 Configurações detectadas:"
echo "  Repositório: ${REPO_OWNER}/${REPO_NAME}"
echo "  Portainer: ${PORTAINER_URL}"
echo "  Webhook: ${WEBHOOK_URL}"
echo ""

# Verificar se é um repositório git
if [ ! -d .git ]; then
    echo "❌ Erro: Este não é um repositório Git!"
    echo "Execute este script na raiz do seu projeto."
    exit 1
fi

# Verificar curl
if ! command -v curl &> /dev/null; then
    echo "❌ curl não encontrado. Instale curl primeiro."
    exit 1
fi

echo "🔍 Verificando webhooks existentes..."

# Listar webhooks existentes
EXISTING_WEBHOOKS=$(curl -s -H "Authorization: token ${GITHUB_TOKEN}" \
    "${WEBHOOK_CONFIG_URL}" | grep -o '"url":"[^"]*portainer[^"]*"' | wc -l)

if [ "$EXISTING_WEBHOOKS" -gt 0 ]; then
    echo "⚠️  Atenção: Já existe um webhook configurado para este repositório!"
    read -p "Deseja remover o webhook antigo e criar um novo? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Cancelado pelo usuário."
        exit 0
    fi
    
    # Remover webhooks antigos do Portainer
    echo "🗑️  Removendo webhooks antigos..."
    curl -s -H "Authorization: token ${GITHUB_TOKEN}" "${WEBHOOK_CONFIG_URL}" | \
        grep -o '"id":[0-9]*' | grep -o '[0-9]*' | while read hook_id; do
        curl -s -X DELETE -H "Authorization: token ${GITHUB_TOKEN}" \
            "${WEBHOOK_CONFIG_URL}/${hook_id}"
        echo "  ✓ Removido webhook ID: ${hook_id}"
    done
fi

echo ""
echo "🔗 Criando novo webhook..."

# Criar webhook
RESPONSE=$(curl -s -X POST \
    -H "Authorization: token ${GITHUB_TOKEN}" \
    -H "Accept: application/vnd.github.v3+json" \
    -d "{
        \"name\": \"web\",
        \"active\": true,
        \"events\": [\"push\"],
        \"config\": {
            \"url\": \"${WEBHOOK_URL}\",
            \"content_type\": \"json\",
            \"insecure_ssl\": \"0\"
        }
    }" \
    "${WEBHOOK_CONFIG_URL}")

# Verificar resposta
if echo "$RESPONSE" | grep -q "\"id\":"; then
    WEBHOOK_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
    echo "✅ Webhook criado com sucesso!"
    echo "   ID: ${WEBHOOK_ID}"
    echo ""
    echo "📊 Testando webhook..."
    
    # Testar webhook
    TEST_RESPONSE=$(curl -s -X POST \
        -H "Authorization: token ${GITHUB_TOKEN}" \
        "${WEBHOOK_CONFIG_URL}/${WEBHOOK_ID}/pings")
    
    if [ $? -eq 0 ]; then
        echo "✅ Teste enviado com sucesso!"
        echo ""
        echo "🎉 Configuração completa!"
        echo ""
        echo "Agora, a cada push na branch main:"
        echo "  1. GitHub dispara o webhook"
        echo "  2. Portainer recebe o sinal"
        echo "  3. Stack é atualizado automaticamente"
        echo "  4. Deploy completo em segundos!"
        echo ""
        echo "💡 Dica: Faça um commit de teste:"
        echo "   git commit --allow-empty -m 'Test deploy' && git push"
    else
        echo "⚠️  Webhook criado, mas o teste falhou."
        echo "   Verifique manualmente no GitHub → Settings → Webhooks"
    fi
else
    echo "❌ Erro ao criar webhook!"
    echo ""
    echo "Resposta do GitHub:"
    echo "$RESPONSE" | grep -o '"message":"[^"]*"'
    echo ""
    echo "Verifique:"
    echo "  - Seu token tem permissão 'repo' ou 'admin:repo_hook'"
    echo "  - O repositório existe e você tem acesso"
    echo "  - A URL do webhook está correta"
    exit 1
fi

echo ""
echo "📋 Resumo da configuração:"
echo "  Repositório: https://github.com/${REPO_OWNER}/${REPO_NAME}"
echo "  Webhook URL: ${WEBHOOK_URL}"
echo "  Eventos: push"
echo ""
echo "Para remover o webhook manualmente:"
echo "  curl -X DELETE -H \"Authorization: token ${GITHUB_TOKEN}\" \\"
echo "    ${WEBHOOK_CONFIG_URL}/${WEBHOOK_ID}"
echo ""

# Salvar informações
CONFIG_FILE=".webhook-config"
echo "PORTAINER_URL=${PORTAINER_URL}" > $CONFIG_FILE
echo "WEBHOOK_URL=${WEBHOOK_URL}" >> $CONFIG_FILE
echo "REPO_OWNER=${REPO_OWNER}" >> $CONFIG_FILE
echo "REPO_NAME=${REPO_NAME}" >> $CONFIG_FILE
echo "WEBHOOK_ID=${WEBHOOK_ID}" >> $CONFIG_FILE
echo "" >> $CONFIG_FILE
echo "# Configuração salva em: $(date)" >> $CONFIG_FILE

echo "💾 Configuração salva em: ${CONFIG_FILE}"
echo "   (não commit este arquivo!)

# Adicionar ao .gitignore se não existir
if [ -f .gitignore ]; then
    if ! grep -q "^\.webhook-config$" .gitignore; then
        echo ".webhook-config" >> .gitignore
        echo "✅ Adicionado .webhook-config ao .gitignore"
    fi
else
    echo ".webhook-config" > .gitignore
    echo "✅ Criado .gitignore com .webhook-config"
fi