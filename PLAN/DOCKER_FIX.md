# Diagnóstico: Container briefflow-app não inicia

## Problema
Container não está rodando ou inacessível. Docker não responde.

## Causas Possíveis

### 1. Docker Daemon (Windows + WSL2)
```bash
# Verificar se Docker está rodando
wsl -d docker ps -a

# Se não estiver, reiniciar:
wsl -d docker restart

# Ou verificar no PowerShell:
Get-Service docker | Select-Object Status
```

### 2. Caminhos do Volume no docker-compose
O seu docker-compose usa:
```yaml
command: >
  sh -c "
    cp /opt/brieflow/package*.json ./ &&
    cp -r /opt/brieflow/. . &&
    rm -rf dist &&
    npx tsx script/build.ts &&
    npx tsx server/production-server.ts
  "
```

Isso copia tudo para `/app` mas o workdir pode não estar correto.

**Solução A - Adicionar workdir ao docker-compose:**
```yaml
app:
  working_dir: /app
  command: >
    sh -c "
      cp /opt/brieflow/package*.json ./ &&
      npx tsx script/build.ts &&
      npx tsx server/production-server.ts
    "
```

### 3. Variáveis de Ambiente
O container precisa saber onde está o Supabase:

```yaml
app:
  environment:
    - SUPABASE_URL=https://supa.agenciatouch.com.br
    - SUPABASE_ANON_KEY=seu_anon_key_aqui
    - SUPABASE_SERVICE_KEY=seu_service_key_aqui
```

### 4. Porta 5000 Ocupada

```bash
# Verificar se algo está usando a porta 5000
netstat -ano | findstr :5000
# ou
lsof -i :5000
```

## Soluções

### Opção 1: Adicionar workdir ao docker-compose (RECOMENDADO)

Edite o docker-compose na VPS e adicione:
```yaml
app:
  working_dir: /app
```

### Opção 2: Rodar build manualmente antes do start

```bash
cd /opt/brieflow
npm install
npm run build
# Depois o container só precisa rodar o server
```

### Opção 3: Verificar logs do container

```bash
docker logs briefflow-app
# ou
docker logs briefflow-app --tail 100
```

### Opção 4: Reconstruir container

```bash
cd /root/supabase
docker-compose down
docker-compose up -d --build
```

## Passo a Passo

1. Acessar VPS:
   ```bash
   ssh root@185.216.203.73
   ```

2. Entrar na pasta do projeto:
   ```bash
   cd /root/supabase
   # ou onde está o docker-compose
   ```

3. Verificar o arquivo docker-compose:
   ```bash
   cat docker-compose.yml
   # Procurar pelo service "app"
   ```

4. Adicionar working_dir (se necessário):
   ```bash
   nano docker-compose.yml
   # Adicionar dentro do serviço "app":
   #   working_dir: /app
   # Salvar: Ctrl+O, Enter, Ctrl+X
   ```

5. Verificar variáveis de ambiente:
   ```bash
   cat .env | grep SUPABASE
   ```

6. Reiniciar container:
   ```bash
   docker-compose restart app
   ```

7. Verificar logs:
   ```bash
   docker logs -f briefflow-app
   ```

8. Testar:
   ```bash
   curl http://localhost:5000/api/health
   curl http://185.216.203.73:5000/api/health
   ```

## Arquivo docker-compose Esperado

O service "app" deve ter algo como:
```yaml
app:
  image: node:20-alpine
  working_dir: /app  # <-- IMPORTANTE
  command: >
    sh -c "
      npm install &&
      npm run build &&
      npx tsx server/production-server.ts
    "
  environment:
    - NODE_ENV=production
    - PORT=5000
    - SUPABASE_URL=https://supa.agenciatouch.com.br
    - SUPABASE_ANON_KEY=...  # DO .env
    - SUPABASE_SERVICE_KEY=...  # DO .env
  ports:
    - "5000:5000"
  volumes:
    - /opt/brieflow:/opt/brieflow:ro
    - app_work:/app
  networks:
    - touchNet
```

## Arquivo .env

Certifique-se que `.env` tem:
```bash
SUPABASE_URL=https://supa.agenciatouch.com.br
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgres://postgres:05289b91561c68fa5ee9a90a7cbc42e3@db:5432/postgres
NODE_ENV=production
PORT=5000
```
