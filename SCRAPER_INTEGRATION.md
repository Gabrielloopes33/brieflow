# 🕷️ Integração do Scraper Python

Este documento descreve como o scraper Python foi integrado ao backend Node.js do BriefFlow.

## 🎯 Objetivo

Permitir que o frontend e o backend Node.js acionem o scraper Python para coletar conteúdo automaticamente.

## 🏗️ Arquitetura

```
┌─────────────────┐      HTTP       ┌──────────────────┐
│   Frontend      │ ◄──────────────► │  Backend Node.js │
│  (React/Vite)   │                  │   (Porta 5000)   │
└─────────────────┘                  └────────┬─────────┘
                                              │ HTTP
                                              ▼
                                     ┌──────────────────┐
                                     │  Scraper Python  │
                                     │  FastAPI:8000    │
                                     └──────────────────┘
                                              │
                                              ▼
                                     ┌──────────────────┐
                                     │      SQLite      │
                                     │  (briefflow.db)  │
                                     └──────────────────┘
```

## 📁 Arquivos Criados/Modificados

### 1. Serviço de Integração
**Arquivo:** `server/services/scraper.ts`

Serviço TypeScript que faz chamadas HTTP ao scraper Python:
- `checkScraperHealth()` - Verifica se o scraper está disponível
- `startScraping()` - Inicia uma tarefa de scraping
- `getTaskStatus()` - Obtém status de uma tarefa
- `scrapeUrl()` - Faz scraping de URL específica
- `testSource()` - Testa uma fonte antes de adicionar

### 2. Rotas da API
**Arquivo:** `server/routes.ts`

Novas rotas adicionadas ao backend Node.js:

| Rota | Método | Descrição |
|------|--------|-----------|
| `/api/scraper/health` | GET | Verifica saúde do scraper |
| `/api/clients/:clientId/scrape` | POST | Inicia scraping para um cliente |
| `/api/scraper/tasks/:taskId` | GET | Status de uma tarefa |
| `/api/scraper/tasks` | GET | Lista todas as tarefas |
| `/api/scraper/scrape-url` | POST | Scraping de URL específica |
| `/api/scraper/test-source` | POST | Testa uma fonte |
| `/api/clients/:clientId/sync-contents` | POST | Sincroniza conteúdos |

### 3. Scripts de Inicialização

**Linux/Mac:** `start-briefflow.sh`
**Windows:** `start-briefflow.ps1`

Iniciam ambos os serviços (Node.js + Python) automaticamente.

### 4. Configuração
**Arquivo:** `.env`

```env
# URL do serviço de scraper Python
SCRAPER_API_URL=http://localhost:8000
```

## 🚀 Como Usar

### 1. Iniciar Tudo de Uma Vez

**Linux/Mac:**
```bash
chmod +x start-briefflow.sh
./start-briefflow.sh
```

**Windows:**
```powershell
.\start-briefflow.ps1
```

Isso inicia:
- Scraper Python na porta 8000
- Backend Node.js na porta 5000

### 2. Iniciar Manualmente (Desenvolvimento)

Terminal 1 - Scraper:
```bash
cd scraper
source venv/bin/activate  # Windows: .\venv\Scripts\activate
python src/api/server.py
```

Terminal 2 - Backend:
```bash
npm run dev
```

### 3. Fazer Scraping de um Cliente

```bash
# Iniciar scraping para um cliente específico
curl -X POST http://localhost:5000/api/clients/{client_id}/scrape

# Com fontes específicas
curl -X POST http://localhost:5000/api/clients/{client_id}/scrape \
  -H "Content-Type: application/json" \
  -d '{"source_ids": ["source-id-1", "source-id-2"]}'

# Forçar re-scraping
curl -X POST http://localhost:5000/api/clients/{client_id}/scrape \
  -H "Content-Type: application/json" \
  -d '{"force_rescrape": true}'
```

### 4. Verificar Status

```bash
# Status do scraper
curl http://localhost:5000/api/scraper/health

# Status de uma tarefa
curl http://localhost:5000/api/scraper/tasks/{task_id}

# Todas as tarefas
curl http://localhost:5000/api/scraper/tasks
```

### 5. Testar uma Fonte

```bash
curl -X POST http://localhost:5000/api/scraper/test-source \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://exemplo.com/feed.xml",
    "type": "rss"
  }'
```

## 🔌 Fluxo de Dados

### Scraping Automático
1. Usuário chama `POST /api/clients/{id}/scrape`
2. Backend Node.js valida o cliente
3. Backend busca fontes do cliente (ou usa as fornecidas)
4. Backend chama `POST http://localhost:8000/scrape`
5. Scraper Python processa as fontes
6. Scraper salva conteúdo no SQLite
7. Backend retorna `task_id` para acompanhamento

### Sincronização de Conteúdo
1. Usuário chama `POST /api/clients/{id}/sync-contents`
2. Backend chama `GET http://localhost:8000/clients/{id}/contents`
3. Backend recebe conteúdos do scraper
4. (Opcional) Backend sincroniza com banco local

## 🛠️ Desenvolvimento

### Adicionar Nova Funcionalidade

1. Adicione a função em `server/services/scraper.ts`:
```typescript
export async function novaFuncao(param: string): Promise<Retorno> {
  const response = await fetch(`${SCRAPER_API_URL}/endpoint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ param }),
  });
  return response.json();
}
```

2. Adicione a rota em `server/routes.ts`:
```typescript
app.post("/api/scraper/nova-rota", async (req, res) => {
  try {
    const result = await novaFuncao(req.body.param);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});
```

## 🔧 Troubleshooting

### Scraper não responde
```bash
# Verificar se está rodando
curl http://localhost:8000/health

# Ver logs do scraper
cd scraper
python src/api/server.py
```

### Erro de CORS
O scraper já está configurado para aceitar requisições de qualquer origem em desenvolvimento. Em produção, configure `allow_origins` em `scraper/src/api/server.py`.

### Banco de dados não encontrado
Ambos os serviços usam o mesmo banco SQLite (`data/briefflow.db`). Verifique se o arquivo existe:
```bash
ls -la data/briefflow.db
```

## 📋 Próximos Passos

- [ ] Implementar agendamento automático (cron)
- [ ] Adicionar webhook para notificações de novos conteúdos
- [ ] Criar fila de processamento para grandes volumes
- [ ] Implementar retry automático em caso de falha

---

**Nota:** Esta integração mantém o scraper Python como serviço separado, permitindo migração futura para arquitetura 100% Python se necessário.
