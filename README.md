# BriefFlow - Content Generator

 Sistema de geração de conteúdo com fontes reais usando React + Express + SQLite + Claude API

## 🚀 Status Atual

**Frontend:** ✅ Completo - Todas as páginas implementadas  
**Backend:** ✅ Funcional - API REST funcionando  
**Database:** ✅ SQLite - Schema configurado  
**Integrações:** 🔄 Pendente - Claude API e Scraper

## 📋 Funcionalidades Implementadas

### ✅ Frontend (React + Vite)
- **Dashboard** - Visão geral das operações
- **Clientes** - CRUD completo de clientes
- **Fontes (Sources)** - Gerenciamento de fontes de conteúdo (RSS, Blogs, News)
- **Conteúdos (Contents)** - Visualização de conteúdo coletado com filtros
- **Pautas (Briefs)** - Geração e gestão de briefs de conteúdo
- **Autenticação** - Sistema de login/logout
- **UI/UX** - Design moderno com Shadcn/UI e Tailwind CSS

### ✅ Backend (Express + TypeScript)
- **API REST** - Endpoints para todas as entidades
- **Database** - SQLite com Drizzle ORM
- **Middleware** - Autenticação e logging
- **Health Check** - Monitoramento do sistema

## 🛠 Stack Tecnológico

- **Frontend:** React 18 + TypeScript + Vite
- **UI:** Tailwind CSS + Shadcn/UI
- **Backend:** Express + TypeScript
- **Database:** SQLite + Drizzle ORM
- **HTTP Client:** TanStack Query
- **Routing:** Wouter
- **Forms:** React Hook Form + Zod

## 🚀 Quick Start

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Ambiente
```bash
# Editar o arquivo .env com sua API key do Claude
notepad .env
```

### 3. Iniciar Servidor
```bash
# Development
set NODE_ENV=development && set PORT=5001 && npx tsx server/simple-server.ts

# Ou usando o script
npm run dev
```

### 4. Acessar Aplicação
- **Frontend:** http://localhost:5001
- **API:** http://localhost:5001/api
- **Health Check:** http://localhost:5001/api/health

## 📁 Estrutura do Projeto

```
Content-Generator/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes UI
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Páginas da aplicação
│   │   └── lib/            # Utilitários
│   └── public/             # Assets estáticos
├── server/                 # Backend Express
│   ├── routes.ts           # Definição de rotas
│   ├── db.ts              # Configuração do DB
│   └── simple-server.ts   # Servidor principal
├── shared/                 # Código compartilhado
│   ├── schema.ts          # Schema do DB
│   └── routes.ts          # Tipos das rotas
├── data/                   # Arquivos de dados
│   └── briefflow.db       # Database SQLite
└── dist/                   # Build de produção
```

## 🔌 API Endpoints

### Health Check
```
GET /api/health
```

### Clients
```
GET    /api/clients
POST   /api/clients
GET    /api/clients/:id
PUT    /api/clients/:id
DELETE /api/clients/:id
```

### Sources
```
GET    /api/clients/:id/sources
POST   /api/clients/:id/sources
PUT    /api/sources/:id
DELETE /api/sources/:id
```

### Contents
```
GET /api/clients/:id/contents
```

### Briefs
```
GET    /api/clients/:id/briefs
POST   /api/clients/:id/briefs
GET    /api/briefs/:id
PUT    /api/briefs/:id
DELETE /api/briefs/:id
```

## 🗄️ Database Schema

### Tables
- **clients** - Informações dos clientes
- **sources** - Fontes de conteúdo (RSS, Blogs, etc)
- **contents** - Conteúdo coletado das fontes
- **briefs** - Pautas geradas pela IA
- **analysisConfigs** - Configurações de análise

## 📝 Próximos Passos

### 🔄 Em Progresso
- [x] Configurar API key do Claude
- [x] Implementar todas as páginas do frontend
- [x] Configurar build para produção

### 📋 Pendente
- [ ] Implementar scraper Python para coleta de conteúdo
- [ ] Integrar Claude API para geração de pautas
- [ ] Configurar agendamento automático de coleta
- [ ] Implementar análise de conteúdo com IA
- [ ] Adicionar testes unitários
- [ ] Configurar deploy em produção

## 🤖 Integrações Futuras

### Claude API
```javascript
// Exemplo de integração planejada
import anthropic from '@anthropic-ai/sdk';

const client = new anthropic.Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const response = await client.messages.create({
  model: "claude-3-sonnet-20240229",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Generate content brief..." }],
});
```

### Python Scraper
```python
# Exemplo de scraper planejado
import scrapy
class ContentSpider(scrapy.Spider):
    name = 'content_spider'
    
    def parse(self, response):
        # Extrair título, conteúdo, data, etc.
        # Salvar no SQLite
        pass
```

## 📊 Monitoramento

### Logs
- Desenvolvimento: Console output
- Produção: Implementar sistema de logs

### Health Checks
- API: `/api/health`
- Database: Verificação de conexão
- Serviços externos: Status da Claude API

## 🚀 Deploy

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Docker (Futuro)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 5001
CMD ["node", "dist/index.cjs"]
```

## 📄 Licença

MIT License

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

**Status:** ✅ Frontend Completo | **Versão:** 1.0.0 | **Próximo:** Implementar Claude API