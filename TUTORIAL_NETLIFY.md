# Tutorial: Deploy do Frontend no Netlify

## Visão Geral

Este tutorial guia você no deploy do frontend React no Netlify, mantendo o backend (Node.js + Python scraper) na sua VPS.

**Arquitetura final:**
```
┌─────────────┐         ┌──────────────────┐
│  Netlify    │ ───────>│      VPS         │
│  (Frontend) │  API    │  (Backend +      │
│  React/Vite │         │   Python Scraper)│
└─────────────┘         └──────────────────┘
      │                          │
      └──────────┬───────────────┘
                 │
          Supabase (Banco)
```

---

## Passo 1: Preparar o Projeto

### 1.1 Atualizar Configuração do Netlify

O arquivo `netlify.toml` já está configurado para fazer apenas o build do frontend:

```toml
[build]
  publish = "dist/public"
  command = "npm install && npx vite build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_ENV = "production"
```

### 1.2 Certificar que está no GitHub

Seu projeto já deve estar em um repositório GitHub. Se não estiver:

```bash
git init
git add .
git commit -m "Prepare for Netlify deploy"
git remote add origin https://github.com/seu-usuario/seu-repo.git
git push -u origin main
```

---

## Passo 2: Configurar Variáveis de Ambiente no Netlify

### 2.1 Acesse o Painel do Netlify

1. Vá em [netlify.com](https://netlify.com) e faça login
2. Clique em "Add new site" → "Import an existing project"
3. Selecione o GitHub e escolha seu repositório

### 2.2 Configure as Variáveis de Ambiente

Durante o setup ou depois em **Site settings → Environment variables**, adicione:

```
# Supabase (obrigatório)
VITE_SUPABASE_URL=https://supa.agenciatouch.com.br
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui

# Sua VPS (backend)
VITE_API_URL=https://sua-vps-aqui.com
```

**Importante:** 
- Substitua `sua-vps-aqui.com` pela URL real da sua VPS
- Use `https://` se tiver SSL, ou `http://` se não tiver
- Se usar porta diferente de 80/443, inclua: `https://sua-vps.com:8080`

---

## Passo 3: Configurar CORS na VPS

### 3.1 Atualizar Backend para Aceitar Requisições do Netlify

No seu backend (VPS), certifique-se de que o CORS está configurado para aceitar o domínio do Netlify.

Edite `server/index.ts` na VPS:

```typescript
import cors from 'cors';

const corsOptions = {
  origin: [
    'http://localhost:5000',
    'http://localhost:5173',
    'https://seu-site-netlify.app',  // URL do Netlify
    'https://www.seu-site-netlify.app',
    process.env.FRONTEND_URL  // Ou use variável de ambiente
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey', 'x-client-info']
};

app.use(cors(corsOptions));
```

### 3.2 Reiniciar Backend na VPS

```bash
cd /opt/briefflow  # ou onde está seu projeto
docker-compose restart app
# ou
pm2 restart briefflow
# ou
npm start
```

---

## Passo 4: Configurar Proxy (Opcional mas Recomendado)

### 4.1 Benefícios do Proxy

Em vez de configurar `VITE_API_URL` no frontend, você pode usar um proxy no Netlify. Isso permite:

- URLs limpas no frontend (`/api/users` em vez de `https://vps.com/api/users`)
- Facilidade para trocar de ambiente (dev/prod)
- Melhor segurança (não expõe a URL da VPS)

### 4.2 Configuração do Proxy

O `netlify.toml` já inclui a configuração de proxy:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://sua-vps-aqui.com/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/scraper/*"
  to = "https://sua-vps-aqui.com:8000/:splat"
  status = 200
  force = true
```

**Ajuste:** Substitua `sua-vps-aqui.com` pela URL real da sua VPS.

### 4.3 Ajustar Frontend para Usar URLs Relativas

Se usar o proxy, no frontend você pode usar:

```typescript
// Em vez de:
const API_URL = import.meta.env.VITE_API_URL;
fetch(`${API_URL}/api/users`)

// Use:
fetch('/api/users')  // Vai automaticamente para sua VPS via proxy
```

---

## Passo 5: Deploy

### 5.1 Deploy Automático

Ao conectar o GitHub, o Netlify já configura deploy automático:
- Cada push na branch `main` dispara novo deploy
- Pull Requests geram deploy previews

### 5.2 Deploy Manual (se necessário)

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Linkar site existente ou criar novo
netlify link
# ou
netlify init

# Deploy
netlify deploy --prod
```

---

## Passo 6: Verificação

### 6.1 Checklist Pós-Deploy

Após o deploy, verifique:

1. **Frontend carrega:** Acesse o URL do Netlify e veja se a interface aparece
2. **Login funciona:** Tente fazer login (usando Supabase)
3. **API conecta:** Teste alguma ação que chame o backend da VPS
4. **Scraper funciona:** Se aplicável, teste o scraper Python

### 6.2 Debug de Problemas

#### Erro de CORS

Se vir erro no console:
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Solução:** Verifique se configurou o CORS no backend da VPS corretamente (Passo 3)

#### Erro 404 na API

Se chamadas `/api/*` retornam 404:

**Solução:** Verifique se as variáveis de ambiente estão configuradas e se o proxy está correto no `netlify.toml`

#### Variáveis de Ambiente Não Carregam

**Solução:** No Netlify, vá em Site Settings → Environment Variables e verifique se:
- As variáveis começam com `VITE_` (obrigatório para Vite)
- Fizeram deploy após adicionar as variáveis (trigger deploy)

### 6.3 Logs no Netlify

Para ver logs de build:
1. Netlify Dashboard → Seu site → Deploys
2. Clique no deploy mais recente
3. Veja o log de build

---

## Passo 7: Configurações Avançadas (Opcional)

### 7.1 Domínio Personalizado

1. Netlify Dashboard → Domain settings
2. Add custom domain
3. Siga as instruções para configurar DNS

### 7.2 HTTPS/SSL

O Netlify fornece SSL automático (Let's Encrypt) para domínios personalizados.

### 7.3 Headers de Segurança

Adicione ao `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### 7.4 Cache de Assets

```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

## Resumo dos Arquivos Modificados

### `netlify.toml`
```toml
[build]
  publish = "dist/public"
  command = "npm install && npx vite build"

# Proxy para API na VPS
[[redirects]]
  from = "/api/*"
  to = "https://SUA-VPS-AQUI.com/api/:splat"
  status = 200
  force = true

# Proxy para Scraper Python
[[redirects]]
  from = "/scraper/*"
  to = "https://SUA-VPS-AQUI.com:8000/:splat"
  status = 200
  force = true

# SPA fallback
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_ENV = "production"
```

### Variáveis no Netlify
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL` (se não usar proxy)

---

## Troubleshooting

### Build falha com "Cannot find module"

```bash
# Limpar cache no Netlify
# Site Settings → Build & Deploy → Clear cache and retry deploy
```

### Erro "Failed to load config"

Verifique se o `vite.config.ts` está na raiz do projeto (não na pasta client).

### API retorna 502 Bad Gateway

Verifique se sua VPS está respondendo:
```bash
curl https://sua-vps.com/api/health
```

Se não funcionar, o problema está na VPS, não no Netlify.

---

## Próximos Passos

1. ✅ Seguir Passo 1: Atualizar `netlify.toml` com sua URL da VPS
2. ✅ Seguir Passo 2: Configurar variáveis no painel do Netlify
3. ✅ Seguir Passo 3: Configurar CORS na VPS
4. ✅ Seguir Passo 4: Deploy e testar

**Precisa de ajuda com algum passo específico?**
