# 🚨 Guia de Emergência - Docker Compose

## ⚡ Problema: Container app não fica de pé

### Solução Rápida (Recomendada)

#### 1. Usar versão com Dockerfile (MAIS ESTÁVEL)

```bash
# No servidor, execute:

# 1. Verificar se Dockerfile.production existe
ls -la /opt/brieflow/Dockerfile.production

# 2. Se não existir, criar a pasta e copiar
mkdir -p /opt/brieflow
# (Copiar o arquivo Dockerfile.production para /opt/brieflow/)

# 3. Remover stack antiga
docker stack rm briefflow

# 4. Aguardar 30 segundos
sleep 30

# 5. Deployar nova versão
docker stack deploy -c /opt/brieflow/PLAN/docker-compose.portainer-dockerfile.yml briefflow
```

#### 2. Verificar se funcionou

```bash
# Ver serviços
docker service ls | grep briefflow

# Ver logs (pode demorar 2-3 minutos para build)
docker service logs briefflow_app -f

# Ver containers
docker ps -a | grep briefflow
```

---

## 🔍 Se continuar falhando, use o debug

### Opção A: Debug Manual

```bash
# 1. Encontrar o container
docker ps -a | grep briefflow

# 2. Entrar no container
docker exec -it <container_id> sh

# 3. Verificar estrutura
ls -la /app
ls -la /app/node_modules
ls -la /app/client
ls -la /app/server

# 4. Tentar build manual
cd /app
npx tsx script/build.ts
```

### Opção B: Usar Script de Debug

```bash
# Executar script de debug no container
docker exec -it $(docker ps -q -f name=briefflow_app) sh -c "sh /opt/brieflow/PLAN/debug_container.sh"
```

---

## 🛠️ Soluções Alternativas

### Solução 1: Aumentar Memória

Se o erro for de memória:

No docker-compose, altere:
```yaml
resources:
  limits:
    memory: 4G  # Era 2G
```

Re-deploy:
```bash
docker stack deploy -c docker-compose.portainer-dockerfile.yml briefflow
```

### Solução 2: Usar Build Simples

Se o Dockerfile não funcionar:

```bash
# Usar versão simples
docker stack rm briefflow
sleep 30
docker stack deploy -c /opt/brieflow/PLAN/docker-compose.portainer-simple.yml briefflow
```

### Solução 3: Verificar Arquivos

```bash
# No host, verificar se arquivos existem
ls -la /opt/brieflow/
ls -la /opt/brieflow/package.json
ls -la /opt/brieflow/script/build.ts
ls -la /opt/brieflow/server/
ls -la /opt/brieflow/client/

# Se faltar arquivos, copiar do projeto
cp -r /path/to/Content-Generator/* /opt/brieflow/
```

---

## 📋 Comandos Úteis

### Ver tudo em tempo real
```bash
watch -n 2 'docker service ls && echo "---" && docker ps'
```

### Ver recursos
```bash
docker stats briefflow_app
```

### Ver logs de todos os serviços
```bash
docker service logs briefflow_app -f --tail 50 &
docker service logs briefflow_nginx -f --tail 50 &
docker service logs briefflow_redis -f --tail 50 &
```

### Reiniciar apenas o app
```bash
docker service scale briefflow_app=0
docker service scale briefflow_app=1
```

### Limpar tudo
```bash
docker stack rm briefflow
docker system prune -a -f
```

---

## ⏱️ Tempos Esperados

| Ação | Tempo |
|------|-------|
| Build no Dockerfile | 3-5 min |
| Build no Container | 2-3 min |
| Startup do servidor | 5-10 seg |
| Total (Dockerfile) | 3-6 min |
| Total (Container) | 2-4 min |

⚠️ **Dê tempo suficiente!** Não fique reiniciando antes do build terminar.

---

## 🎯 Checklist de Sucesso

Depois de deployar, verifique:

- [ ] Todos os serviços estão rodando: `docker service ls`
- [ ] Container app está UP: `docker ps`
- [ ] Sem erros nos logs: `docker service logs briefflow_app --tail 100`
- [ ] Health check passa: `curl http://localhost:5001/api/health`
- [ ] Frontend carrega: `curl http://localhost:5001`

---

## 🆘 Se nada funcionar

### Última solução: Docker Compose Local (não Swarm)

```bash
# No host, criar docker-compose.local.yml
cat > /opt/brieflow/docker-compose.local.yml << 'EOF'
version: '3.8'

services:
  app:
    image: node:20-alpine
    working_dir: /app
    command: sh -c "npm install --include=dev && npx tsx script/build.ts && npx tsx server/production-server.ts"
    volumes:
      - .:/app
    ports:
      - "5001:5000"
    environment:
      NODE_ENV: production
      PORT: 5000
      NODE_OPTIONS: --max-old-space-size=2048
EOF

# Subir
cd /opt/brieflow
docker-compose -f docker-compose.local.yml up --build
```

---

## 📞 Logs Completos

### Pegar logs completos para análise
```bash
# Logs do app
docker service logs briefflow_app > app_logs.txt

# Logs do nginx
docker service logs briefflow_nginx > nginx_logs.txt

# Logs do redis
docker service logs briefflow_redis > redis_logs.txt

# Inspeção do serviço
docker service inspect briefflow_app > service_inspect.json

# Inspeção do container
docker inspect $(docker ps -q -f name=briefflow_app) > container_inspect.json
```

Envie esses logs para análise se continuar com problemas.
