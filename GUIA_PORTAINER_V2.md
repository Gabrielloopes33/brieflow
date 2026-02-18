# 🚀 Guia Completo: Configurar HTTPS no BriefFlow via Portainer

## 📋 Resumo do Problema

- ✅ Container `brieflow_app` funciona (acesso via `http://185.216.203.73:5001`)
- ✅ Container está na rede `touchNet`
- ❌ Traefik não detecta as labels
- ❌ Domínio `brieflow.agenciatouch.com.br` não funciona (404)

## 🔍 Causa Provável

As labels do Traefik não estão sendo aplicadas corretamente pelo Portainer durante o re-deploy.

---

## ✅ SOLUÇÃO PASSO A PASSO

### Passo 1: Acessar o Portainer

1. Abra o Portainer na sua VPS
2. Vá até **Stacks**
3. Encontre o stack **brieflow**

---

### Passo 2: REMOVER o stack atual

⚠️ **IMPORTANTE**: Não apenas edite - REMOVA o stack completamente!

1. Clique no stack **brieflow**
2. Clique em **Editor** (para ver o conteúdo atual)
3. Copie o conteúdo para backup (opcional)
4. Vá para aba **General** ou clique no botão **Settings**
5. Clique em **Remove the stack** (ou botão de **Delete**)
6. Confirme a remoção

**Verificação:**
- Na lista de stacks, o stack **brieflow** não deve mais aparecer
- No painel de serviços, os containers `brieflow_app`, `brieflow_nginx`, `brieflow_redis` devem ter parado

---

### Passo 3: Criar um NOVO stack

1. No Portainer, clique em **Add stack** (botão azul)
2. Nome do stack: `brieflow`
3. No editor, cole o conteúdo do arquivo `docker-compose.brieflow-v2.yml`

**Conteúdo do arquivo:**
```yaml
version: '3.8'

services:
  app:
    image: node:20-alpine
    working_dir: /app
    command: >
      sh -c "
        cp /opt/brieflow/package*.json ./ &&
        npm install --include=dev &&
        cp -r /opt/brieflow/. . &&
        rm -rf dist &&
        npx tsx script/build.ts &&
        npx tsx server/production-server.ts
      "
    ports:
      - target: 5000
        published: 5001
        mode: host
    environment:
      NODE_ENV: production
      PORT: 5000
      DB_HOST: ${DB_HOST:-postgres}
      DB_PORT: ${DB_PORT:-5432}
      DB_NAME: ${DB_NAME}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      SESSION_SECRET: ${SESSION_SECRET}
      FRONTEND_URL: https://brieflow.agenciatouch.com.br
      SUPABASE_URL: https://supa.agenciatouch.com.br
      SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY}
      SUPABASE_SERVICE_KEY: ${SUPABASE_SERVICE_KEY}
    volumes:
      - type: bind
        source: /opt/brieflow
        target: /opt/brieflow
        read_only: true
      - app_work:/app
      - app_logs:/app/logs
    networks:
      - brieflow-network
      - touchNet
    labels:
      - traefik.enable=true
      - traefik.http.routers.brieflow.rule=Host(`brieflow.agenciatouch.com.br`)
      - traefik.http.services.brieflow.loadbalancer.server.port=5000
      - traefik.http.routers.brieflow.service=briefflow
      - traefik.http.routers.brieflow.entrypoints=websecure
      - traefik.http.routers.brieflow.tls.certresolver=letsencryptresolver
      - traefik.http.routers.brieflow.tls=true
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.brieflow.rule=Host(`brieflow.agenciatouch.com.br`)
        - traefik.http.services.brieflow.loadbalancer.server.port=5000
        - traefik.http.routers.brieflow.service=briefflow
        - traefik.http.routers.brieflow.entrypoints=websecure
        - traefik.http.routers.brieflow.tls.certresolver=letsencryptresolver
        - traefik.http.routers.brieflow.tls=true

  nginx:
    image: nginx:alpine
    ports:
      - target: 80
        published: 8082
        mode: host
    volumes:
      - type: bind
        source: /opt/brieflow/nginx/nginx.conf
        target: /etc/nginx/nginx.conf
        read_only: true
      - nginx_logs:/var/log/nginx
    networks:
      - brieflow-network
    depends_on:
      - app
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure

  redis:
    image: redis:7-alpine
    ports:
      - target: 6379
        published: 6380
        mode: host
    volumes:
      - redis_data:/data
    networks:
      - brieflow-network
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure

networks:
  brieflow-network:
    driver: overlay
    attachable: true
  touchNet:
    external: true
    name: touchNet

volumes:
  redis_data:
  app_work:
  app_logs:
  nginx_logs:
```

4. Clique em **Deploy the stack**
5. Aguarde o deploy terminar (aparecerá um check verde)

---

### Passo 4: VERIFICAR as labels no serviço

⚠️ **CRUCIAL**: Verifique se as labels foram aplicadas!

1. No Portainer, vá para **Containers** ou **Services**
2. Encontre o container **brieflow_app**
3. Clique nele
4. Vá para a aba **Labels** ou **Settings**
5. **Verifique se as labels do Traefik aparecem:**
   ```
   traefik.enable=true
   traefik.http.routers.brieflow.rule=Host(`brieflow.agenciatouch.com.br`)
   traefik.http.routers.brieflow.service=briefflow
   traefik.http.routers.brieflow.entrypoints=websecure
   traefik.http.routers.brieflow.tls.certresolver=letsencryptresolver
   traefik.http.routers.brieflow.tls=true
   ```

**Se as labels NÃO aparecerem:**
- O deploy não foi feito corretamente
- Volte ao Passo 2 e remova o stack
- Recrie o stack seguindo o Passo 3

---

### Passo 5: Verificar o container no Traefik

1. No Portainer, encontre o container **traefik**
2. Clique em **Logs**
3. Procure por mensagens sobre `brieflow`
4. Deve aparecer algo como:
   ```
   traefik  | time="2024-xx-xx..." level=info msg="Configuration received" providerName=docker
   traefik  | time="2024-xx-xx..." level=info msg="Creating router" routerName=brieflow@docker
   ```

---

### Passo 6: Testar o acesso

1. Abra o navegador
2. Acesse: `https://brieflow.agenciatouch.com.br`
3. **Se funcionar:** Deve carregar a página normalmente com HTTPS (cadeado verde)
4. **Se não funcionar:**
   - Verifique os logs do Traefik
   - Verifique os logs do `brieflow_app`
   - Verifique se o DNS está apontando para `185.216.203.73`

---

## 🔧 SOLUÇÃO DE PROBLEMAS

### Problema 1: Labels não aparecem

**Causa:** Stack foi editado em vez de recriado

**Solução:**
1. Remova o stack completo
2. Crie um novo stack do zero
3. Verifique as labels após o deploy

### Problema 2: Erro 404 no domínio

**Causa:** Traefik não detectou as labels

**Solução:**
1. Verifique as labels no container (Passo 4)
2. Reinicie o container do Traefik:
   ```
   docker service update traefik_traefik --force
   ```
3. Verifique logs do Traefik

### Problema 3: DNS não funciona

**Causa:** DNS não configurado corretamente

**Solução:**
1. Verifique se o DNS `brieflow.agenciatouch.com.br` aponta para `185.216.203.73`
2. Use `nslookup brieflow.agenciatouch.com.br` ou `dig brieflow.agenciatouch.com.br`
3. Aguarde a propagação do DNS (pode levar até 24h)

### Problema 4: Container não inicializa

**Causa:** Erro de build ou volume

**Solução:**
1. Verifique logs do `brieflow_app`
2. Verifique se o volume `/opt/brieflow` existe e tem os arquivos
3. Verifique as variáveis de ambiente

---

## ✅ CHECKLIST FINAL

Antes de testar o login, verifique:

- [ ] Stack `brieflow` foi removido e recriado (não apenas editado)
- [ ] Container `brieflow_app` está rodando
- [ ] Labels do Traefik aparecem no container (Passo 4)
- [ ] Container está na rede `touchNet`
- [ ] DNS `brieflow.agenciatouch.com.br` aponta para `185.216.203.73`
- [ ] Logs do Traefik mostram o router `brieflow`
- [ ] Acessar `https://brieflow.agenciatouch.com.br` funciona
- [ ] Certificado SSL válido (cadeado verde)
- [ ] Testar criação de conta funciona
- [ ] Testar login funciona

---

## 📞 Se ainda não funcionar

Se após seguir todos os passos o problema persistir:

1. **Cole aqui:**
   - Logs do container `brieflow_app` (últimas 50 linhas)
   - Logs do container `traefik` (últimas 50 linhas)
   - Lista de labels do container `brieflow_app`

2. **Execute no console da VPS:**
   ```bash
   docker service ls
   docker service logs brieflow_app --tail 50
   docker service logs traefik --tail 50 | grep -i brieflow
   ```

3. **Verifique:**
   - O nome correto do container do Traefik (pode ser `traefik_traefik`, `traefik`, etc.)
   - Se o Traefik está configurado para ler labels da rede `touchNet`

---

**Boa sorte! 🚀**
