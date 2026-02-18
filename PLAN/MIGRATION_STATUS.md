# Status da Migração para Supabase

## Data: 2026-02-10

## Resumo da Implementação

### Fase 1-2: Infraestrutura e Banco de Dados ✅

**Arquivos Criados:**
- ✅ `shared/supabase.ts` - Cliente Supabase configurado (anon e service keys)
- ✅ `server/middleware/auth.ts` - Middleware JWT para validar tokens
- ✅ `client/src/lib/auth.ts` - Funções de auth (signUp, signIn, signOut)
- ✅ `supabase/migrations/001_initial_schema.sql` - Schema completo com user_id
- ✅ `supabase/migrations/002_rls_policies.sql` - RLS policies para multi-tenancy
- ✅ `PLAN/.env.supabase.example` - Template de variáveis de ambiente
- ✅ `PLAN/deploy.sh` - Script de deploy automatizado

**Arquivos Modificados:**
- ✅ `package.json` - Removido Drizzle/SQLite, adicionado @supabase/supabase-js
- ✅ `server/routes.ts` - Reescrito para usar supabaseAdmin ao invés de storage
- ✅ `server/index.ts` - Adicionado authMiddleware, removidos imports de Replit auth

**Frontend Hooks Migrados:**
- ✅ `client/src/hooks/use-clients.ts` - Usa Supabase Client
- ✅ `client/src/hooks/use-sources.ts` - Usa Supabase Client
- ✅ `client/src/hooks/use-briefs.ts` - Usa Supabase Client
- ✅ `client/src/hooks/use-contents.ts` - Usa Supabase Client

### Fase 3: Build ⚠️

**Status:** Build com erros de compilação devido a referências remanescentes de Drizzle

**Problema:** Alguns arquivos ainda importam de `@shared/schema`:
- `client/src/pages/Clients.tsx` - insertClientSchema
- `client/src/pages/ClientDetails.tsx` - insertSourceSchema
- `client/src/contexts/ClientContext.tsx` - type Client

**Solução:** Remover esses imports e ajustar validação (não precisa mais de Zod schemas)

### Fase 4: Deploy 🚀

**Git Status:**
- ✅ Commit criado: "Migrate to Supabase with multi-tenancy (RLS)"
- ✅ Push realizado: https://github.com/Gabriellopes33/brieflow.git

**Próximos Passos Manuais na VPS:**

1. **Clonar/Pull na VPS:**
   ```bash
   cd /opt/brieflow
   git pull origin main
   ```

2. **Rodar Migrations no Supabase:**
   ```bash
   # Entrar no container do PostgreSQL
   docker exec -it supabase_db psql -U postgres -d postgres

   # Rodar migration 001
   \i supabase/migrations/001_initial_schema.sql

   # Rodar migration 002
   \i supabase/migrations/002_rls_policies.sql

   # Verificar
   \dt+  # Listar tabelas
   \dp+ clients  # Verificar RLS na tabela clients
   ```

3. **Configurar Variáveis de Ambiente:**
   ```bash
   cp PLAN/.env.supabase.example .env
   nano .env  # Editar com as credenciais reais
   ```

4. **Instalar Dependências:**
   ```bash
   cd /opt/brieflow
   npm install
   ```

5. **Iniciar Aplicação:**
   ```bash
   npm run dev  # Desenvolvimento
   # ou
   npm run build && npm start  # Produção
   ```

## Testes de Multi-Tenancy

### Teste 1: Isolamento de Usuários

1. Criar conta A no browser (normal)
2. Criar cliente "Cliente do Usuário A"
3. Fazer logout
4. Criar conta B em incognito/outro navegador
5. Verificar que **NÃO** vê "Cliente do Usuário A"

### Teste 2: Verificação no Banco

```sql
-- Verificar políticas RLS
SELECT 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd 
FROM pg_policies 
WHERE schemaname = 'public';

-- Deve mostrar 5 políticas por tabela para cada tabela (clients, sources, contents, briefs)

-- Testar RLS
SELECT * FROM clients; 
-- Com auth.uid() definido, deve retornar 0 para usuários não autenticados
-- Se um usuário está autenticado como 'user-a', só verá clientes onde user_id = 'user-a'
```

### Teste 3: Verificação no Supabase Studio

1. Acessar: https://supa.agenciatouch.com.br
2. Ir em: Table Editor → clients
3. Verificar que:
   - Tabela tem coluna `user_id` do tipo UUID
   - Row Level Security está habilitado (cadeado)
   - As 5 políticas estão ativas

## Arquitetura Final

```
┌─────────────────────────────────────────────────────────────┐
│                    Content-Generator                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Frontend   │  │    Server    │  │   Scraper    │      │
│  │  (React)     │  │   (Express)  │  │   (Python)   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘      │
└─────────┼─────────────────┼─────────────────────────────────┘
          │                 │
          │  Supabase Client│
          └─────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│   SUPABASE SELF-HOSTED    │         NETWORK: touchNet       │
│                           │                                 │
│  ┌───────────┐ ┌──────────┴───────┐ ┌───────────┐          │
│  │  Kong     │ │   PostgREST      │ │   Auth    │          │
│  │ (Proxy)   │ │   (REST API)     │ │ (GoTrue)  │          │
│  └─────┬─────┘ └─────────┬────────┘ └───────────┘          │
│        │                 │                                   │
│        └─────────────────┘                                   │
│                  │                                           │
│        ┌─────────▼──────────┐                                │
│        │   PostgreSQL       │                                │
│        │   (Dados + Auth)   │                                │
│        │   com RLS          │                                │
│        └────────────────────┘                                │
└──────────────────────────────────────────────────────┘
```

## Benefícios da Nova Arquitetura

✅ **Multi-tenancy real** - Cada usuário só vê seus dados (RLS no banco)
✅ **Escalabilidade** - Supabase gerencia conexões e pooling
✅ **Auth nativo** - GoTrust já testado e pronto
✅ **Realtime** - Subscriptions em tempo real disponíveis
✅ **Storage** - S3/MinIO integrado para arquivos
✅ **Backups automáticos** - Supabase faz backups automaticamente
✅ **API REST gerada** - PostgREST expõe tabelas automaticamente

## Riscos e Mitigações

⚠️ **Risco 1:** Build local falhando
- **Causa:** Referências remanescentes de Drizzle
- **Mitigação:** Remover imports de @shared/schema dos arquivos frontend

⚠️ **Risco 2:** Migrações não rodadas automaticamente
- **Causa:** Docker não acessível localmente
- **Mitigação:** Executar manualmente na VPS

⚠️ **Risco 3:** Variáveis de ambiente em .env.example
- **Causa:** Credenciais expostas
- **Mitigação:** NUNCA commitar .env com credenciais reais

## Conclusão

**Status:** 🟡 Em Progresso (80% concluído)

**O que foi feito:**
- ✅ Arquitetura definida (Supabase + RLS)
- ✅ Schema do banco criado com user_id
- ✅ RLS policies implementadas
- ✅ Backend migrado para Supabase
- ✅ Frontend hooks migrados
- ✅ Auth functions criadas
- ✅ Commit e push para GitHub

**O que falta:**
- ⏳ Ajustar erros de compilação no frontend
- ⏳ Rodar migrations manualmente na VPS
- ⏳ Testar multi-tenancy
- ⏳ Deletar arquivos obsoletos

**Estimativa:** 2-3 horas para conclusão total
