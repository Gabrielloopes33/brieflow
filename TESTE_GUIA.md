# 🧪 GUIA DE TESTE - Integração Scraper

## ⚡ TESTE RÁPIDO (3 minutos)

### Passo 1: Iniciar os Serviços

**Opção A - Script Automático (Recomendado):**
```bash
# Windows PowerShell
.\start-briefflow.ps1

# Linux/Mac
./start-briefflow.sh
```

**Opção B - Manual (se o script der erro):**

Terminal 1 - Scraper Python:
```bash
cd scraper
pip install -r requirements.txt
python src/api/server.py
```

Terminal 2 - Backend Node.js:
```bash
npm run dev
```

---

### Passo 2: Verificar se Está Funcionando

Abra o navegador ou use curl:

```bash
# Testar Backend Node.js
curl http://localhost:5000/api/health

# Testar Scraper Python diretamente
curl http://localhost:8000/health

# Testar integração (Node.js chamando Python)
curl http://localhost:5000/api/scraper/health
```

**Resposta esperada:**
```json
{
  "status": "healthy",
  "scraper_url": "http://localhost:8000"
}
```

---

### Passo 3: Testar via Interface Web

1. **Abra o navegador:** http://localhost:5000

2. **Crie um cliente:**
   - Vá em "Clients" → "Add Client"
   - Preencha: Nome, Nicho, Público-alvo
   - Salve

3. **Adicione uma fonte:**
   - Entre no cliente criado
   - Vá em "Sources" → "Add Source"
   - Tipo: RSS
   - URL: `https://feeds.bbci.co.uk/news/technology/rss.xml` (exemplo)
   - Salve

4. **Inicie o scraping:**
   - Abra o DevTools do navegador (F12)
   - Vá na aba "Console"
   - Cole e execute:
   ```javascript
   // Pegue o ID do cliente da URL ou da lista
   const clientId = "COLE_AQUI_O_ID_DO_CLIENTE";
   
   fetch(`/api/clients/${clientId}/scrape`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ force_rescrape: false })
   })
   .then(r => r.json())
   .then(data => console.log('✅ Scraping iniciado:', data))
   .catch(e => console.error('❌ Erro:', e));
   ```

5. **Verifique o resultado:**
   - Vá em "Contents" no menu
   - Os artigos coletados devem aparecer em alguns segundos

---

## 🔧 TESTE AVANÇADO (Com curl)

### 1. Testar Health Check
```bash
curl http://localhost:5000/api/scraper/health | json_pp
```

### 2. Testar uma Fonte antes de adicionar
```bash
curl -X POST http://localhost:5000/api/scraper/test-source \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://feeds.bbci.co.uk/news/technology/rss.xml",
    "type": "rss"
  }' | json_pp
```

### 3. Fazer scraping de URL específica
```bash
curl -X POST http://localhost:5000/api/scraper/scrape-url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/article"
  }' | json_pp
```

### 4. Listar tarefas de scraping
```bash
curl http://localhost:5000/api/scraper/tasks | json_pp
```

---

## 🐛 RESOLUÇÃO DE PROBLEMAS

### "Scraper service unavailable"
```bash
# Verificar se o scraper está rodando
curl http://localhost:8000/

# Se não responder, inicie manualmente:
cd scraper
python src/api/server.py
```

### "No sources found for this client"
- Crie fontes no cliente antes de fazer scraping
- Vá em Clients → [Seu Cliente] → Sources → Add Source

### Erro de CORS
O scraper já está configurado para aceitar todas as origens em desenvolvimento.
Se der erro de CORS, verifique se o arquivo `scraper/src/api/server.py` tem:
```python
allow_origins=["*"]
```

### Porta 8000 já em uso
```bash
# Windows - encontrar e matar processo
netstat -ano | findstr :8000
taskkill /PID <NUMERO> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

---

## ✅ CHECKLIST DE TESTE

- [ ] Backend Node.js responde em http://localhost:5000
- [ ] Scraper Python responde em http://localhost:8000
- [ ] Integração funciona: /api/scraper/health retorna "healthy"
- [ ] Consigo criar um cliente
- [ ] Consigo adicionar uma fonte RSS
- [ ] Consigo iniciar scraping via API
- [ ] Conteúdos aparecem na lista

---

## 📝 PRÓXIMOS PASSOS

Se tudo funcionar:
1. ✅ Integração está ok!
2. Configurar agendamento automático (cron)
3. Adicionar mais fontes
4. Testar geração de briefs com Claude API

Se der erro:
1. Ver logs no terminal do scraper
2. Ver logs no terminal do Node.js
3. Verifique se o .env está configurado
4. Me chame para ajudar!
