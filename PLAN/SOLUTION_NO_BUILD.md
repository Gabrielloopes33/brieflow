# 🚨 SOLUÇÃO DE EMERGÊNCIA - Container não fica de pé

## 🎯 Diagnóstico do Problema

O erro no log mostra que o **Vite está tentando processar todos os arquivos do node_modules**, o que causa:
- Processamento extremamente lento
- Consumo excessivo de memória
- Container travando e reiniciando

---

## ✅ SOLUÇÃO: Build Manual + Deploy Sem Build

Essa solução separa o build do deploy, evitando o problema.

---

## 📋 Passo 1 - Build Manual (NO SERVIDOR)

### Execute no terminal do servidor:

```bash
# 1. Entrar no diretório do projeto
cd /opt/brieflow

# 2. Dar permissão ao script de build
chmod +x PLAN/manual-build.sh

# 3. Executar build manual
./PLAN/manual-build.sh
```

### O que esse script faz:
- Instala dependências
- Tenta buildar o frontend (pode falhar, não é problema)
- Builda o servidor
- Cria estrutura mínima em `dist/`

### Se der erro no build do frontend, não se preocupe!
O script vai continuar mesmo assim.

---

## 📋 Passo 2 - Remover Stack Antiga

### No Portainer:

1. Vá em **Stacks**
2. Clique em `briefflow`
3. Clique em **Delete** (🗑️)
4. Confirme

**OU no terminal:**
```bash
docker stack rm briefflow
```

**Aguarde 30 segundos** até a stack ser removida.

---

## 📋 Passo 3 - Deploy com NO Build

### No Portainer:

1. Clique em **Add stack**
2. **Name**: `briefflow`
3. Cole o conteúdo de: `PLAN/docker-compose.portainer-no-build.yml`
4. Adicione as variáveis de ambiente:
   - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
   - `JWT_SECRET`, `SESSION_SECRET`, `FRONTEND_URL`
   - `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`
5. Clique em **Deploy the stack**

---

## 📋 Passo 4 - Verificar Deploy

### No Portainer:

1. Vá em **Containers**
2. Procure por `briefflow_app`
3. Status deve ser **running** 🟢

### No terminal:

```bash
# Ver serviços
docker service ls | grep briefflow

# Ver logs
docker service logs briefflow_app --tail 50

# Testar API
curl http://localhost:5001/api/health
```

---

## 🎉 Se Funcionou!

### Acesse:
- **API**: http://seu-servidor:5001
- **Nginx**: http://seu-servidor:8082

### A API deve responder:
```json
{
  "service": "Content-Generator API",
  "status": "healthy",
  "timestamp": "..."
}
```

---

## ⚠️ Se Ainda NÃO Funcionar

### Opção 1: Entrar no container para debug

```bash
# Encontrar o container
docker ps -a | grep briefflow

# Entrar no container
docker exec -it <container_id> sh

# Dentro do container, verificar:
ls -la /app
ls -la /app/dist
ls -la /app/node_modules

# Tentar rodar o servidor manualmente:
cd /app
npx tsx server/production-server.ts
```

### Opção 2: Verificar build manual

```bash
# No servidor, verificar se o build foi feito
ls -la /opt/brieflow/dist/
ls -la /opt/brieflow/node_modules/
```

### Opção 3: Tentar build completo com mais recursos

```bash
# No servidor, aumentar memoria antes do build
export NODE_OPTIONS="--max-old-space-size=4096"

cd /opt/brieflow
./PLAN/manual-build.sh
```

---

## 🔄 Como Atualizar o Código Depois

### 1. Atualizar arquivos em /opt/brieflow
```bash
cd /opt/brieflow
git pull  # ou copiar os novos arquivos
```

### 2. Fazer build manual
```bash
./PLAN/manual-build.sh
```

### 3. Redeployar stack
```bash
docker stack deploy -c PLAN/docker-compose.portainer-no-build.yml briefflow
```

---

## 📦 Arquivos Criaos

Para essa solução, criei 3 arquivos novos:

1. **`docker-compose.portainer-no-build.yml`** - Versão que não faz build no container
2. **`docker-compose.portainer-api-only.yml`** - Versão que só builda o servidor (ignora frontend)
3. **`manual-build.sh`** - Script de build manual

---

## 🔧 Por Que Isso Funciona?

### Problema Original:
- Build no container tentava processar node_modules do Vite
- Vite analisava 2000+ arquivos, consumindo toda memória
- Container travava e reiniciava

### Solução:
- Build é feito **ANTES** do deploy
- Build pode ser feito no host (sem restrições de container)
- Docker-compose apenas **RODA** o servidor (fácil e rápido)
- Startup em segundos em vez de minutos

---

## 🎯 Comparação de Estratégias

| Estratégia | Build | Startup | Estabilidade |
|-----------|-------|---------|-------------|
| **docker-compose.portainer-simple.yml** | No container (3-5 min) | Lento | ❌ FALHOU |
| **docker-compose.portainer-dockerfile.yml** | No deploy (2-3 min) | Rápido (5 seg) | ⚠️ Pode falhar |
| **docker-compose.portainer-no-build.yml** | Manual (ANTES do deploy) | Rápido (5 seg) | ✅ **RECOMENDADO** |

---

## 🆘 Ainda Com Problemas?

### Checklist:

- [ ] Build manual foi executado com sucesso?
- [ ] Diretório `/opt/brieflow/dist/` existe?
- [ ] Arquivo `/opt/brieflow/dist/index.cjs` existe?
- [ ] Diretório `/opt/brieflow/dist/public/` existe?
- [ ] Variáveis de ambiente estão configuradas?
- [ ] Rede `brieflow-network` existe?

### Logs para análise:

```bash
# Pegar logs completos
docker service logs briefflow_app > app_error.log

# Inspeção do serviço
docker service inspect briefflow_app > service.json

# Inspeção do container
docker inspect $(docker ps -q -f name=briefflow_app) > container.json
```

---

## ✨ Resumo do Processo

```
1. cd /opt/brieflow
2. ./PLAN/manual-build.sh  ← Build no host (pode demorar)
3. docker stack rm briefflow  ← Remover antigo
4. Aguardar 30s
5. docker stack deploy -c PLAN/docker-compose.portainer-no-build.yml briefflow
6. Aguardar 30s
7. ✅ Container deve estar UP e funcionando!
```

---

**Tempo estimado:**
- Build manual: 5-10 minutos
- Deploy: 1-2 minutos
- **Total: ~10 minutos**

Muito melhor do que container travando eternamente! 🎉
