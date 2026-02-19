# Coolify Deployment Guide - Minimal Version

## 🚀 Deploy no Coolify - Versão Simplificada

Este documento contém instruções para fazer o deploy **SIMPLES** da aplicação BriefFlow usando o Coolify, sem monitoramento.

---

## 📋 **Serviços Incluídos (Versão Minimal)**

### ✅ **Serviços ESSÊNCIAIS:**
- **app** - API Express + Frontend React
- **nginx** - Proxy reverso e servidor web
- **postgres** - Banco de dados PostgreSQL
- **redis** - Cache de sessões e dados

### ❌ **Serviços REMOVIDOS (Não essenciais para funcionamento):**
- ~~monitoring-init~~ - Inicializador de configs de monitoramento
- ~~prometheus~~ - Coletor de métricas
- ~~grafana~~ - Dashboard de monitoramento

**Nota:** Monitoramento pode ser adicionado depois quando a aplicação estiver estável.

---

## 🎯 **Vantagens da Versão Minimal**

- ✅ **Deploy mais rápido** - Apenas 4 containers em vez de 6
- ✅ **Menos complexidade** - Menos pontos de falha
- ✅ **Menor consumo de recursos** - Menos CPU, memória e disco
- ✅ **Simples de debugar** - Menos logs para analisar
- ✅ **Foco na funcionalidade principal** - Aplicação funciona imediatamente
- ✅ **Sem problemas de bind mounts** - Elimina o erro do monitoring-init

---

## 📋 **Configuração no Coolify**

### 1️⃣ **Escolha do Docker Compose File**

Use o arquivo: `docker-compose.minimal.yaml`

### 2️⃣ **Campos de Configuração**

| Campo | Valor |
|-------|-------|
| **Repository URL** | `https://github.com/Gabrielloopes33/brieflow` |
| **Branch** | `main` |
| **Build Pack** | `Docker Compose` |
| **Base Directory** | `/` (ou deixe vazio) |
| **Docker Compose Location** | `/docker-compose.minimal.yaml` |

### 3️⃣ **Variáveis de Ambiente (Obrigatórias)**

Adicione as seguintes variáveis no Coolify:

```
DB_NAME=briefflow
DB_USER=postgres
DB_PASSWORD=SuaSenhaSeguraAqui123
JWT_SECRET=SeuJWTSecretoAleatorioXYZ
SESSION_SECRET=SeuSessionSecretoAleatorioABC
```

### 4️⃣ **Variáveis de Ambiente (Opcionais - se você tiver Supabase/Anthropic)**

```
FRONTEND_URL=https://seu-dominio.com
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_KEY=sua_chave_service_aqui
ANTHROPIC_API_KEY=sua_chave_anthropic_aqui
```

### 5️⃣ **Ports**

- **Public Port:** `80` (Nginx)
- **Container Port:** `80` (Nginx)

**Nota:** A aplicação expõe várias portas, mas no Coolify você só configura a port pública principal (80).

---

## 🚀 **Passo a Passo de Deploy**

### 1. **Configurar no Coolify**
1. Acesse seu painel do Coolify
2. Crie uma nova aplicação
3. Configure os campos conforme acima

### 2. **Adicionar Variáveis de Ambiente**
1. Vá em "Environment Variables"
2. Adicione todas as variáveis obrigatórias listadas acima
3. Adicione as opcionais se tiver

### 3. **Iniciar Deploy**
1. Clique em "Deploy" ou "Redeploy"
2. Aguarde o pull do código
3. Monitorize o progresso nos logs

---

## ✅ **Verificar Status do Deploy**

### 1. **Ver Containers Rodando**
No terminal da VPS:
```bash
docker ps
```

**Esperado:** 4 containers rodando (app, nginx, postgres, redis)

### 2. **Ver Logs de Cada Container**
```bash
docker logs briefflow-app
docker logs briefflow-nginx
docker logs briefflow-postgres
docker logs briefflow-redis
```

### 3. **Testar Aplicação**
```bash
# Testar health check do app
curl http://localhost/api/health

# Testar nginx
curl http://localhost
```

---

## 🐛 **Troubleshooting**

### Container Reiniciando em Loop

**Verificar logs:**
```bash
docker logs -f briefflow-app
```

**Causas comuns:**
1. **Variáveis de ambiente não configuradas**
   - Verifique se DB_PASSWORD, JWT_SECRET, SESSION_SECRET estão definidas

2. **Banco de dados não pronto**
   - Aguarde o container postgres ficar healthy (veja com `docker ps`)

3. **Erro no startup da aplicação**
   - Analise os logs do container `briefflow-app`

### Erro: "connection refused" no banco

**Verificar se postgres está healthy:**
```bash
docker ps | grep postgres
```

**Status deve mostrar:**
```
briefflow-postgres   Up X seconds (healthy)
```

**Se não estiver healthy:**
```bash
docker logs briefflow-postgres
```

### Nginx não acessível

**Verificar configuração:**
```bash
docker logs briefflow-nginx
```

**Verificar se arquivo de config existe:**
```bash
ls -la nginx/nginx.conf
```

---

## 📊 **Acessar Aplicação**

Após deploy bem-sucedido:

- **Aplicação Web:** `http://seu-dominio.com` ou `http://seu-ip:8082`
- **API Health Check:** `http://seu-dominio.com/api/health`
- **API Swagger:** `http://seu-dominio.com/api-docs`

---

## 🔄 **Futuros Updates**

### Adicionar Monitoramento Depois

Quando a aplicação estiver estável, você pode:

1. **Usar docker-compose-updated.yaml** (com monitoring)
   - Aplicará as correções de volumes Docker
   - Inclui Prometheus e Grafana

2. **Configurar profiles no docker-compose** (opcional)
   - Permite ativar/desativar monitoring sob demanda

3. **Implementar solução alternativa**
   - Use serviços de monitoramento externos (Datadog, New Relic, etc.)

---

## 📋 **Checklist de Deploy**

Antes de fazer o deploy, verifique:

- [ ] Repositório configurado: `Gabriellopes33/brieflow`
- [ ] Branch selecionado: `main`
- [ ] Docker Compose: `docker-compose.minimal.yaml`
- [ ] Base Directory: `/` (ou vazio)
- [ ] Variáveis obrigatórias configuradas:
  - [ ] DB_NAME
  - [ ] DB_USER
  - [ ] DB_PASSWORD
  - [ ] JWT_SECRET
  - [ ] SESSION_SECRET
- [ ] Variáveis opcionais configuradas (se aplicável):
  - [ ] FRONTEND_URL
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_KEY
  - [ ] ANTHROPIC_API_KEY

---

## 📞 **Suporte**

Se encontrar problemas:

1. **Verifique os logs:**
   ```bash
   docker logs briefflow-app
   docker logs briefflow-postgres
   docker logs briefflow-nginx
   ```

2. **Consulte logs do Coolify:**
   - No painel do Coolify, acesse os logs de deployment

3. **Verifique se os arquivos existem:**
   ```bash
   ls -la nginx/nginx.conf
   ls -la init-db.sql
   ```

4. **Consulte documentação adicional:**
   - `DEPLOYMENT.md` - Deploy manual e VPS
   - `COOLIFY-DEPLOY.md` (versão antiga) - Deploy com monitoring

---

## 📝 **Resumo da Versão Minimal**

**Arquivos:**
- ✅ `docker-compose.minimal.yaml` - Compose simplificado (4 serviços)

**Serviços:**
- ✅ app - API + Frontend
- ✅ nginx - Proxy reverso
- ✅ postgres - Banco de dados
- ✅ redis - Cache

**NÃO Inclui:**
- ❌ Monitoramento (Prometheus, Grafana, monitoring-init)

**Benefícios:**
- Deploy rápido e simples
- Menor consumo de recursos
- Foco na funcionalidade principal

**Próximos Passos (quando estiver estável):**
1. Adicionar monitoramento (Prometheus + Grafana)
2. Configurar alertas
3. Implementar dashboards personalizados

---

**Última atualização:** Fev 2026
**Versão:** Minimal (sem monitoramento)
**Compatível com:** Coolify, Docker Compose
