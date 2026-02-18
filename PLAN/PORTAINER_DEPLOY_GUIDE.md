# 🐳 Guia Completo de Deploy pelo Portainer

## 📋 Passo a Passo - Como Refazer a Stack no Portainer

---

## 1️⃣ Acessar o Portainer

1. Abra o navegador e acesse seu Portainer
2. Faça login com suas credenciais
3. No menu lateral, clique em **Stacks** (ou **Stacks + Swarm**)

---

## 2️⃣ Remover a Stack Antiga

### Se a stack já existe:

1. Na lista de Stacks, encontre **briefflow**
2. Clique no nome da stack
3. No topo, clique em **Delete** (🗑️)
4. Confirme clicando em **Delete**

⚠️ **Aguarde 30-60 segundos** até a stack ser completamente removida.

### Verificar se foi removida:
- A stack deve desaparecer da lista
- Ou verifique: `docker service ls | grep briefflow` (não deve retornar nada)

---

## 3️⃣ Criar Nova Stack

### Opção A: Usar o Dockerfile (RECOMENDADO) ⭐

**Pré-requisito:**
```bash
# No terminal do servidor, antes do deploy:
ls -la /opt/brieflow/Dockerfile.production

# Se não existir:
cp /opt/brieflow/PLAN/Dockerfile.production /opt/brieflow/Dockerfile.production
```

#### No Portainer:

1. Clique em **Add stack** (+ azul)
2. **Name**: Digite `briefflow`
3. **Build method**: Selecione **Upload a Docker Compose file** (ou cole direto)
4. Cole o conteúdo de `/opt/brieflow/PLAN/docker-compose.portainer-dockerfile.yml`
5. Vá para a aba **Environment variables**
6. Adicione as variáveis:

| Name | Value |
|------|-------|
| `DB_HOST` | `postgres` (ou seu host) |
| `DB_PORT` | `5432` |
| `DB_NAME` | `seu_database` |
| `DB_USER` | `seu_usuario` |
| `DB_PASSWORD` | `sua_senha` |
| `JWT_SECRET` | `uma_string_aleatoria_aqui` |
| `SESSION_SECRET` | `outra_string_aleatoria_aqui` |
| `FRONTEND_URL` | `https://seu-dominio.com` |
| `SUPABASE_ANON_KEY` | `sua_chave_supabase_anon` |
| `SUPABASE_SERVICE_KEY` | `sua_chave_supabase_service` |

7. Clique em **Deploy the stack**

---

### Opção B: Build no Container (Alternativa)

1. Clique em **Add stack** (+ azul)
2. **Name**: Digite `briefflow`
3. Cole o conteúdo de `/opt/brieflow/PLAN/docker-compose.portainer-simple.yml`
4. Adicione as mesmas variáveis de ambiente (veja tabela acima)
5. Clique em **Deploy the stack**

---

## 4️⃣ Monitorar o Deploy

### Após clicar em Deploy:

1. Você será redirecionado para a página da stack `briefflow`
2. Clique na aba **Services**
3. Você verá 3 serviços:
   - `briefflow_app`
   - `briefflow_nginx`
   - `briefflow_redis`

### Status esperado:

| Serviço | Status Inicial | Status Final |
|---------|----------------|--------------|
| app | ⏳ Starting | ✅ Running |
| nginx | ⏳ Starting | ✅ Running |
| redis | ⏳ Starting | ✅ Running |

⚠️ **O serviço app pode levar 2-5 minutos para ficar Running** (fazendo o build)

---

## 5️⃣ Verificar Logs

### No Portainer:

1. Na stack `briefflow`, clique na aba **Services**
2. Clique no serviço `briefflow_app`
3. Clique em **Logs** (no topo)
4. Você verá o progresso do build

### O que esperar nos logs:

#### Com Dockerfile:
```
Step 1/10 : FROM node:20-alpine AS builder
...
Step 8/10 : RUN npx tsx script/build.ts
✅ Building client...
✅ Building server...
...
✅ Server running on port 5000
```

#### Com Build no Container:
```
📦 Instalando dependências...
added 1234 packages in 45s
🧹 Limpando diretório dist...
🏗️ Executando build...
✅ building client...
✅ building server...
🚀 Iniciando servidor...
Server running on port 5000
```

---

## 6️⃣ Verificar se Funcionou

### No Portainer:

1. Vá em **Containers** (no menu lateral)
2. Procure por `briefflow_app`
3. O status deve ser **running** 🟢
4. Clique no container → veja as portas: `0.0.0.0:5001->5000/tcp`

### Testar via terminal:

```bash
# Testar health endpoint
curl http://localhost:5001/api/health

# Deve retornar algo como:
{
  "service": "Content-Generator API",
  "status": "healthy",
  "timestamp": "2025-02-10T..."
}
```

### Testar no navegador:
- **App**: http://seu-servidor:5001
- **Nginx**: http://seu-servidor:8082

---

## ❌ Troubleshooting - Se Der Erro

### Erro: "undefined network brieflow-network"

**Causa:** Rede não existe no Swarm

**Solução no Portainer:**
1. Vá em **Networks** (menu lateral)
2. Clique em **Add network**
3. **Name**: `brieflow-network`
4. **Driver**: Selecione `overlay`
5. **Attachable**: Marque como `Yes`
6. Clique em **Create the network**
7. Volte e tente deployar novamente

---

### Erro: "Cannot connect to the Docker daemon"

**Causa:** Docker Swarm não está ativo

**Solução no terminal:**
```bash
# No servidor, execute:
docker swarm init
```

---

### Erro: "Container app keeps restarting"

**Solução 1 - Ver logs:**
1. No Portainer → Containers → briefflow_app → Logs
2. Procure por mensagens de erro

**Solução 2 - Aumentar recursos:**
1. No Portainer → Stacks → briefflow → Editor
2. Encontre a seção `resources` do serviço `app`
3. Altere:
   ```yaml
   limits:
     memory: 4G  # Era 2G
   ```
4. Clique em **Update the stack**

---

### Erro: "No space left on device"

**Solução:**
```bash
# No terminal:
docker system prune -a -f

# Ou mais agressivo:
docker system prune -a --volumes -f
```

---

## 🔄 Como Atualizar uma Stack Existente

### Método 1 - Via Editor (Recomendado)

1. Vá em **Stacks** → clique em `briefflow`
2. Clique em **Editor**
3. Faça as alterações necessárias
4. Clique em **Update the stack**
5. Selecione **Yes** para re-deployar

### Método 2 - Via Arquivo

1. Clique em **Update the stack**
2. Cole o novo conteúdo do docker-compose
3. Clique em **Deploy the stack**

---

## 📊 Dashboard do Portainer

### Onde verificar status:

| Página | O que ver |
|--------|-----------|
| **Dashboard** | Visão geral de todos os containers |
| **Containers** | Status de cada container |
| **Images** | Imagens Docker disponíveis |
| **Volumes** | Volumes e dados |
| **Networks** | Redes configuradas |
| **Services** | Serviços Swarm |

---

## 🎯 Checklist Sucesso

Antes de finalizar, verifique:

- [ ] Stack `briefflow` aparece na lista
- [ ] Status dos serviços é "Running"
- [ ] Containers estão "Up" (verde)
- [ ] Logs não mostram erros
- [ ] Portas estão mapeadas corretamente
- [ ] Health check passa (curl /api/health)
- [ ] Frontend carrega no navegador

---

## 🆘 Não Consigo Fazer o Deploy?

### Checklist rápido:

1. ✅ Docker Swarm está ativo?
   ```bash
   docker info | grep Swarm
   # Deve mostrar: Swarm: active
   ```

2. ✅ Rede `brieflow-network` existe?
   ```bash
   docker network ls | grep brieflow
   ```

3. ✅ Diretório `/opt/brieflow` existe?
   ```bash
   ls -la /opt/brieflow/
   ```

4. ✅ Arquivos necessários existem?
   ```bash
   ls -la /opt/brieflow/{package.json,vite.config.ts,tsconfig.json}
   ```

5. ✅ Espaço em disco disponível?
   ```bash
   df -h
   # Precisa de pelo menos 5GB livres
   ```

6. ✅ Variáveis de ambiente configuradas no Portainer?

7. ✅ Dockerfile.production existe (se usando opção Dockerfile)?
   ```bash
   ls -la /opt/brieflow/Dockerfile.production
   ```

---

## 📱 Atalhos do Portainer

| Atalho | Ação |
|--------|------|
| `Ctrl + K` | Busca rápida |
| `G + S` | Ir para Stacks |
| `G + C` | Ir para Containers |
| `G + I` | Ir para Images |

---

## 🎓 Vídeo/Tutorial (Caso tenha)

[Inserir link de vídeo tutorial se disponível]

---

## 📞 Ajuda Adicional

Se ainda estiver com problemas:

1. **Documentação oficial**: https://docs.portainer.io/
2. **Guia de emergência**: `PLAN/EMERGENCY_GUIDE.md`
3. **Debug script**: `PLAN/debug_container.sh`

---

## ✨ Dicas de Ouro

💡 **Dica 1:** Sempre faça backup antes de alterar
```bash
docker service ps briefflow_app > backup.txt
```

💡 **Dica 2:** Use a opção Dockerfile para produção (mais rápido e estável)

💡 **Dica 3:** Dê tempo suficiente para o build - não fique reiniciando!

💡 **Dica 4:** Verifique os logs se algo der errado - eles contam a história completa

💡 **Dica 5:** Use o botão "Recreate" em Containers para reiniciar sem mudar configuração
