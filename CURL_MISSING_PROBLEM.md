# 🔧 PROBLEMA FINAL ENCONTRADO - Health Check Unhealthy

## 🎯 Raiz Causa

**A imagem `python:3.11-slim` NÃO inclui `curl` por padrão!**

### Evidência:

```bash
# De dentro do container
docker exec briefflow-scraper curl -s http://127.0.0.1:8000/
# Resultado:
# OCI runtime exec failed: exec failed: unable to start container process
# exec: "curl": executable file not found in $PATH
```

### Problema:

1. **Dockerfile original** (Python slim):
   ```dockerfile
   FROM python:3.11-slim
   
   RUN apt-get update && apt-get install -y \
       gcc \
       libpq-dev \
       && rm -rf /var/lib/apt/lists/*
   ```
   - ❌ NÃO instala `curl`

2. **Health check no docker-compose.yml**:
   ```yaml
   healthcheck:
     test: ["CMD-SHELL", "curl -f http://127.0.0.1:8000/ || exit 1"]
   ```
   - ✅ Tenta usar `curl`
   - ❌ Mas `curl` não existe no container

3. **Resultado**:
   - Health check falha → Container marca como `(unhealthy)`
   - API funciona (pode acessar de fora)
   - Mas Docker não consegue fazer health check interno

---

## ✅ Correção Aplicada

### Dockerfile corrigido:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    curl \                          # ← ADICIONADO!
    && rm -rf /var/lib/apt/lists/*
```

**O que mudou**:
- ✅ Adicionado `curl` à lista de pacotes
- ✅ Agora o Docker health check funciona
- ✅ Container deve mudar para `(healthy)`

---

## 🚀 Como Aplicar na VPS

### Passo 1: Conectar

```bash
ssh root@185.216.203.73
```

### Passo 2: Executar script final

```bash
cd /opt/brieflow
bash rebuild-scraper-final.sh
```

Este script:
- ✅ Git pull do código atualizado
- ✅ Para e remove scraper
- ✅ Rebuild (com cache, mais rápido)
- ✅ Inicia scraper
- ✅ Testa curl de dentro do container
- ✅ Testa HTTP de fora
- ✅ Verifica logs
- ✅ Mostra status final

---

## 📊 O que esperar após executar

### Durante rebuild:
```
🔨 Rebuilding scraper (with cache)...
Step 1/9 : FROM python:3.11-slim
...
Step 3/9 : RUN apt-get update && apt-get install -y gcc libpq-dev curl
...
Installing curl...
...
```

### Após startup:

```
📊 Container status:
NAME                STATUS             HEALTH          PORTS
briefflow-scraper   Up 1m (healthy)   0.0.0.0:8000->8000/tcp
```

### Esperado: `(healthy)` em vez de `(unhealthy)`

---

## ✅ Verificação

### 1. Verificar status do Docker
```bash
docker ps | grep briefflow-scraper
```

**Esperado**:
```
a0266d9ee40   brieflow-scraper   "entrypoint.sh"   1m ago   Up 1m (healthy)   8000->8000/tcp
```

### 2. Testar curl de dentro do container
```bash
docker exec briefflow-scraper curl -s http://127.0.0.1:8000/
```

**Esperado**:
```json
{
  "status": "healthy",
  "service": "BriefFlow Content Scraper API",
  "timestamp": "2026-02-18T...",
  "version": "1.0.0"
}
```

### 3. Testar de fora
```bash
curl -s http://localhost:8000/ | jq '.'
```

**Esperado**: JSON válido

---

## 📚 Problemas Anteriores (já corrigidos)

1. ❌ **`--reload`** em produção (entrypoint.sh)
   - Causava race condition
   - **Corrigido**: Removido `--reload`

2. ❌ **Endpoint `/health`** ao invés de `/`
   - `/health` pode não estar sempre disponível
   - **Corrigido**: Usar endpoint `/` (raiz)

3. ❌ **Sem `curl` instalado** (RAIZ DO PROBLEMA)
   - `python:3.11-slim` não inclui curl
   - **Corrigido**: Adicionado `curl` ao Dockerfile

---

## 🎯 Resumo de Todas as Correções

| Problema | Arquivo | Correção |
|----------|---------|-----------|
| `--reload` em produção | `entrypoint.sh` | Removido flag |
| Endpoint `/health` | `docker-compose.yml` | Mudou para `/` |
| CMD ao invés de CMD-SHELL | `docker-compose.yml` | Mudou para CMD-SHELL |
| Sem `curl` instalado | `Dockerfile` | Adicionado curl |
| `start_period` muito curto | `docker-compose.yml` | Aumentou para 60s |

---

## 📦 Commits Relacionados

1. **`b32a5ff`** - fix: remove --reload flag from scraper entrypoint.sh
2. **`a03a571`** - fix: improve scraper health check reliability
3. **`95778f1`** - fix: add curl to scraper Dockerfile ⭐ **ESTE É O FINAL**
4. **`914c0bb`** - add: final rebuild script for scraper with curl fix

---

## ✅ Sucesso = Container `(healthy)`

### Checklist de sucesso:

Execute `bash rebuild-scraper-final.sh` e verifique:

- [ ] Dockerfile foi atualizado (com curl)
- [ ] Rebuild concluído sem erros
- [ ] Container iniciou
- [ ] Curl está instalado no container
- [ ] Status é `Up Xm (healthy)` ← **IMPORTANTE**
- [ ] Health check de dentro funciona
- [ ] Health check de fora funciona
- [ ] Logs sem erros
- [ ] Portainer mostra healthy

---

## 🧪 Testes Completos

### Após rebuild bem-sucedido, teste:

#### 1. Health check interno
```bash
docker exec briefflow-scraper curl -s http://127.0.0.1:8000/ | jq '.status'
# Deve retornar: "healthy"
```

#### 2. Health check externo
```bash
curl -s http://localhost:8000/ | jq '.status'
# Deve retornar: "healthy"
```

#### 3. Novos endpoints do scraper
```bash
# Scrape
curl -s -X POST http://localhost:8000/scrape \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","formats":["markdown"]}' | jq '.'

# Search
curl -s -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query":"test","numResults":1}' | jq '.'

# Map
curl -s -X POST http://localhost:8000/map \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}' | jq '.'
```

#### 4. Proxy via app
```bash
docker exec briefflow-app curl -s http://scraper:8000/ | jq '.status'
```

---

## 🚨 Se ainda unhealthy após rebuild

### Possível causa: Cache antigo da imagem

**Solução**: Limpar completamente e rebuild
```bash
cd /opt/brieflow
docker compose down scraper
docker rmi briefflow-scraper
docker system prune -f
git pull github main
docker compose build --no-cache scraper
docker compose up -d scraper
```

---

## 📝 Conclusão

**Problema**: Container marcado como `(unhealthy)`
**Causa**: `curl` não estava instalado na imagem Python slim
**Solução**: Adicionar `curl` ao Dockerfile
**Resultado**: Container deve mudar para `(healthy)` automaticamente

---

**Execute `bash rebuild-scraper-final.sh` na VPS agora!** 🚀

O container deve mudar de `(unhealthy)` para `(healthy)` automaticamente em 1-2 minutos!
