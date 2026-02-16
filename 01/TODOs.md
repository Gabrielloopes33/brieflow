# 📋 TODOs - Implementação: Frontend Netlify + Backend VPS

## 🎯 Objetivo
Migrar o BriefFlow para arquitetura híbrida:
- **Frontend**: Netlify (`brieflow.agenciatouch.com.br`)
- **Backend API**: VPS porta 8080 (`brieflow-api.agenciatouch.com.br:8080`)
- **Workers**: Container Docker separado na VPS
- **Database**: Supabase (existente na mesma VPS)

---

## ✅ TODOs - Fase 1: Infraestrutura e Configuração

### 1.1 Arquivos de Configuração Netlify
- [x] Criar `Content-Generator/netlify.toml` (SPA redirect config)
- [x] Criar `Content-Generator/.env.production` (variáveis para build)

### 1.2 Docker e Deploy Backend
- [x] Criar `Content-Generator/Dockerfile.api` (Dockerfile otimizado API)
- [x] Criar `Content-Generator/docker-compose.api.yml` (só API na porta 8080)
- [x] Criar `Content-Generator/docker-compose.workers.yml` (workers separados)

### 1.3 Workers Python (Estrutura Base)
- [x] Criar `Content-Generator/scraper/Dockerfile`
- [x] Criar `Content-Generator/scraper/entrypoint.sh`
- [x] Criar `Content-Generator/scraper/requirements.txt` (se não existir - já existe)

### 1.4 Configuração VPS
- [ ] Adicionar `CORS_ORIGIN` no `.env` da VPS
- [ ] Configurar Traefik label para `brieflow-api.agenciatouch.com.br`
- [ ] Verificar firewall (liberar porta 8080 se necessário)

### 1.5 Supabase Kong
- [ ] Editar `/root/supabase/docker/volumes/api/kong.yml`
- [ ] Adicionar `https://brieflow.agenciatouch.com.br` nas origins CORS
- [ ] Restart container Kong

---

## ✅ TODOs - Fase 2: Código Backend (CORS e API)

### 2.1 Server Index
- [x] Modificar `Content-Generator/server/index.ts`
  - [x] Adicionar import `cors`
  - [x] Configurar `corsOptions` com origin dinâmico
  - [x] Aplicar middleware CORS antes das rotas
  - [x] Verificar se authMiddleware está aplicado corretamente (não em todas as rotas) - AGORA SÓ EM ROTAS PROTEGIDAS

### 2.2 Verificação Supabase
- [ ] Confirmar `Content-Generator/shared/supabase.ts` está com detecção browser/Node.js
- [ ] Adicionar logs de debug (opcional)

---

## ✅ TODOs - Fase 3: Frontend (Preparação para Netlify)

### 3.1 Hooks de API
- [ ] Criar `Content-Generator/client/src/hooks/use-api.ts`
  - [ ] Configurar `API_URL` usando `import.meta.env.VITE_API_URL`
  - [ ] Criar função `apiFetch` genérica
  - [ ] Criar hooks específicos (useApiClients, etc.)

### 3.2 Integração Supabase
- [ ] Verificar se todos os hooks usam `@shared/supabase`
- [ ] Testar se as variáveis `VITE_` estão sendo lidas corretamente

---

## ✅ TODOs - Fase 4: Deploy e Testes

### 4.1 Build Local
- [ ] Rodar `npm run build` na VPS
- [ ] Verificar se `dist/` foi gerado corretamente

### 4.2 Deploy Backend
- [ ] Subir API: `docker compose -f docker-compose.api.yml up -d`
- [ ] Verificar logs: `docker logs -f brieflow-api`
- [ ] Testar health endpoint: `curl localhost:8080/api/health`

### 4.3 Configuração DNS
- [ ] Verificar se `brieflow-api.agenciatouch.com.br` aponta para VPS
- [ ] Verificar se `brieflow.agenciatouch.com.br` está configurado no Netlify

### 4.4 Deploy Netlify
- [ ] Commit e push código para GitHub
- [ ] Conectar repositório no Netlify dashboard
- [ ] Configurar variáveis de ambiente no Netlify:
  - `VITE_API_URL=https://brieflow-api.agenciatouch.com.br:8080`
  - `VITE_SUPABASE_URL=https://supa.agenciatouch.com.br`
  - `VITE_SUPABASE_ANON_KEY=...`
- [ ] Deploy!

### 4.5 Deploy Workers
- [ ] Subir workers: `docker compose -f docker-compose.workers.yml up -d`
- [ ] Verificar logs: `docker logs -f brieflow-scraper`

---

## ✅ TODOs - Fase 5: Testes Pós-Deploy

### 5.1 Testes Básicos
- [ ] Acessar `https://brieflow.agenciatouch.com.br` (deve carregar)
- [ ] Verificar console do navegador (sem erros 401/403)
- [ ] Testar login/cadastro no Supabase

### 5.2 Testes de Integração
- [ ] Criar cliente na aplicação
- [ ] Verificar se aparece no Supabase Studio
- [ ] Verificar se RLS está funcionando (isolamento de dados)

### 5.3 Testes CORS
- [ ] Testar chamada API do frontend (Network tab)
- [ ] Verificar headers CORS nas respostas

### 5.4 Testes Workers
- [ ] Verificar se workers estão rodando: `docker ps`
- [ ] Verificar logs de execução: `docker logs brieflow-scraper`

---

## 📝 Checklist de Validação Final

- [ ] Frontend no Netlify acessível via HTTPS
- [ ] Backend na VPS porta 8080 respondendo
- [ ] CORS configurado corretamente (sem erros no browser)
- [ ] Login/Signup funcionando com Supabase
- [ ] Dados isolados por usuário (RLS)
- [ ] Workers rodando em container separado
- [ ] Documentação atualizada (este TODO)

---

## ⚠️ Pontos de Atenção

1. **Porta 8080**: Certifique-se que não está em uso por outro serviço
2. **Firewall**: Pode precisar liberar porta 8080 no UFW/iptables
3. **SSL**: Traefik deve gerenciar certificado para `brieflow-api.agenciatouch.com.br`
4. **Workers**: Estrutura base criada, implementação real do scraper vem depois

---

## 🚀 Status da Implementação

**Última atualização**: 2026-02-11 21:00 UTC

**Progresso**: [█████░░░░] 40% completado

**Concluído:**
- ✅ Fase 1.1: Arquivos de configuração Netlify (netlify.toml, .env.production)
- ✅ Fase 1.2: Dockerfiles e compose (Dockerfile.api, docker-compose.api.yml, docker-compose.workers.yml)
- ✅ Fase 1.3: Estrutura base workers (Dockerfile, entrypoint.sh, requirements.txt)
- ✅ Fase 2.1: Backend configurado (CORS adicionado, authMiddleware ajustado para rotas específicas)

**Em andamento:**
- ⏳ Fase 3: Frontend preparation

**Pendente:**
- ⏳ Configuração VPS (CORS_ORIGIN, Traefik, firewall)
- ⏳ Supabase Kong (adicionar origins)
- ⏳ Fase 4: Deploy
- ⏳ Fase 5: Testes

---

## 📊 Próximos Passos

1. Começar Fase 1 - Arquivos de configuração
2. Fase 2 - Modificar código backend
3. Fase 3 - Preparar frontend
4. Fase 4 - Deploy
5. Fase 5 - Testes
