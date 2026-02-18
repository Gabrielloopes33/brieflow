# BriefFlow Monorepo

Sistema de geração de conteúdo com fontes reais usando Next.js 14 + Electron + FastAPI + Supabase + Claude API + N8N

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Iniciar todos os serviços
npm run dev

# Comandos individuais
npm run dev:web        # Next.js (Frontend)
npm run dev:api        # FastAPI (Backend)
npm run dev:n8n        # N8N Workflows

# Build
npm run build
```

## 📁 Estrutura

```
briefflow/
├── apps/
│   ├── web/           # Next.js 14 (App Router + Shadcn/UI)
│   └── desktop/       # Electron app
├── backend/           # FastAPI + Pydantic
├── workers/           # Python scrapers + Claude analyzer
├── packages/          # Shared types
└── docs/              # Documentação
```

## 🛠 Stack

- **Frontend:** Next.js 14 + Shadcn/UI + Tailwind CSS
- **Desktop:** Electron 28+
- **Backend:** FastAPI + Pydantic + Supabase
- **Scraping:** Scrapy + Playwright
- **IA:** Claude API (Anthropic)
- **Automação:** N8N
- **Database:** Supabase (PostgreSQL)

## 📚 Documentação

- Visão Geral: `docs/01-visao-geral.md`
- Arquitetura: `docs/02-arquitetura.md`
- API Reference: `docs/03-api-reference.md`
- Database Schema: `docs/04-database-schema.md`
- Frontend Guide: `docs/05-frontend-guide.md`
- AI Prompts: `docs/06-ai-prompts.md`
- N8N Workflows: `docs/07-n8n-workflows.md`
- Setup Dev: `docs/08-setup-dev.md`

## 🎯 Roadmap

- [x] Documentação e planejamento
- [ ] Fase 1: Fundação (Semanas 1-2)
- [ ] Fase 2: Core de Dados (Semanas 2-3)
- [ ] Fase 3: Inteligência (Semanas 3-5)
- [ ] Fase 4: Automação (Semanas 5-6)
- [ ] Fase 5: Desktop (Semanas 6-7)
- [ ] Fase 6: Polish (Semanas 7-8)

## 👥 Contributing

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

MIT License - Veja o arquivo LICENSE para detalhes

---

**Versão:** 1.0.0 | **Data:** Fevereiro 2026