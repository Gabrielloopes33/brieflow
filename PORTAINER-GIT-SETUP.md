# Tutorial: Deploy do BriefFlow no Portainer via Git

## Visão Geral

Este tutorial ensina como configurar o BriefFlow no Portainer usando integração com GitHub, permitindo atualizações automáticas sempre que você fizer push no repositório.

## 📁 Arquivos Necessários

Os seguintes arquivos devem estar no seu repositório Git:

```
/
├── docker-compose.portainer.yml    # Compose otimizado para Portainer
├── .env.portainer                  # Template de variáveis
├── Dockerfile                      # Build da aplicação
├── nginx/
│   └── nginx.conf                  # Configuração do Nginx
└── (seu código fonte)
```

## 🚀 Configuração Passo a Passo

### Passo 1: Preparar o Repositório

1. Certifique-se de que os arquivos estão no GitHub:
```bash
git add docker-compose.portainer.yml .env.portainer
git commit -m "Add Portainer configuration"
git push origin main
```

2. Verifique se o repositório é **público** ou você tem o token de acesso

### Passo 2: Acessar o Portainer

1. Acesse: `https://seu-vps-ip:9443`
2. Faça login com suas credenciais de administrador

### Passo 3: Criar Stack via Git Repository

1. No menu lateral, clique em **Stacks**
2. Clique em **+ Add stack**
3. Selecione a aba **Repository**

#### Preencher as informações:

**Name:** `brielflow`

**Repository URL:**
```
https://github.com/seu-usuario/brielflow.git
```

**Repository reference:**
```
refs/heads/main
```

**Compose path:**
```
docker-compose.portainer.yml
```

**Authentication (se repositório privado):**
- Marque "Authentication"
- Username: seu-usuario-github
- Personal Access Token: (veja abaixo como gerar)

### Passo 4: Gerar GitHub Personal Access Token

1. Vá em: https://github.com/settings/tokens
2. Clique **Generate new token (classic)**
3. Dê um nome: `Portainer Access`
4. Selecione scopes: `repo` (acesso completo ao repositório)
5. Clique **Generate token**
6. **Copie o token imediatamente** (não será mostrado novamente)

### Passo 5: Configurar Variáveis de Ambiente

Na seção **Environment variables**, clique em **+ Add environment variable** para cada uma:

| Nome | Valor | Descrição |
|------|-------|-----------|
| DB_NAME | brielflow | Nome do banco |
| DB_USER | postgres | Usuário do banco |
| DB_PASSWORD | (senha forte) | Senha do PostgreSQL |
| JWT_SECRET | (string aleatória) | Segredo JWT (32+ caracteres) |
| SESSION_SECRET | (string aleatória) | Segredo de sessão (32+ caracteres) |
| FRONTEND_URL | https://seudominio.com | URL pública |

**⚠️ IMPORTANTE:** Use senhas fortes e segredos aleatórios!

### Passo 6: Opções de Deploy

**Pull and redeploy:**
- ☑️ Enable the automatic update for the stack (RECOMENDADO)
- **Mechanism:** Webhook
- **Fetch interval:** 5m (verifica a cada 5 minutos)

**Webhook (opcional mas recomendado):**
- Clique em **Copy webhook** (vamos usar depois para deploy automático)

### Passo 7: Deploy

1. Clique em **Deploy the stack**
2. Aguarde o build (pode levar alguns minutos)
3. Verifique os logs clicando no container **brielflow-app**

## 🔧 Verificação

### Verificar se está rodando:

```bash
# Via Portainer
Stacks → brielflow → Containers (todos devem estar "Running")

# Via terminal
docker ps | grep brielflow

# Health check
curl http://seu-vps-ip/api/health
```

### Acessar aplicação:

- **Frontend:** http://seu-vps-ip
- **API:** http://seu-vps-ip/api
- **Health:** http://seu-vps-ip/api/health

## 🔄 Atualizações Automáticas

### Opção 1: Pull Automático (Recomendado)

Com a opção "Enable the automatic update" marcada, o Portainer verifica o repositório a cada 5 minutos e atualiza automaticamente se houver mudanças.

### Opção 2: Webhook (Deploy Instantâneo)

**Vantagem:** Deploy imediato a cada push

#### Configurar no GitHub:

1. No Portainer: Stacks → brielflow → **Copy webhook URL**
   
   Exemplo:
   ```
   https://seu-vps-ip:9443/api/stacks/webhooks/abc123-def456
   ```

2. No GitHub do seu projeto:
   - Settings → Webhooks → Add webhook
   - **Payload URL:** Cole o webhook do Portainer
   - **Content type:** application/json
   - **Which events?** Just the push event
   - Clique **Add webhook**

Agora a cada push no main, o deploy acontece automaticamente em segundos!

## 📊 Gestão do Stack

### Ver Logs:

1. **Stacks** → brielflow
2. Clique no container (ex: brielflow-app)
3. Aba **Logs**

### Restart de Serviço:

1. **Containers** → Selecione o container
2. Clique no botão **Restart**

### Acessar Console:

1. **Containers** → Selecione o container
3. Aba **Console** → **Connect**

### Atualizar Manualmente:

1. **Stacks** → brielflow
2. Clique em **Pull and redeploy**
3. Confirme se deseja forçar o recriação dos containers

## 🔄 Fluxo de Desenvolvimento

```
1. Você faz alterações no código local
2. Testa localmente (npm run dev)
3. Commit e push para main
4. Portainer detecta automaticamente (ou webhook dispara)
5. Stack é atualizado automaticamente
6. Aplicação em produção atualizada!
```

## 🐛 Troubleshooting

### Stack falha ao iniciar

**Verificar:**
1. Logs no Portainer (Containers → brielflow-app → Logs)
2. Variáveis de ambiente preenchidas corretamente
3. Repositório Git está acessível
4. Dockerfile está correto

### "Repository not found"

- Verifique se a URL do repositório está correta
- Se privado, verifique o token de acesso
- Certifique-se de que o arquivo `docker-compose.portainer.yml` existe

### Build falha

1. Verifique o Dockerfile
2. Limpe o cache: **Stacks** → brielflow → **Editor** → **Pull and redeploy** (force)
3. Verifique se todas as dependências estão no package.json

### Banco de dados não conecta

1. Verifique variáveis DB_NAME, DB_USER, DB_PASSWORD
2. Verifique se o postgres está rodando: `docker ps | grep postgres`
3. Verifique logs do postgres no Portainer

### Porta 5000 já em uso

```bash
# Verificar o que está usando a porta
sudo lsof -i :5000

# Matar processo ou mudar porta no compose
```

## 🔒 Segurança

### Boas práticas:

1. **Nunca comite o arquivo `.env`** (já está no .gitignore)
2. **Use senhas fortes** para DB_PASSWORD
3. **Tokens aleatórios** para JWT_SECRET e SESSION_SECRET
4. **Webhook seguro:** Use HTTPS no Portainer
5. **Atualizações automáticas:** Cuidado com pushes que quebram o build

### Configurar HTTPS no Portainer:

```bash
# Se ainda não configurou SSL no Portainer
docker stop portainer
docker rm portainer

docker run -d \
  -p 9000:9000 \
  -p 9443:9443 \
  --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  -v /etc/letsencrypt:/certs:ro \
  cr.portainer.io/portainer/portainer-ce:latest \
  --sslcert /certs/live/seudominio.com/fullchain.pem \
  --sslkey /certs/live/seudominio.com/privkey.pem
```

## 📋 Checklist de Deploy

Antes de começar, verifique:

- [ ] Repositório Git configurado e acessível
- [ ] Arquivo `docker-compose.portainer.yml` no repositório
- [ ] Dockerfile funcional
- [ ] Arquivo `.env.portainer` como template
- [ ] Portainer CE instalado e rodando
- [ ] Portas 80, 443, 5000, 9443 disponíveis
- [ ] GitHub Personal Access Token (se repo privado)
- [ ] Variáveis de ambiente definidas

## 🎓 Dicas Avançadas

### Rollback Rápido:

Se uma atualização quebrar:

1. **Stacks** → brielflow
2. Aba **Git repository**
3. Mude **Repository reference** para commit anterior:
   ```
   refs/heads/main~1
   ```
4. Clique **Pull and redeploy**

### Múltiplos Ambientes:

Crie stacks separados:
- `brielflow-prod` (branch main)
- `brielflow-staging` (branch develop)

### Backup Automático:

Adicione ao stack:
```yaml
  backup:
    image: offen/docker-volume-backup:latest
    volumes:
      - postgres_data:/backup/data:ro
      - /var/backups/brielflow:/archive
    environment:
      BACKUP_CRON_EXPRESSION: "0 2 * * *"
      BACKUP_RETENTION_DAYS: "7"
```

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs no Portainer
2. Teste o build localmente: `docker-compose -f docker-compose.portainer.yml up`
3. Documentação Portainer: https://docs.portainer.io
4. Issues do projeto no GitHub

## 🎉 Próximos Passos

Depois do deploy:

1. Configure SSL/HTTPS (Let's Encrypt)
2. Configure domínio personalizado
3. Configure backups automáticos
4. Configure monitoramento
5. Documente as credenciais em local seguro

**Parabéns!** Seu BriefFlow está rodando no Portainer com deploy automático! 🚀