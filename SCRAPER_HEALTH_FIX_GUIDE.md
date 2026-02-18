# 🔧 Guia de Correção - Health Check Unhealthy

## 🎯 Problema

**Status**: Container `briefflow-scraper` aparece como **`(unhealthy)`**
- Docker health check falha retornando **404 Not Found**
- Logs mostram API rodando corretamente
- Status: Up 2 minutes (unhealthy)

---

## ❓ Por que acontece?

### Causa Raiz

No arquivo `scraper/entrypoint.sh`:
```bash
exec python -m uvicorn main:app --host $API_HOST --port $API_PORT --reload
```

O **`--reload`** está presente! ⚠️

### Problemas do `--reload` em produção:

1. **Cria dois processos**:
   - Processo "reloader" (monitora filesystem)
   - Processo "server" (roda FastAPI real)

2. **Race Condition**:
   - Docker inicia health check quando processo pai começa
   - Mas FastAPI (processo filho) pode não estar pronto
   - Resultado: Health check falha → Unhealthy

3. **Sobrecarga desnecessária**:
   - Monitora filesystem por mudanças
   - Consume CPU/IO do disco
   - Em Docker, não há arquivos para mudar de qualquer forma!

4. **Comportamento inesperado**:
   - Pode causar restarts aleatórios
   - Pode causar health checks inconsistentes
   - Logs confusos com mensagens de reload

---

## ✅ Correção Aplicada

### 1. Removido `--reload` do entrypoint.sh

**Antes**:
```bash
exec python -m uvicorn main:app --host $API_HOST --port $API_PORT --reload
```

**Depois**:
```bash
exec python -m uvicorn main:app --host $API_HOST --port $API_PORT
```

### 2. Resultado esperado

- ✅ Processo único rodando
- ✅ Startup rápido e estável
- ✅ Health check funciona corretamente
- ✅ Container muda para `(healthy)` automaticamente
- ✅ Sem overhead de monitoramento de filesystem

---

## 🚀 Como Aplicar a Correção na VPS

### Passo 1: Conectar na VPS

```bash
ssh root@185.216.203.73
```

### Passo 2: Executar script automático (recomendado)

```bash
cd /opt/brieflow
bash fix-scraper-health.sh
```

Este script faz **tudo automaticamente**:
- ✅ Git pull do código atualizado
- ✅ Para e remove container antigo
- ✅ Rebuild sem cache (garante mudanças)
- ✅ Inicia novo container
- ✅ Aguarda 15s para startup
- ✅ Testa health check
- ✅ Testa novamente se falhou na 1ª
- ✅ Mostra logs completos
- ✅ Mostra status final

### Passo 3: Verificar resultado

```bash
# Verificar status
docker ps | grep briefflow-scraper
```

**Status esperado**:
```
0071900c9165   brieflow-scraper   "entrypoint.sh"   1m ago   Up 1m (healthy)   0.0.0.0:8000->8000/tcp
```

**Nota**: Pode levar 30-60s para mudar de `starting` para `healthy`!

---

## 📋 Diagnóstico Manual (se necessário)

### Verificar logs
```bash
docker logs briefflow-scraper --tail 50
```

### Testar health check manual
```bash
curl -s http://localhost:8000/health | jq '.'
```

### Testar de dentro do container
```bash
docker exec briefflow-scraper curl -s http://localhost:8000/health | jq '.'
```

### Ver se o endpoint está registrado
```bash
docker exec briefflow-scraper curl -s http://localhost:8000/docs
```

---

## 🔍 Se continuar unhealthy após correção

### 1. Verificar se há erros nos logs
```bash
docker logs briefflow-scraper 2>&1 | grep -i error
```

### 2. Verificar se o processo está rodando
```bash
docker exec briefflow-scraper ps aux | grep python
```

### 3. Verificar se o port está aberto
```bash
docker exec briefflow-scraper netstat -tlnp | grep 8000
```

### 4. Verificar importação dos scrapers novos
```bash
docker exec briefflow-scraper python -c "
import scrapers.search_scraper
import scrapers.agent_scraper
import scrapers.site_mapper
import scrapers.web_crawler
print('All scrapers imported successfully')
"
```

### 5. Reiniciar o container
```bash
docker compose restart scraper
```

### 6. Rebuild completamente
```bash
cd /opt/brieflow
docker compose down scraper
docker rmi briefflow-scraper
git pull github main
docker compose build --no-cache scraper
docker compose up -d scraper
```

---

## 📊 Timeline Esperada

### Após executar o fix-scraper-health.sh:

| Tempo | Ação | Status Esperado |
|-------|------|-----------------|
| 0-15s | Build e start | `Up <seconds> (starting)` |
| 15-30s | Health check 1ª tentativa | Pode ser `health: starting` |
| 30-45s | Health check 2ª tentativa | Pode ser `health: starting` ou `healthy` |
| 45-75s | Health check 3ª tentativa | Deve ser `healthy` |
| 60s+ | Verificação final | `healthy` |

### Se ainda unhealthy após 2 minutos:

- Verificar logs: `docker logs briefflow-scraper`
- Investigar por erros de importação ou configuração
- Possível problema com API keys ou banco de dados

---

## ✅ Checklist de Verificação

Após executar `bash fix-scraper-health.sh`:

- [ ] Container está rodando (`Up`)
- [ ] Status mudou de `starting` para `healthy`
- [ ] Health check manual retorna 200 OK
- [ ] Endpoint `/health` retorna JSON válido
- [ ] Logs sem erros críticos
- [ ] Portainer mostra status healthy
- [ ] Nenhum processo de reload nos logs

---

## 🎯 Teste Completo Após Correção

### 1. Health check
```bash
curl -s http://localhost:8000/health | jq '.'
```

### 2. Endpoint scrape
```bash
curl -s -X POST http://localhost:8000/scrape \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","formats":["markdown"]}' | jq '.'
```

### 3. Endpoint search
```bash
curl -s -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query":"test","numResults":1}' | jq '.'
```

### 4. Teste via proxy do app
```bash
docker exec briefflow-app curl -s http://scraper:8000/health | jq '.'
```

---

## 📝 Notas Importantes

1. **`--reload` só deve ser usado em desenvolvimento local**
2. **Em produção/Docker, NUNCA usar `--reload`**
3. **O `exec` no entrypoint é importante** - garante que o processo principal seja o uvicorn
4. **Health check tem `start_period: 40s`** - dá tempo para inicialização
5. **Após 3 falhas consecutivas, marca como unhealthy**

---

## 🚨 Diferença: Com vs Sem --reload

| Aspecto | Com --reload (DEV) | Sem --reload (PROD) |
|----------|-------------------|---------------------|
| Processos | 2 (reloader + server) | 1 (server) |
| Startup | Lento (monitora arquivos) | Rápido |
| Health check | Instável (race condition) | Estável |
| CPU/IO | Alto (monitoramento) | Baixo |
| Uso | Desenvolvimento local | Produção/Docker |

---

## 📚 Documentação

- **FastAPI Deploys**: https://fastapi.tiangolo.com/deployment/
- **Uvicorn Docs**: https://www.uvicorn.org/
- **Docker Health Checks**: https://docs.docker.com/engine/reference/builder/#healthcheck

---

**Execute `bash fix-scraper-health.sh` na VPS para aplicar a correção!** 🚀
