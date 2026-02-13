# 🧪 Guia de Testes e Diagnóstico do BriefFlow

Este guia explica como testar e diagnosticar todo o sistema BriefFlow, desde o backend até o frontend.

---

## 📋 Índice

1. [Testes Rápidos na VPS](#1-testes-rápidos-na-vps)
2. [Diagnóstico Completo](#2-diagnóstico-completo)
3. [Testes no Frontend](#3-testes-no-frontend)
4. [Fluxo de Teste Completo](#4-fluxo-de-teste-completo)
5. [Solução de Problemas](#5-solução-de-problemas)

---

## 1. Testes Rápidos na VPS

### 1.1 Verificar se serviços estão rodando

```bash
# Conectar na VPS
ssh root@185.216.203.73

# Ver containers Docker
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Deve mostrar:
# - briefflow-app (Node.js backend)
# - supabase_kong (Auth/Database)
# - scraper (Python FastAPI) - se estiver configurado
```

### 1.2 Testar endpoints individualmente

```bash
# Testar Scraper Python (porta 8000)
curl http://localhost:8000/health

# Testar Backend Node.js (porta 5000)
curl http://localhost:5000/api/health

# Testar Supabase (porta 8000 do Kong)
curl https://supa.agenciatouch.com.br/auth/v1/health
```

---

## 2. Diagnóstico Completo

### 2.1 Usar o script de diagnóstico

Na VPS, execute:

```bash
cd /opt/brieflow
chmod +x diagnose-system.sh
./diagnose-system.sh
```

Este script verifica:
- ✅ Containers Docker rodando
- ✅ Endpoints do Scraper Python (porta 8000)
- ✅ Endpoints do Backend Node.js (porta 5000)
- ✅ Integração entre Node.js ↔ Python
- ✅ Banco de dados SQLite
- ✅ Funcionalidade de scraping

### 2.2 Usar o script Python de teste

```bash
cd /opt/brieflow
python3 test-scraper.py
```

Este script Python testa:
- ✅ Health check da API
- ✅ Listagem de clientes
- ✅ Listagem de fontes
- ✅ Scraping de URL específica
- ✅ Teste de fonte RSS
- ✅ Criação de tarefa de scraping
- ✅ Status de tarefas

---

## 3. Testes no Frontend

### 3.1 Teste Básico de Autenticação

1. Acesse: https://briefflow2.netlify.app
2. Crie uma conta ou faça login
3. **Esperado**: Login bem-sucedido, redirecionamento para dashboard

### 3.2 Teste de Criação de Cliente

1. No dashboard, clique em "Clientes"
2. Clique em "Novo Cliente"
3. Preencha:
   - Nome: "Teste Cliente"
   - Nicho: "Tecnologia"
   - Público-alvo: "Desenvolvedores"
4. **Esperado**: Cliente criado com sucesso

### 3.3 Teste de Adição de Fonte

1. Entre no cliente criado
2. Clique em "Fontes" → "Adicionar Fonte"
3. Teste com um RSS público:
   - Nome: "BBC Tech"
   - URL: `https://feeds.bbci.co.uk/news/technology/rss.xml`
   - Tipo: RSS
4. **Esperado**: Fonte adicionada (ou erro se o scraper não estiver rodando)

### 3.4 Teste de Scraping Manual

1. Na página de fontes, clique em "Testar" ou "Executar Scraping"
2. **Esperado**: 
   - Se scraper estiver rodando: Tarefa criada
   - Se não: Erro de conexão

### 3.5 Teste de Geração de Brief

1. Vá para "Conteúdos"
2. Selecione alguns conteúdos (se houver)
3. Clique em "Gerar Brief"
4. **Esperado**: Brief gerado com título, ângulo e pontos-chave

---

## 4. Fluxo de Teste Completo

### Passo a Passo Completo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. VERIFICAR SERVIÇOS NA VPS                                 │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. EXECUTAR SCRIPTS DE TESTE                                 │
│    ./diagnose-system.sh                                     │
│    python3 test-scraper.py                                  │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. TESTAR NO FRONTEND                                        │
│    - Login                                                  │
│    - Criar cliente                                          │
│    - Adicionar fonte RSS                                    │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. TESTAR SCRAPING                                           │
│    - Executar scraping manual                               │
│    - Verificar conteúdos coletados                          │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. TESTAR GERAÇÃO DE BRIEF                                   │
│    - Selecionar conteúdos                                   │
│    - Gerar brief com IA                                     │
│    - Verificar resultado                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Solução de Problemas

### ❌ Problema: Scraper Python não responde (porta 8000)

**Sintoma**: `curl http://localhost:8000/health` retorna erro

**Soluções**:

1. Verificar se container existe:
```bash
docker ps -a | grep scraper
```

2. Se não existir, verificar se está no docker-compose:
```bash
cat /opt/brieflow/docker-compose.yml | grep -A 20 "scraper:"
```

3. Se não estiver no compose, iniciar manualmente:
```bash
cd /opt/brieflow/scraper
pip install -r requirements.txt
python main.py
```

4. Ou adicionar ao docker-compose:
```yaml
scraper:
  build: ./scraper
  ports:
    - "8000:8000"
  volumes:
    - ./data:/app/data
  environment:
    - DATABASE_PATH=/app/data/briefflow.db
```

### ❌ Problema: Erro 401 no Supabase

**Sintoma**: Não consegue fazer login ou criar conta

**Solução**: Verificar variáveis de ambiente no Netlify:
- `VITE_SUPABASE_URL` deve ser `https://supa.agenciatouch.com.br`
- `VITE_SUPABASE_ANON_KEY` deve estar completa

### ❌ Problema: Erro de CORS

**Sintoma**: Erros no console do navegador sobre CORS

**Solução**: Verificar configuração CORS no backend da VPS:
```bash
nano /opt/brieflow/server/index.ts
```

Adicionar domínio do Netlify:
```typescript
origin: [
  'https://briefflow2.netlify.app',
  'https://*.netlify.app'
]
```

Reiniciar:
```bash
docker compose restart briefflow-app
```

### ❌ Problema: Scraping não funciona

**Sintoma**: Fonte adicionada mas não coleta conteúdos

**Diagnóstico**:
1. Verificar logs do scraper:
```bash
docker compose logs --tail 50 scraper
```

2. Testar fonte individualmente:
```bash
curl -X POST "http://localhost:8000/test-source" \
  -d "url=https://exemplo.com/feed.xml" \
  -d "source_type=rss"
```

3. Verificar se banco SQLite está acessível:
```bash
ls -la /opt/brieflow/data/briefflow.db
sqlite3 /opt/brieflow/data/briefflow.db ".tables"
```

### ❌ Problema: Brief não é gerado

**Sintoma**: Clique em "Gerar Brief" mas nada acontece

**Solução**:
1. Verificar se `ANTHROPIC_API_KEY` está configurada:
```bash
cat /opt/brieflow/.env | grep ANTHROPIC
```

2. Verificar logs do backend:
```bash
docker compose logs --tail 50 briefflow-app
```

---

## 📊 Checklist de Testes

Use esta lista para garantir que tudo está funcionando:

### Infraestrutura
- [ ] Containers Docker rodando (briefflow-app, supabase, scraper)
- [ ] Backend Node.js respondendo na porta 5000
- [ ] Scraper Python respondendo na porta 8000
- [ ] Supabase (Kong) respondendo na porta 8000
- [ ] Banco SQLite acessível

### Frontend
- [ ] Login funciona
- [ ] Criar cliente funciona
- [ ] Adicionar fonte funciona
- [ ] Listar conteúdos funciona
- [ ] Gerar brief funciona

### Integração
- [ ] Frontend conecta ao Supabase
- [ ] Frontend conecta ao Backend (via proxy)
- [ ] Backend conecta ao Scraper Python
- [ ] Scraper grava no banco SQLite

---

## 🚀 Próximos Passos

Após confirmar que tudo está funcionando:

1. **Adicionar fontes reais** de conteúdo
2. **Configurar agendamento automático** de scraping
3. **Testar geração de briefs** com diferentes tipos de conteúdo
4. **Implementar melhorias** no scraper (ver README_SCRAPER.md)

---

## 📞 Precisa de Ajuda?

Se encontrar problemas:

1. Execute `./diagnose-system.sh` e salve o output
2. Verifique logs: `docker compose logs --tail 100`
3. Teste individualmente com `test-scraper.py`
4. Documente o erro e solicite ajuda
