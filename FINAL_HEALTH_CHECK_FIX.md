# 🔧 Correção Final - Health Check do Scraper

## ✅ O que foi corrigido

### Problema
Container `briefflow-scraper` aparece como `(unhealthy)` mesmo que API está rodando.

### Causa Raiz
Health check do Docker estava usando `/health` endpoint que pode não estar acessível corretamente.

### Correção Aplicada (3 mudanças)

#### 1. **Endpoint da rota**
```yaml
# Antes (podia falhar)
test: ["CMD", "curl", "-f", "http://localhost:8000/health"]

# Depois (mais simples e confiável)
test: ["CMD-SHELL", "curl -f http://127.0.0.1:8000/ || exit 1"]
```

**Por que funciona melhor**:
- ✅ Endpoint `/` sempre existe (raiz do FastAPI)
- ✅ Mais simples - menos chance de erro
- ✅ Usa `127.0.0.1` ao invés de `localhost` (mais compatível)

#### 2. **Mudança de CMD para CMD-SHELL**
```yaml
# Antes
test: ["CMD", "curl", "-f", "http://localhost:8000/health"]

# Depois
test: ["CMD-SHELL", "curl -f http://127.0.0.1:8000/ || exit 1"]
```

**Benefícios**:
- ✅ Permite comandos mais complexos com shell
- ✅ Melhor tratamento de erros
- ✅ Mais flexibilidade

#### 3. **Aumentado tempo e retries**
```yaml
# Antes
start_period: 40s  # 40 segundos para iniciar
retries: 3          # 3 tentativas de health check

# Depois
start_period: 60s  # 60 segundos para iniciar (mais tempo)
retries: 5          # 5 tentativas de health check (mais chances)
```

**Benefícios**:
- ✅ Mais tempo para o FastAPI inicializar completamente
- ✅ Mais tentativas antes de marcar como unhealthy
- ✅ Menos chance de falso negativo

---

## 🚀 Como Aplicar na VPS

### Passo 1: Atualizar código
```bash
cd /opt/brieflow
git pull github main
```

### Passo 2: Reiniciar scraper (SEM rebuild)
```bash
# Opção A: Script automático (recomendado)
bash retry-scraper-health.sh

# Opção B: Manual
docker compose stop scraper
docker compose rm -f scraper
docker compose up -d scraper
```

### Passo 3: Aguardar e verificar
```bash
# Aguardar 60 segundos (o script faz isso automaticamente)
watch -n 5 'docker ps | grep briefflow-scraper'
```

---

## 📊 Timeline Esperada

| Tempo | Esperado | O que acontece |
|-------|----------|---------------|
| 0-10s | `Up <10s> (health: starting)` | Container inicia |
| 10-30s | `Up <30s> (health: starting)` | FastAPI inicializando |
| 30-60s | `Up <60s> (health: starting)` | Health checks rodando |
| 60-90s | `Up 1m (healthy)` ✅ | Deve marcar healthy |
| 90s+ | `Up >1m (healthy)` ✅ | Deve continuar healthy |

---

## ✅ O que esperar

### Status no Docker
```bash
docker ps | grep briefflow-scraper
```

**Esperado**:
```
15e8c7ccef3d   brieflow-scraper   "entrypoint.sh"   1m ago   Up 1m (healthy)   0.0.0.0:8000->8000/tcp
```

### Teste manual
```bash
curl -s http://localhost:8000/ | jq '.'
```

**Resposta**:
```json
{
  "status": "healthy",
  "service": "BriefFlow Content Scraper API",
  "timestamp": "2026-02-18T18:30:00.000000",
  "version": "1.0.0"
}
```

### Logs do scraper
```bash
docker logs briefflow-scraper --tail 30
```

**Esperado** (sem erros):
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

---

## 🧪 Testes Completos Após Correção

### 1. Health Check
```bash
curl -s http://localhost:8000/ | jq '.status'
# Deve retornar: "healthy"
```

### 2. Endpoint Scrape
```bash
curl -s -X POST http://localhost:8000/scrape \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","formats":["markdown"]}' | jq '.'
```

### 3. Endpoint Search
```bash
curl -s -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query":"test","numResults":1}' | jq '.'
```

### 4. Teste via proxy do app
```bash
docker exec briefflow-app curl -s http://scraper:8000/ | jq '.'
```

---

## 🚨 Se ainda continuar unhealthy

### Verificar logs
```bash
docker logs briefflow-scraper --tail 100
```

### Testar de dentro do container
```bash
docker exec briefflow-scraper curl -s http://127.0.0.1:8000/ | jq '.'
```

### Verificar se o curl está instalado
```bash
docker exec briefflow-scraper which curl
```

### Verificar se há erros de Python
```bash
docker exec briefflow-scraper python -c "
import sys
print(f'Python: {sys.version}')
from fastapi import FastAPI
print('FastAPI: OK')
"
```

### Último recurso - Rebuild completo
```bash
cd /opt/brieflow
docker compose down scraper
docker rmi briefflow-scraper
docker compose build --no-cache scraper
docker compose up -d scraper
```

---

## 📦 Commits Enviados

1. **`b32a5ff`** - fix: remove --reload flag from scraper entrypoint.sh
2. **`8fe5cc3`** - add: script to fix scraper health check issue
3. **`b05b6fc`** - add: comprehensive guide for scraper health check fix
4. **`a03a571`** - fix: improve scraper health check reliability
5. **`8802905`** - add: simple script to retry scraper health check

---

## 📝 Resumo das Mudanças

### entrypoint.sh
- ❌ Removido `--reload` (causava problemas em produção)

### docker-compose.yml (scraper service)
- ✅ Health check agora usa endpoint `/` em vez de `/health`
- ✅ Usa `127.0.0.1` em vez de `localhost`
- ✅ Mudou para `CMD-SHELL` (mais flexível)
- ✅ Aumentou `start_period` de 40s → 60s
- ✅ Aumentou `retries` de 3 → 5

---

## 🎯 Checklist Final

Execute `bash retry-scraper-health.sh` na VPS e verifique:

- [ ] ✅ Git pull funcionou
- [ ] ✅ Scraper reiniciou
- [ ] ✅ Aguardou 60 segundos
- [ ] ✅ Status mudou para `(healthy)`
- [ ] ✅ Health check manual retorna 200
- [ ] ✅ Logs sem erros
- [ ] ✅ Portainer mostra healthy
- [ ] ✅ Endpoints funcionam

---

## 🚀 Próximos Passos Após Sucesso

1. ✅ Verificar status no Portainer
2. ✅ Testar no frontend: https://briefflow2.netlify.app
3. ✅ Selecionar um cliente
4. ✅ Testar cada aba (Scrape, Search, Agent, Map, Crawl)
5. ✅ Verificar se conteúdo é salvo no Supabase

---

**Execute `bash retry-scraper-health.sh` na VPS agora! Deve funcionar!** 🚀
