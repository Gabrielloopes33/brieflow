# 📁 Estrutura do Projeto BriefFlow

```
briefflow/
├── 📁 apps/
│   ├── 📁 web/                           # Next.js 14 (Frontend)
│   │   ├── 📁 app/                       # App Router
│   │   │   ├── layout.tsx                # Layout raiz
│   │   │   ├── globals.css               # Estilos globais (Design System)
│   │   │   └── page.tsx                  # Página inicial (dashboard)
│   │   ├── 📁 components/                # Componentes React
│   │   │   ├── ui/                       # Componentes Shadcn/UI
│   │   │   ├── layout/                   # Layout (Header, Sidebar)
│   │   │   └── dashboard/                # Dashboard components
│   │   ├── 📁 lib/                       # Utilitários e configurações
│   │   ├── 📁 public/                    # Assets estáticos
│   │   ├── 📁 providers.tsx              # Context providers (Auth, Theme)
│   │   ├── next.config.js               # Configuração Next.js
│   │   ├── tailwind.config.js            # Configuração Tailwind
│   │   └── package.json                  # Dependências frontend
│   │
│   └── 📁 desktop/                       # Electron App (a criar)
│       ├── 📁 electron/                  # Código Electron
│       │   ├── main.js                   # Entry point
│       │   └── preload.js                # Context bridge
│       ├── 📁 package.json
│       └── 📁 electron-builder.yml       # Configuração build
│
├── 📁 backend/                           # FastAPI (Backend)
│   ├── 📁 app/                           # Aplicação FastAPI
│   │   ├── 📁 api/                       # API routes
│   │   │   └── 📁 v1/
│   │   │       ├── 📁 endpoints/
│   │   │       │   ├── clients.py        # /clients
│   │   │       │   ├── sources.py        # /sources
│   │   │       │   ├── contents.py       # /contents
│   │   │       │   └── briefs.py         # /briefs
│   │   │       └── api.py                # Roteamento v1
│   │   ├── 📁 core/                      # Core settings
│   │   │   ├── config.py                 # Configurações
│   │   │   └── database.py               # Database connection (SQLAlchemy)
│   │   ├── 📁 models/                    # Pydantic schemas
│   │   ├── 📁 api/                       # API routes de exemplo
│   │   ├── 📁 routers/                   # API routers
│   │   └── main.py                      # FastAPI app entry point
│   ├── 📁 requirements.txt               # Dependências Python
│   ├── 📁 .env.example                  # Exemplo de variáveis de ambiente
│   └── 📁 README.md                      # Documentação backend
│
├── 📁 workers/                           # Scripts Python (Scraping + IA)
│   ├── 📁 scraper/                       # Scrapers Scrapy
│   │   ├── 📁 spiders/
│   │   │   └── blog_spider.py            # Scraper de blogs
│   │   ├── 📁 parsers/                  # Parsers de HTML
│   │   ├── 📁 utils/                     # Utilitários
│   │   └── run.py                        # Entry point do scraper
│   │
│   ├── 📁 analyzer/                      # Módulo Claude API
│   │   ├── analyzer.py                   # Análise de conteúdo
│   │   ├── brief_generator.py            # Geração de pautas
│   │   └── prompt_templates/             # Prompts
│   │
│   ├── 📁 n8n/                           # Workflows do N8N
│   │   └── 📁 workflows/                 # Arquivos JSON dos workflows
│   │
│   └── 📁 requirements.txt               # Dependências workers
│
├── 📁 packages/                          # Packages compartilhados
│   └── 📁 shared-types/                  # TypeScript types
│       ├── 📁 index.ts                   # Types (Client, Source, Content, Brief)
│       └── 📁 package.json
│
├── 📁 docs/                              # Documentação
│   ├── 01-visao-geral.md                 # Conceito e escopo
│   ├── 02-arquitetura.md                 # Stack e fluxos
│   ├── 03-api-reference.md               # API endpoints
│   ├── 04-database-schema.md             # Supabase schema
│   ├── 05-frontend-guide.md              # Guia frontend
│   ├── 06-ai-prompts.md                  # Prompts de IA
│   ├── 07-n8n-workflows.md               # Workflows de automação
│   ├── 08-setup-dev.md                   # Setup de desenvolvimento
│   └── 📁 references/                    # Referências visuais
│
├── 📁 .gitignore                         # Ignorar arquivos irrelevantes
├── 📁 .env.example                       # Exemplo de variáveis de ambiente
├── 📁 setup.ps1                          # Script de setup automático
├── 📁 package.json                       # Configuração monorepo
├── 📁 README.md                          # README principal
└── 📁 ROADMAP.md                         # Roadmap detalhado (6-8 semanas)
```

## 🎯 Camadas da Arquitetura

```
┌─────────────────────────────────────────┐
│   Camada de Interface (Desktop)         │
│   Electron + Next.js (App nativo)       │
└──────────────────┬──────────────────────┘
                   │ HTTP / IPC
┌──────────────────▼──────────────────────┐
│   Camada de API (Backend)               │
│   FastAPI + Pydantic                    │
└──────────────────┬──────────────────────┘
                   │ SQL / Supabase
┌──────────────────▼──────────────────────┐
│   Camada de Dados (Database)            │
│   Supabase (PostgreSQL)                 │
└──────────────────┬──────────────────────┘
                   │ Jobs
┌──────────────────▼──────────────────────┐
│   Camada de Automação (Workers)         │
│   Scrapy + Playwright + Claude + N8N    │
└─────────────────────────────────────────┘
```

## 🚀 Inicialização

```bash
# 1. Instalar dependências principais
npm install

# 2. Iniciar frontend (Next.js)
npm run dev:web

# 3. Iniciar backend (FastAPI)
npm run dev:api

# 4. Iniciar workers (Scrapy + Claude)
# (N8N deve ser iniciado manualmente)
```

## 📝 Próximos Passos

- [ ] Criar estrutura de pastas dentro de `apps/desktop/`
- [ ] Configurar Electron para empacotar Next.js
- [ ] Implementar endpoints da API
- [ ] Criar modelos SQLAlchemy
- [ ] Desenvolver componentes UI
- [ ] Criar workflows do N8N
- [ ] Testar scraping com 1 blog real
- [ ] Testar análise com Claude API
- [ ] Criar dashboard

---

**Versão:** 1.0.0 | **Data:** Fevereiro 2026