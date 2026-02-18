# 🔧 Guia de Deploy na VPS - Fix requirements.txt

## ✅ Problema Resolvido

**Erro anterior**:
```
ERROR: Could not find a version that satisfies the requirement sqlite3
ERROR: No matching distribution found for sqlite3
```

**Causa**: `sqlite3` estava no `requirements.txt`, mas é parte da biblioteca padrão do Python (não é pacote PyPI).

**Solução**: Removido do `requirements.txt` e atualizado comentário.

---

## 🚀 Como fazer o deploy na VPS

### Passo 1: Conectar na VPS
```bash
ssh root@185.216.203.73
```

### Passo 2: Executar script de redeploy

**Opção A: Script completo (recomendado)**
```bash
cd /opt/brieflow
bash redeploy-scraper-only.sh
```

**Opção B: Manual (se preferir)**
```bash
cd /opt/brieflow

# 1. Atualizar código
git pull github main

# 2. Rebuild do scraper (com cache limpo)
docker compose build --no-cache scraper

# 3. Remover container antigo
docker compose stop scraper
docker compose rm -f scraper

# 4. Subir novo container
docker compose up -d scraper

# 5. Verificar status
docker ps | grep briefflow-scraper

# 6. Verificar logs
docker logs briefflow-scraper --tail 50
```

---

## ✅ O que o script faz

1. ✅ `git pull` - Atualiza código do GitHub
2. ✅ `docker compose build --no-cache scraper` - Rebuild do scraper
3. ✅ `docker compose stop scraper` - Para container antigo
4. ✅ `docker compose rm -f scraper` - Remove container antigo
5. ✅ `docker compose up -d scraper` - Inicia novo container
6. ✅ Aguarda 10 segundos para inicialização
7. ✅ Mostra status dos containers
8. ✅ Exibe logs do scraper (últimas 50 linhas)
9. ✅ Testa health check (`/health`)
10. ✅ Testa endpoint `/scrape`
11. ✅ Testa endpoint `/search`
12. ✅ Testa proxy do app → scraper

---

## 🧪 Verificação manual após deploy

### 1. Health check
```bash
curl http://localhost:8000/health
```

**Resposta esperada**:
```json
{
  "status": "healthy",
  "service": "BriefFlow Content Scraper API",
  "timestamp": "2026-02-18T...",
  "version": "1.0.0"
}
```

### 2. Testar endpoint Scrape
```bash
curl -s -X POST http://localhost:8000/scrape \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","formats":["markdown"]}' | jq .
```

### 3. Testar endpoint Search
```bash
curl -s -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query":"python","numResults":2}' | jq .
```

### 4. Testar proxy via App
```bash
docker exec briefflow-app curl -s -X POST http://scraper:8000/scrape \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","formats":["markdown"]}' | jq .
```

---

## 📋 Logs e Troubleshooting

### Ver logs em tempo real
```bash
docker logs -f briefflow-scraper
```

### Ver logs do app também
```bash
docker logs -f briefflow-app briefflow-scraper
```

### Ver status dos containers
```bash
docker ps
```

### Ver apenas containers briefflow
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep briefflow
```

### Se scraper não iniciar
```bash
# Ver logs completos
docker logs briefflow-scraper

# Ver o que está sendo executado
docker exec briefflow-scraper ps aux

# Entrar no container para debug
docker exec -it briefflow-scraper /bin/bash

# Dentro do container:
python -c "import sqlite3; print('SQLite OK')"
python -c "import fastapi; print('FastAPI OK')"
python main.py
```

### Se app não conseguir acessar scraper
```bash
# Testar do app container
docker exec briefflow-app curl -v http://scraper:8000/health

# Verificar rede
docker network inspect briefflow-network

# Verificar DNS
docker exec briefflow-app nslookup scraper
```

---

## ✅ Testes no Frontend

Após o deploy bem-sucedido, teste no frontend:

1. Acessar: https://briefflow2.netlify.app
2. Fazer login
3. Selecionar um cliente
4. Testar cada aba:

### Scrape Tab
```
URL: https://example.com
Formato: markdown
[Scrape] → Deve aparecer o conteúdo
[Salvar no Banco] → Deve salvar no Supabase
```

### Search Tab
```
Query: python web scraping
Resultados: 5
[Search] → Deve aparecer resultados
[Salvar no Banco] → Deve salvar no Supabase
```

### Agent Tab
```
Prompt: Olá mundo
[Run Agent] → Deve aparecer resposta do Z.ai
[Salvar no Banco] → Deve salvar no Supabase
```

### Map Tab
```
URL: https://example.com
[Map Site] → Deve aparecer lista de URLs
[Salvar no Banco] → Deve salvar no Supabase
```

### Crawl Tab
```
URL: https://example.com
Max Pages: 10
[Start Crawl] → Deve aparecer páginas visitadas
[Salvar no Banco] → Deve salvar no Supabase
```

---

## 🔧 API Keys Configuradas

**Firecrawl** (para Scrape, Map, Crawl):
- API Key: `fc-c4ff34f7d0644bab97f5d82a65148880`
- Base URL: `https://api.firecrawl.dev/v1`

**Z.ai** (para Agent) - OPCIONAL:
- API Key: `5c03177d5d75466293543d34ce3f58d6.Z6AhWru7sTn9I47I`
- Base URL: `https://api.z.ai/api/paas/v4/chat/completions`
- Modelo: `glm-5`

**DuckDuckGo** (para Search):
- Gratuito, sem API key necessária

---

## 📊 Monitoramento

### Verificar uso de recursos
```bash
docker stats briefflow-scraper briefflow-app --no-stream
```

### Verificar se há erros
```bash
docker logs briefflow-scraper 2>&1 | grep -i error
docker logs briefflow-app 2>&1 | grep -i error
```

### Verificar requisições
```bash
docker logs briefflow-scraper 2>&1 | grep "POST /"
```

---

## 🎯 Checklist de Sucesso

- [ ] ✅ Scraper container está rodando (status: Up)
- [ ] ✅ Health check `/health` retorna `healthy`
- [ ] ✅ Endpoint `/scrape` funciona
- [ ] ✅ Endpoint `/search` funciona
- [ ] ✅ Endpoint `/agent` funciona (ou retorna erro amigável)
- [ ] ✅ Endpoint `/map` funciona
- [ ] ✅ Endpoint `/crawl` funciona
- [ ] ✅ Proxy do app → scraper funciona
- [ ] ✅ Frontend consegue chamar endpoints via `/api/scraper/*`
- [ ] ✅ Conteúdo é salvo no Supabase
- [ ] ✅ Logs sem erros críticos

---

## 🚨 Problemas Comuns

### "Scraper restartando"
- **Ver**: `docker logs briefflow-scraper --tail 100`
- **Causa**: Erro de importação ou crash na inicialização
- **Solução**: `docker compose build --no-cache scraper && docker compose up -d scraper`

### "Proxy não funciona"
- **Ver**: `docker exec briefflow-app curl http://scraper:8000/health`
- **Causa**: Rede não configurada ou containers em redes diferentes
- **Solução**: Verificar se ambos estão em `briefflow-network`

### "Agent retorna erro"
- **Ver**: Logs do scraper por mensagens de Z.ai
- **Causa**: API key sem saldo
- **Solução**: Recarregar saldo em https://z.ai/manage-apikey/billing

### "Search retorna vazio"
- **Ver**: Logs do scraper
- **Causa**: DuckDuckGo bloqueando ou query mal formatada
- **Solução**: Tentar query diferente

---

## 📝 Notas Finais

- Os containers do `app` e `scraper` se comunicam pela rede `briefflow-network`
- O scraper expõe porta 8000 internamente (docker) e externamente (host)
- O app usa `http://scraper:8000` para se comunicar com o scraper
- Toda a configuração está no `docker-compose.yml`

---

**Execute `bash redeploy-scraper-only.sh` na VPS e tudo deve funcionar!** 🚀
