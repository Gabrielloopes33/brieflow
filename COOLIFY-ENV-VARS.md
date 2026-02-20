# Coolify Environment Variables - Guia Completo

## 🎯 Visão Geral

Este documento explica todas as variáveis necessárias para configurar o BriefFlow no Coolify.

## 📋 Variáveis OBRIGATÓRIAS

### 1. DB_NAME
**Descrição:** Nome do banco de dados PostgreSQL
**Valor padrão:** `briefflow`
**Exemplo:** `DB_NAME=briefflow`

### 2. DB_USER
**Descrição:** Usuário do PostgreSQL
**Valor padrão:** `postgres`
**Exemplo:** `DB_USER=postgres`

### 3. DB_PASSWORD
**Descrição:** Senha do PostgreSQL
**Obrigatório:** Configure uma senha forte
**Exemplo:** `DB_PASSWORD=SuaSenhaSeguraAqui123`

### 4. JWT_SECRET
**Descrição:** Segredo para geração de tokens JWT
**Importante:** NÃO pode estar vazio
**Gerar valor:** Use um valor aleatório longo e seguro
**Exemplo:** `JWT_SECRET=briefflow_jwt_secret_2024_super_secure_random_abc123`

### 5. SESSION_SECRET
**Descrição:** Segredo para gerenciar sessões
**Importante:** NÃO pode estar vazio
**Gerar valor:** Use um valor aleatório longo e seguro
**Exemplo:** `SESSION_SECRET=briefflow_session_secret_2024_super_secure_random_xyz456`

## 📋 Variáveis SUPABASE (OBRIGATÓRIAS para Autenticação)

### 6. SUPABASE_URL
**Descrição:** URL do projeto Supabase
**Onde pegar:** Seu arquivo `.env` local
**Importante:** CRÍTICO - API usa autenticação Supabase
**Exemplo:** `SUPABASE_URL=https://supa.agenciatouch.com.br`

### 7. SUPABASE_ANON_KEY
**Descrição:** Chave anônima do Supabase para autenticação
**Onde pegar:** Seu arquivo `.env` local (linha 20-21)
**Importante:** CRÍTICO - Middleware de auth usa esta chave
**Exemplo:** `SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (token completo)

### 8. SUPABASE_SERVICE_KEY
**Descrição:** Chave de serviço do Supabase (operações admin)
**Onde pegar:** Seu arquivo `.env` local (linha 22-23)
**Importante:** OPCIONAL - Use apenas se fizer operações admin no Supabase
**Exemplo:** `SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (token completo)

## 📋 Variáveis OPCIONAIS

### 1. FRONTEND_URL
**Descrição:** URL do frontend da aplicação
**Uso padrão:** `http://localhost` (para testes locais)
**Em produção:** Use seu domínio
**Exemplo:** `FRONTEND_URL=https://brieflow.agenciatouch.com.br`

### 2. OPENAI_API_KEY
**Descrição:** Chave API da OpenAI (para GPT)
**Onde pegar:** Sua conta OpenAI (https://platform.openai.com/api-keys)
**Necessária se:** A aplicação usa GPT para geração de conteúdo
**Exemplo:** `OPENAI_API_KEY=sk-proj-sua-chave-openai-aqui`

### 3. SCRAPER_API_URL
**Descrição:** URL da API do scraper Python
**Uso:** Se tiver um serviço separado de scraping
**Exemplo:** `SCRAPER_API_URL=http://localhost:8000`

## 📋 Variáveis Coolify (Automáticas)

Estas variáveis geralmente são configuradas automaticamente pelo Coolify e não precisam de configuração manual:

- **NODE_ENV** - Geralmente `production` (auto-definido)
- **PORT** - Geralmente `5000` (auto-definido)
- **SERVICE_URL_APP** - URL gerada automaticamente pelo Coolify
- **SERVICE_FQDN_APP** - FQDN gerado automaticamente pelo Coolify
- **SERVICE_URL_NGINX** - URL gerada automaticamente pelo Coolify
- **SERVICE_FQDN_NGINX** - FQDN gerado automaticamente pelo Coolify

## 🔧 Como Configurar no Coolify

### Passo 1: Acesse Environment Variables
1. No painel do Coolify, acesse sua aplicação
2. Clique em "Configuration" ou "Environment Variables"

### Passo 2: Adicione Variáveis Obrigatórias
Para cada variável:
1. Clique em "Add Variable"
2. Digite o nome (ex: `DB_NAME`)
3. Digite o valor
4. **IMPORTANTE:** Marque "Available at Runtime"
5. Clique em "Save" ou "Add"

### Passo 3: Configure Todas as Obrigatórias
Certifique-se de configurar TODAS estas variáveis obrigatórias:

- ✅ **DB_NAME** - Nome do banco
- ✅ **DB_USER** - Usuário do banco
- ✅ **DB_PASSWORD** - Senha do banco
- ✅ **JWT_SECRET** - Segredo JWT (NÃO vazio!)
- ✅ **SESSION_SECRET** - Segredo de sessão (NÃO vazio!)
- ✅ **SUPABASE_URL** - URL do Supabase
- ✅ **SUPABASE_ANON_KEY** - Chave anônima do Supabase (NÃO vazio!)

### Passo 4: Adicione Variáveis Opcionais Se Necessário

- ✅ **FRONTEND_URL** - URL do frontend (opcional, pode ser localhost)
- ✅ **OPENAI_API_KEY** - Chave da OpenAI (se usar GPT)
- ✅ **SUPABASE_SERVICE_KEY** - Chave de serviço (se fizer operações admin)
- ✅ **SCRAPER_API_URL** - URL do scraper (se tiver)

### Passo 5: Fazer Redeploy
1. Clique em "Save Changes" (se houver botão geral)
2. Clique em "Redeploy" ou "Deploy"
3. Aguarde a conclusão do deploy
4. Verifique os logs para confirmar que tudo funcionou

## ⚠️ Importante: "Available at Runtime"

Todas as variáveis de ambiente DEVEM estar marcadas como **"Available at Runtime"** no Coolify.

Se não estiverem marcadas:
- ❌ As variáveis podem não estar disponíveis durante execução
- ❌ Podem "desaparecer" entre deployments
- ❌ A aplicação pode falhar

## 🐛 Troubleshooting

### Erro: "not a directory" no nginx

**Causa:** Coolify criou um diretório onde deveria ser um arquivo (nginx.conf)

**Solução:**
- Volumes bind mount foram removidos do nginx e app para evitar conflitos
- Nginx agora usa configuração padrão
- App usa volumes internos do Docker

### Variáveis Não Estão Sendo Salvas

**Soluções:**
1. Verifique se marcou "Available at Runtime" para cada variável
2. Verifique se clicou em "Save" ou "Add" após configurar cada variável
3. Verifique se há um botão "Save Changes" geral no final
4. Tente recarregar a página e verificar se as variáveis aparecem
5. Verifique o console do navegador (F12) por erros ao salvar

### Variáveis Desaparecem Após Redeploy

**Possíveis causas:**
1. Variáveis não estão marcadas como "Available at Runtime"
2. Bug temporário do Coolify
3. Limpeza de cache do Coolify

**Soluções:**
1. Recarregue a página
2. Configure as variáveis novamente
3. Marque explicitamente "Available at Runtime"
4. Salve e tente fazer redeploy novamente

### Erro: "SUPABASE_URL or SUPABASE_ANON_KEY not configured"

**Causa:** Variáveis Supabase não configuradas ou estão vazias

**Solução:**
1. Configure `SUPABASE_URL` (copie do seu `.env` local)
2. Configure `SUPABASE_ANON_KEY` (copie do seu `.env` local)
3. Verifique se não estão vazias
4. Faça redeploy

### Erro: "JWT_SECRET not configured"

**Causa:** `JWT_SECRET` não configurado ou está vazio

**Solução:**
1. Configure `JWT_SECRET` com um valor aleatório
2. Exemplo: `JWT_SECRET=briefflow_jwt_2024_secure_abc123`
3. Faça redeploy

### Erro: "SESSION_SECRET not configured"

**Causa:** `SESSION_SECRET` não configurado ou está vazio

**Solução:**
1. Configure `SESSION_SECRET` com um valor aleatório
2. Exemplo: `SESSION_SECRET=briefflow_session_2024_secure_xyz456`
3. Faça redeploy

## 📝 Exemplo de Configuração Completa

Aqui está um exemplo de todas as variáveis configuradas corretamente:

```bash
# --- OBRIGATÓRIAS ---
DB_NAME=briefflow
DB_USER=postgres
DB_PASSWORD=SuaSenhaAqui123
JWT_SECRET=briefflow_jwt_2024_secure_random_abc123xyz
SESSION_SECRET=briefflow_session_2024_secure_random_xyz456abc

# --- SUPABASE (OBRIGATÓRIAS) ---
SUPABASE_URL=https://supa.agenciatouch.com.br
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0._G0caHkMnfr_HyJR9knteSCT0H9q3tDO5pL3AUb2mic
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3MTUwNTA4MDAsCiAgImV4cCI6IDE4NzI4MTcyMDAKfQ.v61ZT_CkG8YGYa9H1MXV2M1ghvMpeYXYsiBp8DowiZY

# --- OPCIONAIS (use se aplicável) ---
FRONTEND_URL=https://brieflow.agenciatouch.com.br
OPENAI_API_KEY=sk-proj-sua-chave-openai-aqui
SCRAPER_API_URL=http://localhost:8000
```

## 📝 Como Pegar Valores do Seu .env Local

Para copiar os valores corretos do seu ambiente local:

```bash
# Ver todo o .env
cat Content-Generator/.env

# Filtrar apenas linhas específicas
cat Content-Generator/.env | grep "SUPABASE_URL="
cat Content-Generator/.env | grep "SUPABASE_ANON_KEY="
cat Content-Generator/.env | grep "SUPABASE_SERVICE_KEY="
```

## ✅ Checklist de Configuração

Antes de fazer deploy, verifique TODOS os itens:

### Variáveis Obrigatórias
- [ ] DB_NAME configurado
- [ ] DB_USER configurado
- [ ] DB_PASSWORD configurado
- [ ] JWT_SECRET configurado (NÃO vazio!)
- [ ] SESSION_SECRET configurado (NÃO vazio!)

### Variáveis Supabase
- [ ] SUPABASE_URL configurado (NÃO vazio!)
- [ ] SUPABASE_ANON_KEY configurado (NÃO vazio!)
- [ ] SUPABASE_SERVICE_KEY configurado (se necessário)

### Variáveis Opcionais
- [ ] FRONTEND_URL configurado (pode ser localhost por enquanto)
- [ ] OPENAI_API_KEY configurado (se usar GPT)
- [ ] SCRAPER_API_URL configurado (se tiver scraper)

### Configuração no Coolify
- [ ] Todas as variáveis marcadas como "Available at Runtime"
- [ ] Clicou em "Save" para cada variável
- [ ] Clicou em "Save Changes" geral (se houver)
- [ ] Fez redeploy após configurar

## 🚀 Fluxo Completo de Configuração

1. ✅ Acesse o painel do Coolify
2. ✅ Acesse "Environment Variables"
3. ✅ Configure DB_NAME, DB_USER, DB_PASSWORD
4. ✅ Configure JWT_SECRET (valor aleatório)
5. ✅ Configure SESSION_SECRET (valor aleatório)
6. ✅ Configure SUPABASE_URL (do seu .env local)
7. ✅ Configure SUPABASE_ANON_KEY (do seu .env local)
8. ✅ Configure SUPABASE_SERVICE_KEY (do seu .env local, se necessário)
9. ✅ Configure FRONTEND_URL (opcional)
10. ✅ Configure OPENAI_API_KEY (opcional)
11. ✅ Configure SCRAPER_API_URL (opcional)
12. ✅ Verifique se todas estão marcadas "Available at Runtime"
13. ✅ Clique em "Save Changes" (se houver)
14. ✅ Clique em "Redeploy"
15. ✅ Aguarde a conclusão
16. ✅ Verifique os logs
17. ✅ Teste a aplicação

## 📚 Arquivos de Referência

- **`.env.coolify`** - Arquivo de exemplo pronto para copiar
- **`.env.example`** - Exemplo geral do projeto
- **`COOLIFY-DEPLOY-MINIMAL.md`** - Guia de deploy minimal

## 💡 Dicas Adicionais

### Gerar JWT_SECRET e SESSION_SECRET
Use valores longos e únicos:

```bash
# Exemplo de formato seguro:
JWT_SECRET=briefflow_jwt_secret_2024_secure_random_abc123xyz
SESSION_SECRET=briefflow_session_2024_secure_random_xyz456abc
```

### Testar Configuração
Após o deploy:
```bash
# Ver se containers estão rodando
docker ps

# Ver logs da aplicação
docker logs briefflow-app

# Testar health check
curl http://localhost/api/health
```

### Acessar Aplicação
- **Frontend:** `http://seu-dominio.com:8081` ou `http://IP-VPS:8081`
- **API Health:** `http://seu-dominio.com:8081/api/health`
- **API Docs:** `http://seu-dominio.com:8081/api-docs` (Swagger UI)

**Nota:** Aplicação exposta diretamente (sem nginx) na porta 8081 devido a conflito nas portas 80 e 8080 padrão.

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs: `docker logs briefflow-app`
2. Consulte os logs do Coolify no painel
3. Verifique se todas as variáveis obrigatórias estão configuradas
4. Recarregue a página e tente novamente
5. Consulte a documentação adicional:
   - `DEPLOYMENT.md` - Deploy manual e VPS
   - `COOLIFY-DEPLOY-MINIMAL.md` - Deploy minimal

---

**Última atualização:** Fev 2026
**Versão:** Completa (com OpenAI API)
**Compatível com:** Coolify, Docker Compose
