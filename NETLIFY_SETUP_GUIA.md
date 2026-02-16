# 🚀 CONFIGURAÇÃO NETLIFY - PASSO A PASSO

## ⚠️ ATENÇÃO: Alterações Necessárias na Tela de Deploy

Você está na tela de review do Netlify. Precisa alterar algumas configurações:

### ❌ Está errado:
- **Build command:** `npm run build`
- **Publish directory:** `dist`

### ✅ Deve ser:
- **Build command:** `npm install && npx vite build`
- **Publish directory:** `dist/public`

---

## 📋 Variáveis de Ambiente Obrigatórias

Clique em **"Add environment variables"** e adicione estas 2 variáveis:

### Variável 1: VITE_SUPABASE_URL
```
Key: VITE_SUPABASE_URL
Value: https://supa.agenciatouch.com.br
```

### Variável 2: VITE_SUPABASE_ANON_KEY
```
Key: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0._G0caHkMnfr_HyJR9knteSCT0H9q3tDO5pL3AUb2mic
```

---

## 🔧 Configurações na Tela de Deploy

### Branch to deploy
```
main
```

### Base directory
```
(deixe em branco - usa raiz do projeto)
```

### Build command 
```
npm install && npx vite build
```

### Publish directory
```
dist/public
```

### Functions directory
```
(deixe em branco ou netlify/functions)
```

---

## ✅ Checklist Antes de Clicar em "Deploy"

- [ ] Build command alterado para: `npm install && npx vite build`
- [ ] Publish directory alterado para: `dist/public`
- [ ] Variável `VITE_SUPABASE_URL` adicionada
- [ ] Variável `VITE_SUPABASE_ANON_KEY` adicionada
- [ ] Project name está como desejado: `briefflow2`

---

## 🖥️ Configuração na VPS (DEPOIS do Deploy)

### 1. Conectar na VPS
```bash
ssh root@185.216.203.73
```

### 2. Editar o arquivo de CORS
```bash
cd /opt/briefflow  # ou onde está seu projeto
nano server/index.ts
```

### 3. Adicionar o domínio do Netlify no CORS
```typescript
const corsOptions = {
  origin: [
    'http://localhost:5000',
    'http://localhost:5173',
    'https://briefflow2.netlify.app',  // <-- ADICIONAR ISSO
    'https://*.netlify.app',              // <-- E ISSO (wildcard)
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey', 'x-client-info']
};
```

### 4. Reiniciar o backend
```bash
# Se usar Docker:
docker-compose restart app

# Se usar PM2:
pm2 restart briefflow

# Ou manualmente:
npm start
```

---

## 🧪 Testar Depois do Deploy

### 1. Verificar se o site carrega
Acesse: `https://briefflow2.netlify.app`

### 2. Verificar console do navegador
- Abra o site
- Pressione F12 (DevTools)
- Aba "Console"
- Deve aparecer: "BriefFlow app initialized" ou similar
- NÃO deve ter erros de CORS

### 3. Testar login
- Tente fazer login com uma conta existente
- Se der erro de CORS, verifique a configuração na VPS

### 4. Testar API
- Acesse: `https://briefflow2.netlify.app/api/health`
- Deve retornar status do backend na VPS

---

## ❌ Erros Comuns

### Erro: "Failed to load module"
**Solução:** Verifique se alterou o Build command para `npm install && npx vite build`

### Erro: "Cannot find dist/public"
**Solução:** Verifique se alterou o Publish directory para `dist/public`

### Erro CORS (console do navegador)
**Solução:** A configuração na VPS (Passo 3 acima) ainda não foi feita

### Erro: "VITE_SUPABASE_URL is not defined"
**Solução:** Adicione as variáveis de ambiente no painel do Netlify

---

## 📞 URLs Importantes

- **Frontend Netlify:** https://briefflow2.netlify.app
- **API na VPS:** http://185.216.203.73:5000
- **Scraper na VPS:** http://185.216.203.73:8000
- **Supabase:** https://supa.agenciatouch.com.br

---

## 📝 Resumo do que foi configurado

### No Netlify:
- ✅ Build command: `npm install && npx vite build`
- ✅ Publish directory: `dist/public`
- ✅ Variáveis: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

### No netlify.toml:
- ✅ Proxy /api/* → http://185.216.203.73:5000/api/*
- ✅ Proxy /scraper/* → http://185.216.203.73:8000/*
- ✅ SPA fallback configurado

### Na VPS (você precisa fazer):
- ⏳ Adicionar `https://briefflow2.netlify.app` no CORS
- ⏳ Reiniciar o backend

---

**Pronto para fazer o deploy?** 🚀

1. Clique em "Add environment variables"
2. Adicione as 2 variáveis acima
3. Altere Build command e Publish directory
4. Clique em "Deploy briefflow2"
5. Aguarde o build (2-3 minutos)
6. Acesse o site e teste!
