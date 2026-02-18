# 🚀 Nova API do Scraper - Guia de Testes

Implementação das funcionalidades de scraping usando **Firecrawl** e **Z.ai**.

---

## ✅ O que foi implementado

### Novos Scrapers Python

1. **search_scraper.py** - Busca web usando Firecrawl API
2. **agent_scraper.py** - Agente AI usando Z.ai API
3. **site_mapper.py** - Mapeamento de sites usando Firecrawl
4. **web_crawler.py** - Crawling completo usando Firecrawl

### Novos Endpoints Python

- `POST /scrape` - Scrape de URL com formatos (markdown, html, links)
- `POST /search` - Busca web
- `POST /agent` - Executar agente AI
- `POST /map` - Mapear estrutura de site
- `POST /crawl` - Crawling completo de site

### Proxy no Backend Node.js

Todos os endpoints acima estão disponíveis via proxy em:
- `POST /api/scraper/scrape`
- `POST /api/scraper/search`
- `POST /api/scraper/agent`
- `POST /api/scraper/map`
- `POST /api/scraper/crawl`

---

## 🔑 Configurações

### API Keys Configuradas

**Firecrawl API** (para Search, Map, Crawl):
- API Key: `fc-c4ff34f7d0644bab97f5d82a65148880`
- Base URL: `https://api.firecrawl.dev/v1`

**Z.ai API** (para Agent):
- API Key: `5c03177d5d75466293543d34ce3f58d6.Z6AhWru7sTn9I47I`
- Base URL: `https://api.z.ai/v1/chat/completions`
- Modelo: `gpt-4o-mini` (econômico e rápido)

### Variáveis de Ambiente

**Scraper Python** (`scraper/.env`):
```env
FIRECRAWL_API_KEY=fc-c4ff34f7d0644bab97f5d82a65148880
ZAI_API_KEY=5c03177d5d75466293543d34ce3f58d6.Z6AhWru7sTn9I47I
```

**Backend Node.js** (`.env`):
```env
SCRAPER_URL=http://localhost:8000  # Ou http://scraper:8000 em Docker
```

**Docker Compose**:
```yaml
scraper:
  environment:
    - FIRECRAWL_API_KEY=fc-c4ff34f7d0644bab97f5d82a65148880
    - ZAI_API_KEY=5c03177d5d75466293543d34ce3f58d6.Z6AhWru7sTn9I47I

app:
  environment:
    - SCRAPER_URL=http://scraper:8000
```

---

## 🧪 Como Testar

### 1. Iniciar os Serviços

#### Desenvolvimento Local

```bash
# Terminal 1 - Iniciar Scraper Python
cd Content-Generator/scraper
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate  # Windows
python main.py

# Terminal 2 - Iniciar Backend Node.js
cd Content-Generator
npm run dev
```

#### Docker

```bash
cd Content-Generator
docker compose up -d scraper app

# Verificar logs
docker logs briefflow-scraper --tail 30
docker logs briefflow-app --tail 30
```

### 2. Testar Endpoints Diretamente no Scraper

```bash
# === Scrape URL ===
curl -X POST http://localhost:8000/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "formats": ["markdown"]
  }'

# === Web Search ===
curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "python web scraping tutorial",
    "numResults": 5
  }'

# === AI Agent ===
curl -X POST http://localhost:8000/agent \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explique em 3 tópicos o que é web scraping"
  }'

# === Map Site ===
curl -X POST http://localhost:8000/map \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com"
  }'

# === Crawl Site ===
curl -X POST http://localhost:8000/crawl \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "maxPages": 10
  }'
```

### 3. Testar via Proxy do Backend Node.js

```bash
# === Scrape URL via Proxy ===
curl -X POST http://localhost:5000/api/scraper/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "formats": ["markdown"]
  }'

# === Web Search via Proxy ===
curl -X POST http://localhost:5000/api/scraper/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "python web scraping tutorial",
    "numResults": 5
  }'

# === AI Agent via Proxy ===
curl -X POST http://localhost:5000/api/scraper/agent \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explique em 3 tópicos o que é web scraping"
  }'

# === Map Site via Proxy ===
curl -X POST http://localhost:5000/api/scraper/map \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com"
  }'

# === Crawl Site via Proxy ===
curl -X POST http://localhost:5000/api/scraper/crawl \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "maxPages": 10
  }'
```

### 4. Testar no Frontend

1. Acessar o frontend: `http://localhost:5001` (dev) ou URL da VPS
2. Fazer login
3. Criar um cliente se ainda não tiver
4. Selecionar um cliente no topo da página do Chat
5. Testar cada aba:

#### Scrape Tab
- Digitar uma URL (ex: `https://example.com`)
- Selecionar formato: markdown, html ou links
- Clicar em **"Scrape"**
- Verificar se o conteúdo aparece corretamente
- Clicar em **"Salvar no Banco"** e verificar se é salvo no Supabase

#### Search Tab
- Digitar termo de busca (ex: "python web scraping")
- Selecionar número de resultados (3, 5, 10, 20)
- Clicar em **"Search"**
- Verificar se os resultados aparecem
- Clicar em **"Salvar no Banco"** e verificar se é salvo no Supabase

#### Agent Tab
- Digitar um prompt (ex: "Explique o que é web scraping")
- Clicar em **"Run Agent"**
- Verificar se a resposta aparece
- Clicar em **"Salvar no Banco"** e verificar se é salvo no Supabase

#### Map Tab
- Digitar uma URL (ex: `https://example.com`)
- Clicar em **"Map Site"**
- Verificar se as URLs aparecem
- Clicar em **"Salvar no Banco"** e verificar se é salvo no Supabase

#### Crawl Tab
- Digitar uma URL (ex: `https://example.com`)
- Selecionar máximo de páginas (5, 10, 25, 50, 100)
- Clicar em **"Start Crawl"**
- Verificar se as páginas aparecem
- Clicar em **"Salvar no Banco"** e verificar se é salvo no Supabase

---

## 🔍 Troubleshooting

### Scraper não inicia

```bash
# Verificar logs
docker logs briefflow-scraper --tail 50

# Testar health check
curl http://localhost:8000/health
```

### Erro "Failed to reach scraper"

```bash
# Verificar se scraper está rodando
docker ps | grep briefflow-scraper

# Verificar variável de ambiente no app
docker exec briefflow-app env | grep SCRAPER
```

### Proxy não funciona

```bash
# Testar comunicação entre containers
docker exec briefflow-app curl http://scraper:8000/health

# Verificar se estão na mesma rede
docker network inspect briefflow-network
```

### Erros de API (Firecrawl / Z.ai)

```bash
# Verificar logs do scraper para mensagens de erro
docker logs briefflow-scraper --tail 100 | grep -i error

# Testar API keys manualmente
curl https://api.firecrawl.dev/v1/scrape \
  -H "Authorization: Bearer fc-c4ff34f7d0644bab97f5d82a65148880" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "formats": ["markdown"]}'
```

### Frontend não salva no banco

```bash
# Verificar se cliente está selecionado
# No frontend: selecionar um cliente no dropdown

# Verificar logs do backend
docker logs briefflow-app --tail 50 | grep -i error

# Verificar se conhecimento está sendo salvo no Supabase
# Abrir console do Supabase e verificar tabela knowledge_items
```

---

## 📊 Monitoramento

### Verificar Status dos Serviços

```bash
# Todos os containers
docker ps

# Status específico
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Health check
curl http://localhost:8000/health  # Scraper
curl http://localhost:5000/api/health  # Backend
```

### Logs em Tempo Real

```bash
# Scraper
docker logs -f briefflow-scraper

# Backend
docker logs -f briefflow-app

# Ambos
docker logs -f briefflow-scraper briefflow-app
```

---

## 🎯 Próximos Passos após Sucesso

1. ✅ Verificar se todos os botões funcionam no frontend
2. ✅ Confirmar que o conteúdo é salvo no Supabase
3. ✅ Monitorar logs em busca de erros
4. ✅ Otimizar performance se necessário
5. ✅ Adicionar rate limiting por usuário
6. ✅ Implementar cache para buscas repetidas

---

## 📝 Notas Importantes

- **Firecrawl** tem rate limits - respeite delays entre requisições
- **Z.ai** é mais barato que Anthropic e tem bons modelos
- Em produção, implementar rate limiting por usuário
- Em produção, implementar cache para buscar repetidas
- Em produção, monitorar uso de APIs para não exceder quotas

---

**Teste todos os endpoints e me informe se funcionou!** 🚀
