# Docker Compose Portainer - Versões Disponíveis

## 📦 Três Estratégias de Deploy

Foram criadas **3 versões diferentes** do docker-compose para o Portainer, cada uma com uma abordagem diferente:

### 1. **docker-compose.portainer.yml** (Build no Container)
- **Estratégia**: Build no startup do container
- **Vantagens**: Sempre usa código atualizado do `/opt/brieflow`
- **Desvantagens**: Mais lento no startup (2-3 minutos)
- **Uso**: Ideal para desenvolvimento e frequentes atualizações

### 2. **docker-compose.portainer-simple.yml** (Build no Container - Simplificado)
- **Estratégia**: Monta `/opt/brieflow` direto em `/app`
- **Vantagens**: Mais simples, menos cópias de arquivos
- **Desvantagens**: Mais lento no startup
- **Uso**: Alternativa mais simples ao portainer.yml

### 3. **docker-compose.portainer-dockerfile.yml** (Dockerfile) ⭐ RECOMENDADO
- **Estratégia**: Build via Dockerfile (build durante deploy)
- **Vantagens**: Mais rápido no startup, imagens consistentes
- **Desvantagens**: Precisa rebuildar imagem para atualizar código
- **Uso**: Ideal para produção, startups rápidos

---

## ✅ Problemas Corrigidos

### 1. Volume `app_logs:/app/logs` montando dentro de `/app`
**Problema**: Volume montando dentro do diretório de trabalho causava conflitos com o Vite
**Solução**: Volume movido para `/var/log/app` (fora do diretório de build)

### 2. Memória insuficiente para o build
**Problema**: Vite e esbuild consumindo toda a memória disponível
**Solução**: Adicionada variável `NODE_OPTIONS: --max-old-space-size=2048`

### 3. Comando de build otimizado
**Melhorias**:
- `set -e` para parar em qualquer erro
- Logs intermediários para debug
- Limpeza mais agressiva de `node_modules/.cache`
- Build separado do startup do servidor

---

## 🚀 Como Usar

### Opção A: Usar Dockerfile (RECOMENDADO)

```bash
# Copiar Dockerfile.production para /opt/brieflow
cp PLAN/Dockerfile.production /opt/brieflow/Dockerfile.production

# Deploy com Portainer
docker stack deploy -c PLAN/docker-compose.portainer-dockerfile.yml briefflow
```

### Opção B: Build no Container (Portainer Original)

```bash
docker stack deploy -c PLAN/docker-compose.portainer.yml briefflow
```

### Opção C: Build Simplificado

```bash
docker stack deploy -c PLAN/docker-compose.portainer-simple.yml briefflow
```

---

## 📊 Comparação das Versões

| Característica | portainer.yml | portainer-simple.yml | portainer-dockerfile.yml |
|---------------|---------------|---------------------|-------------------------|
| Startup rápido | ❌ (2-3 min) | ❌ (2-3 min) | ✅ (5-10 seg) |
| Atualização de código | ✅ Auto | ✅ Auto | ❌ Rebuild |
| Uso de disco | Alto | Alto | Médio |
| Estabilidade | Média | Alta | Alta |
| Debug fácil | ✅ | ✅ | ❌ |
| Recomendado para | Desenvolvimento | Desenvolvimento | Produção |

---

## 🔧 Configuração de Variáveis

Todas as versões precisam das mesmas variáveis de ambiente:

```env
DB_HOST=postgres
DB_PORT=5432
DB_NAME=seu_database
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
JWT_SECRET=seu_jwt_secret_aqui
SESSION_SECRET=seu_session_secret_aqui
FRONTEND_URL=https://seu-dominio.com
SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_KEY=sua_chave_service
```

### No Portainer

1. Vá em **Stacks** → **Add stack**
2. Nome: `briefflow`
3. Cole o conteúdo do docker-compose
4. Vá em **Environment variables**
5. Adicione as variáveis acima
6. Clique em **Deploy the stack**

---

## 🔍 Debug de Problemas

### Container app não inicia?

#### 1. Verificar logs completos
```bash
docker service logs briefflow_app --tail 200
```

#### 2. Entrar no container para debug
```bash
# Encontrar o container
docker ps -a | grep briefflow

# Entrar no container
docker exec -it <container_id> sh

# Rodar script de debug
sh -c "$(cat /opt/brieflow/PLAN/debug_container.sh)"
```

#### 3. Verificar uso de recursos
```bash
docker stats briefflow_app
```

### Erro de memória?

Aumente o limite no docker-compose:
```yaml
resources:
  limits:
    cpus: '4.0'
    memory: 4G  # Aumentado de 2G
```

### Build falhando?

#### Possíveis causas:
1. **Arquivos faltando em /opt/brieflow**
   ```bash
   ls -la /opt/brieflow/{client,server,script}
   ```

2. **Permissões incorretas**
   ```bash
   chmod -R 755 /opt/brieflow
   ```

3. **Espaço em disco insuficiente**
   ```bash
   df -h
   ```

---

## 🎯 Quando usar cada versão?

### Use `portainer-dockerfile.yml` se:
- ✅ Quer startup rápido
- ✅ Atualiza código raramente
- ✅ Em ambiente de produção
- ✅ Quer builds reproduzíveis

### Use `portainer.yml` se:
- ✅ Atualiza código frequentemente
- ✅ Em ambiente de desenvolvimento
- ✅ Quer debug fácil
- ✅ Não se importa com tempo de startup

### Use `portainer-simple.yml` se:
- ✅ Quer algo mais simples
- ✅ Tem problemas com cópias de arquivos
- ✅ Ambientes com recursos limitados

---

## 🔄 Atualização de Deploy Existente

### 1. Backup do deploy atual
```bash
docker stack ps briefflow > backup_deploy.txt
```

### 2. Remover stack atual
```bash
docker stack rm briefflow
```

### 3. Aguardar remoção completa
```bash
watch docker service ls
```

### 4. Deploy com nova versão
```bash
docker stack deploy -c PLAN/docker-compose.portainer-dockerfile.yml briefflow
```

---

## 📝 Checklist antes do Deploy

- [ ] Docker Swarm ativo: `docker info | grep Swarm`
- [ ] Diretório `/opt/brieflow` existe e tem arquivos
- [ ] Permissões corretas em `/opt/brieflow`
- [ ] Espaço em disco suficiente (mínimo 5GB)
- [ ] Variáveis de ambiente configuradas
- [ ] Portas 5001, 8082, 6380 disponíveis
- [ ] (Para Dockerfile) Dockerfile.production copiado para /opt/brieflow

---

## 🆘 Ajuda

### Script de Debug Automático

Se precisar debugar o container:
```bash
# Copiar script de debug
cp PLAN/debug_container.sh /opt/brieflow/

# Executar no container
docker exec -it $(docker ps -q -f name=briefflow_app) sh -c "sh /opt/brieflow/PLAN/debug_container.sh"
```

### Documentação Adicional

- **Deploy manual**: `PLAN/DEPLOY_MANUAL.md`
- **Correções Docker**: `PLAN/DOCKER_FIX.md`
- **Guia de atualização**: `PLAN/PORTAINER_UPDATE_GUIDE.md`
