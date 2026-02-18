# 🔧 CORREÇÃO DO KONG - Instruções Rápidas

## 🐛 Problema

O Kong não inicia por causa de um erro de aspas no entrypoint:
```
bash: -c: line 1: unexpected EOF while looking for matching `"'
```

## ✅ Solução

### Passo 1: Atualizar o docker-compose do Supabase no Portainer

1. **No Portainer**, encontre o stack do Supabase
2. Clique no stack
3. Vá para **Editor**
4. **Apague TUDO** o conteúdo atual
5. **Cole o conteúdo do arquivo** `docker-compose.supabase-kong-fixed.yml`
6. Clique em **Update the stack**

⚠️ **IMPORTANTE:** Você **NÃO** precisa remover o stack. Apenas editar e atualizar é suficiente!

### Passo 2: Verificar o Kong

1. No Portainer, vá para **Containers** ou **Services**
2. Encontre o container **supabase_kong** (ou nome similar)
3. Verifique o status:
   - ✅ **Running** (verde) - Sucesso!
   - ❌ **Restarting** ou **Exited** - Veja os logs

### Passo 3: Verificar logs do Kong (se necessário)

```bash
# Via SSH na VPS
docker service logs supabase_kong --tail 50
```

**Esperado:** Ver algo como:
```
Configuration loaded successfully
Kong is ready
```

**Se ainda tiver erro:** Verifique o log e copie aqui para análise.

### Passo 4: Testar o Supabase

1. Acesse: `https://supa.agenciatouch.com.br`
2. Verifique se carrega normalmente
3. Acesse: `https://supa.agenciatouch.com.br/_dashboard` (Studio do Supabase)

---

## 🚀 Depois de Corrigir o Kong

### Passo 1: Re-deployar o BriefFlow

1. No Portainer, encontre o stack **brieflow**
2. Clique em **Remove the stack**
3. Clique em **Add stack**
4. Nome: `brieflow`
5. Cole o conteúdo de `docker-compose.brieflow-v2.yml`
6. Deploy

### Passo 2: Verificar labels do BriefFlow

1. No Portainer, vá para **Services**
2. Encontre **brieflow_app**
3. Clique nele
4. Vá para aba **Labels**
5. **Verifique se estas labels aparecem:**
   ```
   traefik.enable=true
   traefik.http.routers.brieflow.rule=Host(`brieflow.agenciatouch.com.br`)
   traefik.http.routers.brieflow.service=briefflow
   traefik.http.routers.brieflow.entrypoints=websecure
   traefik.http.routers.brieflow.tls.certresolver=letsencryptresolver
   traefik.http.routers.brieflow.tls=true
   ```

### Passo 3: Testar o BriefFlow

1. Acesse: `https://brieflow.agenciatouch.com.br`
2. Verifique se carrega com HTTPS (cadeado verde)
3. Tente criar uma conta
4. Verifique o console do navegador (F12) - não deve ter erros de CORS

---

## ✅ Checklist de Validação

- [ ] Kong está rodando sem erros
- [ ] `https://supa.agenciatouch.com.br` funciona
- [ ] Stack `brieflow` foi recriado
- [ ] Labels do Traefik aparecem no `brieflow_app`
- [ ] `https://brieflow.agenciatouch.com.br` funciona
- [ ] Certificado SSL válido (cadeado verde)
- [ ] Criação de conta funciona
- [ ] Login funciona
- [ ] Sem erros de CORS no console

---

## ❓ Se Ainda Houver Problemas

### Problema: Kong não inicia após o update
1. Verifique os logs: `docker service logs supabase_kong --tail 100`
2. Copie o erro completo aqui

### Problema: BriefFlow não tem labels
1. Remova o stack `brieflow` completamente
2. Crie um NOVO stack do zero
3. Verifique as labels após o deploy

### Problema: Ainda dá erro de CORS
1. Verifique se o `kong.yml` foi atualizado em `/root/supabase/docker/volumes/api/kong.yml`
2. Reinicie o Kong: `docker service update supabase_kong --force`
3. Verifique logs do Kong

---

## 📋 Resumo Rápido

1. ✅ Atualizar docker-compose do Supabase (apenas editar no Portainer)
2. ✅ Verificar Kong rodando
3. ✅ Re-deployar BriefFlow (remover + criar novo)
4. ✅ Verificar labels no BriefFlow
5. ✅ Testar `https://brieflow.agenciatouch.com.br`
6. ✅ Testar criação de conta

---

**Boa sorte! 🚀**
