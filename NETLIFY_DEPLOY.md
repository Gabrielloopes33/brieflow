# Deploy Frontend no Netlify

Guia rápido para deploy do frontend React no Netlify com backend na VPS.

## ⚡ Configuração Rápida (5 minutos)

### 1. Configure sua VPS no `netlify.toml`

Edite o arquivo `netlify.toml` e substitua `SUA-VPS-AQUI.com` pela URL real da sua VPS:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://api.seudominio.com/api/:splat"  # <-- ALTERE AQUI
  status = 200
  force = true
```

### 2. Configure Variáveis no Netlify

No painel do Netlify (Site Settings → Environment Variables), adicione:

```
VITE_SUPABASE_URL=https://supa.agenciatouch.com.br
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

**Nota:** Não precisa de `VITE_API_URL` se usar o proxy (recomendado).

### 3. Faça Deploy

```bash
git add .
git commit -m "Configura deploy Netlify"
git push origin main
```

O deploy automático do Netlify será acionado.

## 📋 Checklist

- [ ] Substituiu `SUA-VPS-AQUI.com` no `netlify.toml`?
- [ ] Configurou variáveis de ambiente no Netlify?
- [ ] Habilitou CORS no backend da VPS?
- [ ] Testou login/autenticação?
- [ ] Testou chamadas à API?

## 📖 Documentação Completa

Veja o arquivo `TUTORIAL_NETLIFY.md` para:
- Explicação detalhada da arquitetura
- Configuração de CORS na VPS
- Troubleshooting completo
- Configurações avançadas (domínio personalizado, headers de segurança)

## 🔧 Scripts Úteis

```bash
# Verificar configuração antes do deploy
./check-netlify.sh

# Testar build localmente
npm install && npx vite build
```

## ❓ Dúvidas?

1. **Build falha?** Verifique se substituiu a URL da VPS no `netlify.toml`
2. **API não conecta?** Verifique CORS no backend da VPS
3. **Variáveis não funcionam?** Certifique-se que começam com `VITE_`

## 🏗️ Arquitetura

```
Usuário → Netlify (Frontend) → Proxy → VPS (Backend + Python)
                ↓
            Supabase (Auth + DB)
```

- **Frontend:** React + Vite + Tailwind → Netlify
- **Backend:** Node.js + Express → Sua VPS
- **Scraper:** Python → Sua VPS (porta 8000)
- **Banco:** Supabase (PostgreSQL)

---

**Status do projeto:** ✅ Pronto para deploy
