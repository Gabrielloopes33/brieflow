# Deploy Manual - BriefFlow com Supabase

## Situação Atual
- ✅ Todos os arquivos criados e modificados conforme SPEC
- ⚠️ Build com erro de compilação (dependências de Drizzle ainda referenciadas)
- ⏭️ Migrations criadas mas não rodadas

## Próximos Passos (Execute manualmente na VPS)

### 1. Copiar arquivos para VPS
```bash
# Na sua máquina local:
cd Content-Generator
git add .
git commit -m "Migrate to Supabase with multi-tenancy"
git push

# Na VPS:
cd /opt/brieflow
git pull origin main
```

### 2. Rodar Migrations no Supabase

```bash
# Entrar no container do PostgreSQL
docker exec -it supabase_db psql -U postgres -d postgres

# Rodar migrations
\i supabase/migrations/001_initial_schema.sql
\i supabase/migrations/002_rls_policies.sql

# Sair do psql
\q

# Verificar RLS ativado
\dt+ clients  -- Deve mostrar: clients (Row Security: Enabled)
\dp+ clients  -- Deve mostrar as políticas
```

### 3. Instalar Dependências
```bash
cd /opt/brieflow
npm install
```

### 4. Configurar Variáveis de Ambiente

Criar `.env` com:
```bash
cp .env.supabase.example .env
nano .env  # Ou vim
```

Configurar:
```bash
SUPABASE_URL=https://supa.agenciatouch.com.br
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgres://postgres:05289b91561c68fa5ee9a90a7cbc42e3@db:5432/postgres
NODE_ENV=production
PORT=5000
```

### 5. Iniciar Aplicação

```bash
# Opção A: Com Vite (Desenvolvimento)
npm run dev

# Opção B: Com Build (Produção)
npm run build
npm run start  # Isso roda server/index.ts com PORT=5000
```

### 6. Testar Multi-Tenancy

**Teste 1: Criar usuários diferentes**
```bash
# No browser (incognito):
# 1. Criar conta user1@example.com
# 2. Criar um cliente "Cliente do User 1"
# 3. Fazer logout

# 4. Criar conta user2@example.com (outro navegador/incognito)
# 5. Verificar que NÃO vê o "Cliente do User 1"
```

**Teste 2: Verificar no Supabase Studio**
1. Acessar: https://supa.agenciatouch.com.br
2. Login como admin
3. Vá em: Table Editor → clients
4. Verifique:
   - Tabela tem coluna `user_id`?
   - RLS está habilitado (cadeado)?
   - Os registros têm `user_id` preenchido?

**Teste 3: Verificar RLS funcionando**
```sql
-- No Supabase Studio → SQL Editor:

-- Verificar políticas
SELECT 
  schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public';

-- Deve mostrar políticas para cada tabela
-- Testar com user_id diferente:
SELECT * FROM clients WHERE user_id = 'user-id-fake'; -- Deve retornar 0 linhas
```

### 7. Ajustar Portainer (se usando)

No painel do Portainer:
1. Acesse: http://185.216.203.73:9000
2. Vá em: Stacks → briefflow-app
3. Clique em "Update stack"
4. Garanta que as variáveis de ambiente estão configuradas:
   - SUPABASE_URL=https://supa.agenciatouch.com.br
   - SUPABASE_ANON_KEY=seu_anon_key
   - SUPABASE_SERVICE_KEY=seu_service_key
5. Clique em "Deploy the stack"

## Arquivos Modificados (Resumo)

### Backend
- ✅ `server/routes.ts` - Substituído storage por supabaseAdmin
- ✅ `server/index.ts` - Adicionado authMiddleware, removidos imports de Replit auth

### Frontend Hooks
- ✅ `client/src/hooks/use-clients.ts` - Migrado para Supabase
- ✅ `client/src/hooks/use-sources.ts` - Migrado para Supabase
- ✅ `client/src/hooks/use-briefs.ts` - Migrado para Supabase
- ✅ `client/src/hooks/use-contents.ts` - Migrado para Supabase

### Frontend Auth
- ✅ `client/src/lib/auth.ts` - Novo arquivo com Supabase Auth

### Novos Arquivos
- ✅ `shared/supabase.ts` - Cliente Supabase configurado
- ✅ `server/middleware/auth.ts` - Middleware para verificar JWT
- ✅ `supabase/migrations/001_initial_schema.sql` - Schema inicial
- ✅ `supabase/migrations/002_rls_policies.sql` - RLS policies
- ✅ `PLAN/.env.supabase.example` - Template de config

## Problemas Conhecidos

### Build Errors
**Problema:** Alguns arquivos ainda importam `@shared/schema` e dependências Drizzle

**Solução:** Remover esses imports ou garantir que os arquivos não existem mais nos lugares onde são importados

**Arquivos com problemas:**
- `client/src/pages/Clients.tsx` - import insertClientSchema
- `client/src/pages/ClientDetails.tsx` - import insertSourceSchema
- `client/src/contexts/ClientContext.tsx` - import Client type
- `server/swagger.config.ts` - import from schema (pode ser removido ou atualizado)

## Arquivos Para Deletar Após Deploy Funcionar

```bash
# Remover arquivos obsoletos
rm -rf server/storage.ts
rm -rf server/db.ts
rm -rf server/replit_integrations/
rm -rf shared/schema.ts
rm -rf server/production-server.ts
rm -rf server/simple-server.ts

# Remover migrations do Drizzle (não mais necessárias)
rm -rf drizzle.config.ts
rm -rf drizzle/
```

## Comandos Úteis para Debug

```bash
# Ver logs do Supabase
docker logs -f supabase_db

# Ver logs do app
docker logs -f briefflow-app

# Entrar no container do app
docker exec -it briefflow-app sh

# Verificar conexão com Supabase
curl -I https://supa.agenciatouch.com.br
```

## Sucesso Criteria

Você saberá que a migração foi bem-sucedida quando:

1. ✅ Build funciona sem erros
2. ✅ App roda na VPS
3. ✅ Login funciona (criar conta, fazer login, logout)
4. ✅ Criar cliente preenche `user_id` no banco
5. ✅ Usuários não veem clientes de outros usuários (RLS funcionando)
6. ✅ Supabase Studio mostra todas as tabelas com user_id e RLS ativo

## Suporte

Se tiver problemas:
1. Verifique as migrations rodaram: `\dt+ clients` no Supabase Studio
2. Verifique se .env tem as credenciais corretas
3. Verifique se Supabase está acessível: `curl -I https://supa.agenciatouch.com.br`
4. Verifique logs do container: `docker logs briefflow-app`
