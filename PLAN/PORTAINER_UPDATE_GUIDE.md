# Guia de Atualização do Portainer

## Problema Identificado

O volume `/app` está em modo **read-only**, impedindo que o container escreva arquivos buildados. O erro continua acontecendo porque o container precisa poder criar/modificar arquivos em `/app`.

---

## Solução: Usar docker-compose.simple.yml

Criei uma versão simplificada do docker-compose que resolve o problema do volume read-only.

---

## Passo a Passo no Portainer

### 1. Atualizar o Stack

1. Acesse: http://185.216.203.73:9000
2. Clique no seu stack: **briefflow-app**
3. Clique em: **Editor** (botão com ícone de código)
4. Substitua TODO o código atual por este abaixo (apenas copie e cole):

```yaml
version: "3.7"

services:
  app:
    image: node:20-alpine
    working_dir: /app
    command: >
      sh -c '
        cp /opt/brieflow/package*.json ./ &&
        npm install --include=dev &&
        cp -r /opt/brieflow/. . &&
        rm -rf dist &&
        npx tsx script/build.ts &&
        npx tsx server/index.ts
      '
    ports:
      - target: 5000
        published: 5000
        mode: host
    environment:
      NODE_ENV: production
      PORT: 5000
      SUPABASE_URL: https://supa.agenciatouch.com.br
      SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY}
      SUPABASE_SERVICE_KEY: ${SUPABASE_SERVICE_KEY}
    volumes:
      - type: bind
        source: /opt/brieflow
        target: /opt/brieflow
    networks:
      - brieflow-network
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3

  nginx:
    image: nginx:alpine
    ports:
      - target: 80
        published: 80
        mode: host
    volumes:
      - type: bind
        source: /opt/brieflow/nginx/nginx.conf
        target: /etc/nginx/nginx.conf
        read_only: true
      - type: bind
        source: /opt/brieflow/nginx/logs
        target: /var/log/nginx
    networks:
      - brieflow-network
    depends_on:
      - app
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3

networks:
  brieflow-network:
    driver: overlay
    attachable: true
```

5. Clique em: **Update the stack** (botão verde no canto inferior direito)

---

## Passo 2: Adicionar Variáveis de Ambiente

**IMPORTANTE:** As variáveis do Supabase NÃO devem ser colocadas no YAML do Portainer.

1. No mesmo stack, role para baixo até a seção: **Environment**

2. Clique no botão: **+ Add a variable** para cada variável:

| Name | Value |
|------|-------|
| `SUPABASE_URL` | `https://supa.agenciatouch.com.br` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24AiLCJpc3MiOiAic3VwYWJhc2UiLCJpYXQiOiAxNzE1MDUwMDAsImV4cCI6MTg3ODExNzAwCn0._G0caHkMnfr_HyJR9knteSCT0H9q3tDO5pL3AUb2mic` |
| `SUPABASE_SERVICE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vyb2xlIiwgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3MTUwNTA4MDAsImV4cCI6MTg3ODExNzAwCn0.v61ZT_CkG8YGYa9H1MXV2M1ghvMpeYXYsiBp8DowiZY` |

**OBSERVAÇÃO IMPORTANTE:**
- ❌ NÃO coloque variáveis de banco (DB_HOST, DB_PORT, etc) - o Supabase está em outro container
- ❌ NÃO coloque JWT_SECRET, SESSION_SECRET, FRONTEND_URL - o Supabase lida com isso
- ✅ Use apenas as 3 variáveis acima (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY)

3. Depois de adicionar todas as 3 variáveis, clique em: **Update the stack**

---

## Passo 3: Verificar Logs

1. Após atualizar, vá para a aba: **Containers**
2. Clique no container `briefflow-app`
3. Clique em: **Console**
4. Procure por erros ou mensagens de sucesso

**Esperado:**
- Container inicia sem erros
- `npx tsx server/index.ts` é executado (não production-server)
- Build é concluído

---

## Passo 4: Testar Aplicação

1. Acesse: http://185.216.203.73:5000
2. Verifique se a aplicação carrega
3. Se ainda não funcionar, vá em: **Containers** → **Console** para ver o erro específico

---

## Solução de Backup (se o problema persistir)

Se o volume read-only continuar causando problemas:

### Opção A: Remover read_only completamente

No YAML acima, a seção `volumes:` do serviço app foi removida completamente (agora é um bind normal que permite escrita).

Se você quiser voltar para o formato original (com volumes nomeados):

```yaml
volumes:
  app_work:
    external: true
  app_logs:
    # Adicionar aqui se precisar persistir logs
```

### Opção B: Criar um volume Docker gerenciado

1. No Portainer: **Volumes** → **Add volume**
2. Nome: `app_build`
3. Driver: `local`
4. Usar este volume no serviço app (em vez de bind)

---

## Checklist de Validação

Antes de testar a aplicação:

- [ ] Stack atualizado com o novo YAML
- [ ] Variáveis de ambiente adicionadas (3 variáveis do Supabase)
- [ ] Volume read_only removido (bind normal no lugar)
- [ ] Stack foi deployado
- [ ] Logs verificados sem erros
- [ ] Aplicação acessível em http://185.216.203.73:5000

---

## Diferenças Entre Versões

| Aspecto | Antigo (com erro) | Novo (corrigido) |
|----------|---------------------|-------------------|
| **Volume** | Bind com read_only | Bind normal (permite escrita) |
| **Variáveis** | No YAML do Portainer | No YAML do Portainer (como deve ser) |
| **Comando final** | `server/production-server.ts` (antigo/errado) | `server/index.ts` (novo/correto) |

---

## Por que está mudando de `production-server.ts` para `index.ts`?

Arquivo antigo (`production-server.ts`):
- Armazenamento em memória (não persistente)
- Sem conexão com Supabase real

Arquivo novo (`index.ts`):
- Usa `supabaseAdmin` do arquivo `shared/supabase.ts`
- Conecta com PostgreSQL do Supabase
- Tem middleware de autenticação JWT
- Persistência real de dados

**O novo é o correto para usar com Supabase.**
