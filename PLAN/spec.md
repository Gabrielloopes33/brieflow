# Spec: Migração para Supabase com Multi-Tenancy via RLS

## 1. Arquivos a Criar

### `shared/supabase.ts`
**Propósito**: Cliente Supabase configurado e compartilhado entre frontend e backend

**Exports**:
```typescript
export const supabase: SupabaseClient;
export const supabaseAdmin: SupabaseClient;
```

**Implementação**:
```typescript
import { createClient } from '@supabase/supabase-js';

// URL e chaves do ambiente
const supabaseUrl = process.env.SUPABASE_URL || 'https://supa.agenciatouch.com.br';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_KEY';

// Cliente com anon key (usado no frontend - RLS respeita user)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente com service role (usado no backend - ignora RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
```

---

### `supabase/migrations/001_initial_schema.sql`
**Propósito**: Schema inicial do banco de dados

**SQL**:
```sql
-- Extension para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela: clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  niche TEXT,
  target_audience TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: sources
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT DEFAULT 'blog',
  is_active BOOLEAN DEFAULT true,
  last_scraped_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: contents
CREATE TABLE contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  content_text TEXT,
  summary TEXT,
  topics JSONB,
  published_at TIMESTAMP WITH TIME ZONE,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_analyzed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: briefs
CREATE TABLE briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  content_ids JSONB,
  title TEXT NOT NULL,
  angle TEXT,
  key_points JSONB,
  content_type TEXT,
  suggested_copy TEXT,
  status TEXT DEFAULT 'draft',
  generated_by TEXT DEFAULT 'claude',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: analysis_configs
CREATE TABLE analysis_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  min_content_length INTEGER DEFAULT 500,
  topics_of_interest JSONB,
  exclude_patterns JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_sources_user_id ON sources(user_id);
CREATE INDEX idx_sources_client_id ON sources(client_id);
CREATE INDEX idx_contents_user_id ON contents(user_id);
CREATE INDEX idx_contents_client_id ON contents(client_id);
CREATE INDEX idx_briefs_user_id ON briefs(user_id);
CREATE INDEX idx_briefs_client_id ON briefs(client_id);
```

---

### `supabase/migrations/002_rls_policies.sql`
**Propósito**: Implementar Row Level Security para multi-tenancy

**SQL**:
```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_configs ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: Usuários autenticados só veem seus próprios dados

CREATE POLICY "Users can insert own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select own clients" ON clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE USING (auth.uid() = user_id);

-- Sources
CREATE POLICY "Users can insert own sources" ON sources
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select own sources" ON sources
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own sources" ON sources
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sources" ON sources
  FOR DELETE USING (auth.uid() = user_id);

-- Contents
CREATE POLICY "Users can insert own contents" ON contents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select own contents" ON contents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own contents" ON contents
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own contents" ON contents
  FOR DELETE USING (auth.uid() = user_id);

-- Briefs
CREATE POLICY "Users can insert own briefs" ON briefs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select own briefs" ON briefs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own briefs" ON briefs
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own briefs" ON briefs
  FOR DELETE USING (auth.uid() = user_id);

-- Analysis configs
CREATE POLICY "Users can insert own configs" ON analysis_configs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select own configs" ON analysis_configs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own configs" ON analysis_configs
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own configs" ON analysis_configs
  FOR DELETE USING (auth.uid() = user_id);
```

---

### `client/src/lib/auth.ts`
**Propósito**: Funções de autenticação usando Supabase Auth

**Exports**:
```typescript
export async function signUp(email: string, password: string, fullName: string);
export async function signIn(email: string, password: string);
export async function signOut();
export async function getCurrentUser();
export function onAuthStateChange(callback: (user: User | null) => void);
```

**Implementação**:
```typescript
import { supabase } from '@shared/supabase';
import type { User } from '@supabase/supabase-js';

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  });

  if (error) throw error;
  return data.user;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data.user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}
```

---

### `server/middleware/auth.ts`
**Propósito**: Middleware para verificar JWT do Supabase no backend

**Export**:
```typescript
export const authMiddleware: RequestHandler;
```

**Implementação**:
```typescript
import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Extrair token do header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Missing authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verificar token com Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Adicionar usuário ao request
    req.user = user;
    req.userId = user.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
}
```

---

### `.env.supabase.example`
**Propósito**: Template de variáveis de ambiente

```bash
# Supabase Configuration
SUPABASE_URL=https://supa.agenciatouch.com.br
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here

# Database (para migrations)
DATABASE_URL=postgres://postgres:05289b91561c68fa5ee9a90a7cbc42e3@db:5432/postgres

# Server
NODE_ENV=production
PORT=5000

# Anthropic (opcional)
# ANTHROPIC_API_KEY=sk-ant-...
```

---

## 2. Arquivos a Modificar

### `package.json`
**Alteração**: Adicionar e remover dependências

**Adicionar**:
```json
"@supabase/supabase-js": "^2.39.0"
```

**Remover**:
```json
"better-sqlite3": "^12.6.2",
"drizzle-orm": "^0.39.3",
"drizzle-zod": "^0.7.0",
"drizzle-kit": "^0.31.8"
```

**Modificar scripts**:
```json
"scripts": {
  "dev": "NODE_ENV=development tsx server/index.ts",
  "start": "NODE_ENV=production tsx server/index.ts",
  "migrate": "psql $DATABASE_URL -f supabase/migrations/001_initial_schema.sql",
  "migrate:rls": "psql $DATABASE_URL -f supabase/migrations/002_rls_policies.sql"
}
```

---

### `server/index.ts`
**Alteração**: Remover storage import e auth Replit

**Remover**:
```typescript
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
```

**Modificar**:
```typescript
// Antes:
// await setupAuth(app);
// registerAuthRoutes(app);
// await registerRoutes(httpServer, app);

// Depois:
import { registerRoutes } from "./routes";
await registerRoutes(httpServer, app);
```

---

### `server/routes.ts`
**Alteração**: Substituir todas as chamadas storage por supabase

**Substituir pattern**:
```typescript
// Antes:
app.get("/api/clients", async (req, res) => {
  const clients = await storage.getClients();
  res.json(clients);
});

// Depois:
app.get("/api/clients", authMiddleware, async (req, res) => {
  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ message: error.message });
  res.json(clients || []);
});
```

**Para todas as rotas**:
- Adicionar authMiddleware a todas as rotas /api/* (exceto /api/health)
- Substituir storage methods por supabase queries
- Remover validações Zod (Supabase já valida tipos)
- Mantém estrutura de resposta JSON igual

---

### `client/src/hooks/use-clients.ts`
**Alteração**: Usar Supabase Client em vez de fetch manual

**Substituir completamente**:
```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@shared/supabase";
import { useToast } from "./use-toast";

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { name: string; description?: string; niche?: string; targetAudience?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          name: data.name,
          description: data.description,
          niche: data.niche,
          target_audience: data.targetAudience,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: "Success", description: "Client created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

// Remover useClient (não necessário com Supabase)
```

---

### `client/src/hooks/use-sources.ts`
**Alteração**: Similar ao use-clients, usar Supabase

**Substituir pattern**:
```typescript
export function useSources(clientId: string) {
  return useQuery({
    queryKey: ['sources', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!clientId,
  });
}

export function useCreateSource() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { clientId: string; name: string; url: string; type?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('sources')
        .insert({
          user_id: user.id,
          client_id: data.clientId,
          name: data.name,
          url: data.url,
          type: data.type || 'blog',
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sources', variables.clientId] });
      toast({ title: "Success", description: "Source created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteSource() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (sourceId: string) => {
      const { error } = await supabase
        .from('sources')
        .delete()
        .eq('id', sourceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      toast({ title: "Success", description: "Source deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
```

---

### `client/src/hooks/use-briefs.ts`
**Alteração**: Migrar para Supabase Client

**Substituir pattern**:
```typescript
export function useBriefs(clientId: string) {
  return useQuery({
    queryKey: ['briefs', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('briefs')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!clientId,
  });
}

export function useCreateBrief() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { clientId: string; title: string; angle?: string; keyPoints?: string[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('briefs')
        .insert({
          user_id: user.id,
          client_id: data.clientId,
          title: data.title,
          angle: data.angle,
          key_points: data.keyPoints,
          content_type: 'article',
          status: 'draft',
          generated_by: 'manual',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['briefs', variables.clientId] });
      toast({ title: "Success", description: "Brief created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
```

---

### `client/src/hooks/use-contents.ts`
**Alteração**: Migrar para Supabase Client

**Substituir pattern**:
```typescript
export function useContents(clientId: string) {
  return useQuery({
    queryKey: ['contents', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contents')
        .select('*')
        .eq('client_id', clientId)
        .order('scraped_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!clientId,
  });
}
```

---

### `client/src/lib/queryClient.ts`
**Alteração**: Adicionar Supabase Auth Provider

**Adicionar**:
```typescript
import { supabase } from '@shared/supabase';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// No componente principal (App.tsx ou similar):
// <QueryClientProvider client={queryClient}>
//   {supabase.auth.onAuthStateChange((event, session) => {
//     // Invalidar queries quando auth mudar
//     queryClient.invalidateQueries();
//   })}
//   <YourApp />
// </QueryClientProvider>
```

---

## 3. Pontos de Integração

### Auth Flow
1. **Frontend**: Usa `client/src/lib/auth.ts` (signIn/signOut)
2. **Backend**: Usa `server/middleware/auth.ts` (verifica JWT)
3. **RLS**: Banco filtra automaticamente por `auth.uid()`

### Data Flow
```
Frontend Hook (useClients)
    ↓
Supabase Client (shared/supabase.ts)
    ↓ (HTTP + JWT)
Supabase API (PostgREST)
    ↓
PostgreSQL com RLS (filtra por auth.uid())
```

### Remover Dependências
- Deletar pasta `server/replit_integrations/auth/`
- Deletar `server/storage.ts`
- Deletar `server/db.ts`
- Deletar `shared/schema.ts`

## 4. Ordem de Implementação

### Fase 1: Infraestrutura (SEM QUEBRAR APP)
1. Criar `.env.supabase.example` - config template
2. Criar `shared/supabase.ts` - cliente compartilhado
3. Modificar `package.json` - adicionar/remover dependências
4. Instalar novas dependências: `npm install`

### Fase 2: Banco de Dados
5. Criar `supabase/migrations/001_initial_schema.sql`
6. Criar `supabase/migrations/002_rls_policies.sql`
7. Rodar migrations no Supabase:
   ```bash
   npm run migrate
   npm run migrate:rls
   ```

### Fase 3: Auth
8. Criar `client/src/lib/auth.ts` - funções auth frontend
9. Criar `server/middleware/auth.ts` - middleware backend
10. Modificar `server/index.ts` - remover auth Replit

### Fase 4: Backend Routes
11. Modificar `server/routes.ts` - substituir storage por supabase
12. Testar API com curl/Postman

### Fase 5: Frontend Hooks
13. Modificar `client/src/hooks/use-clients.ts`
14. Modificar `client/src/hooks/use-sources.ts`
15. Modificar `client/src/hooks/use-briefs.ts`
16. Modificar `client/src/hooks/use-contents.ts`
17. Modificar `client/src/lib/queryClient.ts` - auth state listener

### Fase 6: Limpeza
18. Deletar arquivos obsoletos:
   - `server/storage.ts`
   - `server/db.ts`
   - `server/replit_integrations/auth/`
   - `shared/schema.ts`
   - `server/production-server.ts`
19. Commit e push

## 5. Estratégia de Testes

### Testes de Backend
```bash
# Criar usuário
curl -X POST https://supa.agenciatouch.com.br/auth/v1/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456","data":{"full_name":"Test User"}}'

# Login e obter token
TOKEN=$(curl -X POST https://supa.agenciatouch.com.br/auth/v1/token?grant_type=password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}' | jq -r '.access_token')

# Criar cliente (com JWT)
curl -X POST http://localhost:5000/api/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Client"}'

# Listar clientes (só verá seus próprios)
curl -X GET http://localhost:5000/api/clients \
  -H "Authorization: Bearer $TOKEN"
```

### Testes de Frontend
1. Criar conta nova no app
2. Criar cliente
3. Verificar no Supabase Studio que user_id está preenchido
4. Criar outro usuário (incognito)
5. Verificar que NÃO vê o cliente do primeiro usuário (RLS funcionando)

### Teste de Isolamento
```sql
-- Verificar RLS está ativado
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Verificar políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';

-- Teste: user 1 insere, user 2 não deve ver
INSERT INTO clients (user_id, name) VALUES ('user1-id', 'User 1 Client');
SELECT * FROM clients; -- Deve mostrar 1 linha se auth.uid() = user1-id
```

### Teste de Cascade Delete
1. Criar cliente com sources e briefs
2. Deletar cliente
3. Verificar no banco que sources/briefs foram deletados (CASCADE)

## 6. Considerações Importantes

### RLS vs Middleware
- **RLS**: Filtra no banco de dados (nível mais baixo)
- **Middleware**: Só verifica se usuário existe
- **Resultado**: Mesmo que middleware falhe, RLS protege dados

### Auth no Frontend vs Backend
- **Frontend**: Usa Supabase Client (token gerenciado automaticamente)
- **Backend**: Verifica JWT mas não precisa gerar tokens

### Migration Strategy
- Como você não tem dados importantes, podemos fazer schema do zero
- Se tivesse dados, usaríamos INSERT ... SELECT para migrar

### Rollback
- Se algo der errado, descomentar auth Replit e voltar para SQLite
- Git commit antes de cada fase permite rollback fácil

## 7. Arquivos a Deletar (Após Testes)
- `server/storage.ts` - SQLite storage
- `server/db.ts` - SQLite connection
- `server/replit_integrations/auth/` - Auth Replit
- `shared/schema.ts` - Drizzle schema
- `server/production-server.ts` - Versão simplificada (obs: já atualizamos hoje)
