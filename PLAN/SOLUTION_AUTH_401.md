# 🔧 SOLUÇÃO: Autenticação e Erro 401

## ❌ O Problema

```
Failed to load resource: server responded with a status of 401 ()
```

**Causa:** O frontend está tentando usar **Supabase**, mas as **chaves de autenticação** não estão configuradas no docker-compose.

---

## 🔍 O Que Está Acontecendo

### Frontend React:
- Usa `supabase.auth.getUser()` para verificar autenticação
- Faz queries para `supa.agenciatouch.com.br` com `SUPABASE_ANON_KEY`
- Recebe 401 porque as chaves não estão configuradas

### Backend (production-server.ts):
- Usa cookies simples para autenticação
- Endpoint `/api/login` cria cookie de sessão
- Endpoint `/api/auth/user` verifica o cookie

**Problema:** Dois sistemas de autenticação diferentes!

---

## ✅ SOLUÇÃO 1: Configurar Variáveis do Supabase

### No servidor, verifique as variáveis:

```bash
# Verificar variáveis atuais
docker service inspect briefflow_app --format '{{json .Spec.TaskTemplate.ContainerSpec.Env}}'
```

Você deve ver:
```json
[
  "NODE_ENV=production",
  "SUPABASE_URL=https://supa.agenciatouch.com.br",
  "SUPABASE_ANON_KEY=SUA_CHAVE_ANON",
  "SUPABASE_SERVICE_KEY=SUA_CHAVE_SERVICE",
  ...
]
```

### Se as chaves não estiverem:

#### Via Portainer:

1. Vá em **Stacks** → `briefflow`
2. Clique em **Editor**
3. Vá para a aba **Environment variables**
4. Adicione:

| Name | Value |
|------|-------|
| `SUPABASE_URL` | `https://supa.agenciatouch.com.br` |
| `SUPABASE_ANON_KEY` | `SUA_CHAVE_ANON_DO_SUPABASE` |
| `SUPABASE_SERVICE_KEY` | `SUA_CHAVE_SERVICE_DO_SUPABASE` |

5. Clique em **Update the stack**

#### Via Terminal:

```bash
# Se você tiver um arquivo .env
docker stack deploy -c /opt/brieflow/docker-compose.portainer-tsx-direct.yml --env-file /opt/brieflow/.env briefflow
```

---

## ✅ SOLUÇÃO 2: Obter Chaves do Supabase

### Como encontrar suas chaves:

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** = `SUPABASE_URL`
   - **anon public** = `SUPABASE_ANON_KEY`
   - **service_role** = `SUPABASE_SERVICE_KEY`

### Adicione ao docker-compose:

```bash
# No servidor, editar o docker-compose
cd /opt/brieflow

# Adicionar no environment do serviço app:
#   SUPABASE_URL: https://supa.agenciatouch.com.br
#   SUPABASE_ANON_KEY: SUA_CHAVE_ANON
#   SUPABASE_SERVICE_KEY: SUA_CHAVE_SERVICE

# Re-deployar
docker stack deploy -c docker-compose.portainer-tsx-direct.yml briefflow
```

---

## ✅ SOLUÇÃO 3: Usar Endpoint /api/login (Demo Mode)

### O botão "Fazer Login Demo" existe!

1. Acesse: `http://seu-servidor:5001`
2. Clique em **"Fazer Login Demo"**
3. Isso vai:
   - Criar um cookie de sessão
   - Redirecionar para `/?login=success`
   - O frontend deve detectar e autenticar

### Mas isso tem um problema:

O frontend React usa **Supabase** para autenticação, não cookies! Então o botão não vai funcionar.

---

## ✅ SOLUÇÃO 4: Criar Cliente Via API (Funciona Agora!)

### Enquanto corrige o frontend, use a API:

```bash
# 1. Fazer login (criar sessão)
curl -L http://seu-servidor:5001/api/login

# 2. Listar clientes (usando a sessão)
curl http://seu-servidor:5001/api/clients \
  --cookie "auth=demo-session"

# 3. Criar cliente
curl -X POST http://seu-servidor:5001/api/clients \
  --cookie "auth=demo-session" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Meu Cliente",
    "description": "Cliente de teste",
    "niche": "Marketing",
    "targetAudience": "B2B"
  }'
```

---

## ✅ SOLUÇÃO 5: Corrigir Frontend para Usar Backend Auth

Esta é a solução mais complexa mas correta a longo prazo.

### O que precisa ser feito:

1. Modificar `shared/supabase.ts` para usar endpoint do backend
2. Criar wrapper que chama `/api/auth/user` em vez de `supabase.auth.getUser()`
3. Atualizar hooks para usar o backend

### Isso é um refactor maior, vamos fazer passo a passo?

---

## 🎯 RECOMENDAÇÃO IMEDIATA

### Use a SOLUÇÃO 2 (Configurar Variáveis do Supabase)

É a mais rápida e vai fazer a aplicação funcionar!

### Passos:

1. Vá ao dashboard do Supabase
2. Copie as chaves (anon e service)
3. Adicione ao docker-compose via Portainer
4. Update stack
5. Acesse `http://seu-servidor:5001`
6. Clique em "Fazer Login Demo"

Se ainda não funcionar, me informe!

---

## 📊 Comparação das Soluções

| Solução | Funcionalidade | Dificuldade | Tempo |
|---------|---------------|-------------|-------|
| **Solução 1: Configurar Supabase** | ✅ Frontend completo | 🟢 Fácil | 5-10 min |
| **Solução 2: Obter Chaves** | ✅ Frontend completo | 🟢 Fácil | 5 min |
| **Solução 3: Botão Demo** | ❌ Não funciona (mismatch) | - | - |
| **Solução 4: API Direta** | ✅ API funcional | 🟢 Fácil | Agora |
| **Solução 5: Refactor Auth** | ✅ Sistema unificado | 🔴 Difícil | 1-2 horas |

---

## 🔧 Debug: Verificar Chaves no Container

```bash
# Entrar no container
docker exec -it $(docker ps -q -f name=briefflow_app) sh

# Verificar variáveis de ambiente
env | grep SUPABASE

# Deve mostrar:
# SUPABASE_URL=https://supa.agenciatouch.com.br
# SUPABASE_ANON_KEY=SUA_CHAVE
# SUPABASE_SERVICE_KEY=SUA_CHAVE
```

Se não mostrar, adicione as variáveis!

---

## 📝 Exemplo de docker-compose com Chaves

```yaml
services:
  app:
    image: node:20-alpine
    environment:
      SUPABASE_URL: https://supa.agenciatouch.com.br
      SUPABASE_ANON_KEY: eyJhbGc... (sua chave anon)
      SUPABASE_SERVICE_KEY: eyJh... (sua chave service)
      # ... outras variáveis
```

---

## ✨ Próximo Passo

**Configure as chaves do Supabase no docker-compose!**

Depois disso, a aplicação deve funcionar perfeitamente.

Se não funcionar, me mostre:
1. As variáveis de ambiente configuradas
2. O erro no console do navegador (F12)
