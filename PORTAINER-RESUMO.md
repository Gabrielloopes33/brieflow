# 🚀 Resumo da Configuração Portainer + Git

## 📁 Arquivos Criados

### 1. **docker-compose.portainer.yml**
Arquivo principal para deploy no Portainer. Otimizado e simplificado.

### 2. **.env.portainer**
Template de variáveis de ambiente específico para Portainer.

### 3. **PORTAINER-GIT-SETUP.md**
Tutorial completo passo a passo de como configurar no Portainer.

### 4. **setup-webhook.sh**
Script automatizado para configurar webhook GitHub → Portainer.

### 5. **portainer-config.json**
Configuração JSON do stack (para referência).

---

## ⚡ Configuração Rápida (3 Passos)

### Passo 1: Commit dos Arquivos

```bash
# Adicionar ao Git
git add docker-compose.portainer.yml .env.portainer PORTAINER-GIT-SETUP.md
git commit -m "Add Portainer deployment configuration"
git push origin main
```

### Passo 2: Configurar no Portainer

1. Acesse: `https://seu-vps-ip:9443`
2. **Stacks** → **+ Add stack** → **Repository**
3. Preencha:
   - **Name:** `brielflow`
   - **Repository URL:** `https://github.com/seu-usuario/brielflow.git`
   - **Repository reference:** `refs/heads/main`
   - **Compose path:** `docker-compose.portainer.yml`
4. **Environment variables** → Adicione:
   - DB_NAME: brielflow
   - DB_USER: postgres
   - DB_PASSWORD: (senha forte)
   - JWT_SECRET: (string aleatória 32+ chars)
   - SESSION_SECRET: (string aleatória 32+ chars)
   - FRONTEND_URL: https://seudominio.com
5. ✅ **Enable the automatic update** (marcar)
6. **Deploy the stack**

### Passo 3: Configurar Webhook (Opcional mas Recomendado)

No Portainer:
1. **Stacks** → **brielflow**
2. Copie o **Webhook URL**

No GitHub:
1. Settings → Webhooks → Add webhook
2. Cole o URL
3. Content type: `application/json`
4. Just the push event
5. Add webhook

Ou use o script:

```bash
chmod +x setup-webhook.sh
./setup-webhook.sh https://seu-vps:9443 \
  https://seu-vps:9443/api/stacks/webhooks/ABC123 \
  ghp_seu_token_github
```

---

## 🔄 Fluxo de Trabalho

Depois de configurado, seu workflow será:

```
1. Editar código localmente
2. Testar: npm run dev
3. Commit: git commit -m "Nova feature"
4. Push: git push origin main
5. ✅ Deploy automático no Portainer!
6. Verificar: curl http://seu-vps/api/health
```

---

## 📊 URLs Após Deploy

| Serviço | URL |
|---------|-----|
| **Frontend** | http://seu-vps-ip |
| **API** | http://seu-vps-ip/api |
| **Health** | http://seu-vps-ip/api/health |
| **Portainer** | https://seu-vps-ip:9443 |

---

## 🛠️ Comandos Úteis

### Ver Logs
```bash
# Via Portainer
Stacks → brielflow → Container → Logs

# Via terminal
docker logs -f brielflow-app
docker logs -f brielflow-postgres
```

### Reiniciar Serviço
```bash
# Via Portainer
Containers → Selecione → Restart

# Via terminal
docker restart brielflow-app
```

### Atualizar Manualmente
```bash
# Via Portainer
Stacks → brielflow → Pull and redeploy
```

### Backup Banco
```bash
docker exec brielflow-postgres pg_dump -U postgres brielflow > backup.sql
```

---

## 🔧 Solução de Problemas

### Stack não inicia
1. Verifique os logs no Portainer
2. Confirme que todas as variáveis estão preenchidas
3. Verifique se as portas 80, 443, 5000 estão livres

### Build falha
1. Verifique o Dockerfile
2. Limpe o cache: Pull and redeploy (force)
3. Verifique permissões do repositório Git

### Deploy não atualiza
1. Verifique se o webhook está configurado
2. Confirme a branch (deve ser main)
3. Verifique os logs de webhook no GitHub

---

## 📝 Checklist Pré-Deploy

- [ ] Repositório Git configurado
- [ ] Arquivos `docker-compose.portainer.yml` e `.env.portainer` commitados
- [ ] Portainer CE instalado e rodando
- [ ] Portas 80, 443, 5000, 9443 disponíveis
- [ ] GitHub Personal Access Token (se repo privado)
- [ ] Variáveis de ambiente definidas (DB_PASSWORD, JWT_SECRET, etc.)

---

## 🎓 Dicas

### ✅ Faça:
- Use senhas fortes para DB_PASSWORD
- Configure webhook para deploy instantâneo
- Faça backup regular do banco
- Monitore os logs periodicamente

### ❌ Não Faça:
- Nunca commit o arquivo `.env`
- Não use senhas fracas em produção
- Não desative os health checks
- Não exponha o Portainer sem HTTPS

---

## 📚 Documentação Completa

Para mais detalhes, consulte:
- **PORTAINER-GIT-SETUP.md** - Tutorial completo
- **DEPLOYMENT.md** - Guia geral de deployment
- Documentação Portainer: https://docs.portainer.io

---

## 🆘 Suporte

Problemas comuns:

1. **"Repository not found"** → Verifique a URL do repositório
2. **"Build failed"** → Verifique o Dockerfile
3. **"Port already in use"** → Libere a porta ou mude no compose
4. **"Cannot connect to database"** → Verifique variáveis DB_*

---

## 🎉 Pronto!

Seu BriefFlow está configurado para deploy automático via Portainer!

Agora a cada push no main, sua aplicação será atualizada automaticamente. 🚀

**Próximos passos recomendados:**
1. Configure SSL/HTTPS (Let's Encrypt)
2. Configure domínio personalizado
3. Configure backups automáticos
4. Adicione monitoramento (Prometheus/Grafana)