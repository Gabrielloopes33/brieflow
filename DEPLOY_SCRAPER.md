# 🚀 DEPLOY DO SCRAPER PYTHON - PASSO A PASSO

## ✅ O que foi feito:

1. ✅ Corrigido `entrypoint.sh` para iniciar API FastAPI corretamente
2. ✅ Adicionado serviço `scraper` ao `docker-compose.yml`
3. ✅ Configurado health check e volumes compartilhados

---

## 📋 INSTRUÇÕES PARA DEPLOY NA VPS

### 1. Atualizar código na VPS

```bash
cd /opt/brieflow
git pull github main
```

### 2. Build e iniciar o scraper

```bash
# Build da imagem do scraper
docker compose build scraper

# Iniciar o serviço
docker compose up -d scraper

# Verificar logs
sleep 10
docker logs briefflow-scraper --tail 30
```

### 3. Verificar se está funcionando

```bash
# Testar health check
curl http://localhost:8000/health

# Ver container rodando
docker ps | grep briefflow-scraper
```

**Esperado:**
- Container status: `Up` (não Restarting)
- Health check: JSON com status "healthy"
- Porta 8000 mapeada

### 4. Testar integração com backend

```bash
# Testar se backend consegue acessar scraper
curl http://localhost:5000/api/health

# Ou testar diretamente do container backend
docker exec briefflow-app curl http://briefflow-scraper:8000/health
```

---

## 🧪 TESTE COMPLETO

### Usar o script de diagnóstico:

```bash
cd /opt/brieflow
./diagnose-system.sh
```

Ou testar manualmente:

```bash
# 1. Verificar todos os containers
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 2. Testar scraper
curl http://localhost:8000/health
curl http://localhost:8000/info

# 3. Testar backend
curl http://localhost:5000/api/health

# 4. Listar clientes no scraper
curl http://localhost:8000/clients
```

---

## 🔧 SOLUÇÃO DE PROBLEMAS

### Erro: "No such file or directory" no build

**Solução:** Verificar se pasta scraper existe:
```bash
ls -la /opt/brieflow/scraper/
```

### Erro: Container restartando

**Solução:** Ver logs:
```bash
docker logs briefflow-scraper --tail 50
```

### Erro: Porta 8000 em uso

**Solução:** Ver o que está usando a porta:
```bash
sudo lsof -i :8000
docker ps --format "table {{.Names}}\t{{.Ports}}" | grep 8000
```

---

## 📊 FLUXO DE TRABALHO APÓS DEPLOY

### 1. No Frontend (Netlify):

1. Acesse: https://briefflow2.netlify.app
2. Faça login
3. Crie um cliente (se ainda não tiver)
4. Vá em "Fontes" → "Adicionar Fonte"
5. Adicione uma fonte RSS:
   - Nome: "BBC Tech"
   - URL: `https://feeds.bbci.co.uk/news/technology/rss.xml`
   - Tipo: RSS

### 2. Executar Scraping:

```bash
# Pelo frontend (botão "Executar Scraping")
# Ou via API diretamente:
curl -X POST http://localhost:8000/scrape \
  -H "Content-Type: application/json" \
  -d '{"client_ids": ["<client_id>"]}'
```

### 3. Verificar conteúdos coletados:

No frontend: "Conteúdos" → devem aparecer artigos da BBC Tech

---

## 🎉 PRÓXIMOS PASSOS

Depois que o scraper estiver rodando:

1. **Testar scraping manual** via frontend
2. **Verificar se conteúdos aparecem** na lista
3. **Gerar um brief** usando a IA (Claude)
4. **Adicionar mais fontes** (blogs, notícias)

---

## 🆘 PRECISA DE AJUDA?

Se encontrar problemas:

1. Verifique logs: `docker logs briefflow-scraper --tail 100`
2. Execute diagnóstico: `./diagnose-system.sh`
3. Teste scraper: `python3 test-scraper.py`

**Execute os comandos acima e me informe se deu algum erro!** 🚀
