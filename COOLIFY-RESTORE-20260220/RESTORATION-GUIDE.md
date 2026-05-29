# Guia Completo de Restauração - Supabase + BriefFlow + MinIO

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Fase 1: Preparação Local](#fase-1-preparação-local)
4. [Fase 2: Transferência para VPS](#fase-2-transferência-para-vps)
5. [Fase 3: Restauração de Volumes](#fase-3-restauração-de-volumes)
6. [Fase 4: Deploy no Coolify](#fase-4-deploy-no-coolify)
7. [Fase 5: Verificação e Testes](#fase-5-verificação-e-testes)
8. [Troubleshooting](#troubleshooting)
9. [Checklist Final](#checklist-final)

---

## 🎯 Visão Geral

Este guia explica como restaurar completamente o stack de aplicações do backup:

- **Supabase Full** (12 serviços)
  - PostgreSQL 15.8.1.060
  - GoTrue (Auth)
  - PostgREST (API)
  - Studio (Interface Web)
  - Kong (API Gateway)
  - Meta (Admin API)
  - Realtime (WebSocket)
  - Storage API
  - Edge Functions
  - Analytics (Logflare)
  - Supavisor (PgBouncer)
  - Vector (Log Collector)

- **MinIO** (1 serviço)
  - S3 Storage

- **BriefFlow** (2 serviços)
  - Node.js 20 + Express + React
  - Redis 7

**Total: 15 serviços**

---

## 📦 Pré-requisitos

### Hardware Mínimo

- **RAM:** 6GB (mínimo), 8GB (recomendado)
- **CPU:** 2 vCPUs (mínimo), 4 vCPUs (recomendado)
- **Armazenamento:** 5GB (mínimo), 10GB (recomendado)

### Software Necessário

- **VPS:** Ubuntu/Debian Linux
- **Docker:** >= 20.10
- **Docker Compose:** >= 2.0
- **Coolify:** Instalado e configurado
- **Acesso SSH:** à VPS
- **SCP:** para transferência de arquivos

### Domínios Configurados

| Domínio | Serviço | Porta |
|---------|---------|-------|
| supa.agenciatouch.com.br | Supabase Kong | 8000 |
| supa-studio.agenciatouch.com.br | Supabase Studio | 3000 |
| s3.agenciatouch.com.br | MinIO API | 9000 |
| minio.agenciatouch.com.br | MinIO Console | 9001 |
| brieflow.agenciatouch.com.br | BriefFlow | 8081 |

> **Nota:** Se não tiver esses domínios, você pode usar subdomínios do Coolify ou IPs diretos.

---

## 💻 Fase 1: Preparação Local

### Passo 1.1: Localizar o Backup

O backup está em:
```
C:\Users\gmora\Desktop\backup_completo_20260219\
```

### Passo 1.2: Criar Pasta de Transferência

**No Windows PowerShell:**

```powershell
# Criar pasta organizada
New-Item -ItemType Directory -Path "C:\Users\gmora\Desktop\restore_backup_20260220" -Force

# Criar subpastas
New-Item -ItemType Directory -Path "C:\Users\gmora\Desktop\restore_backup_20260220\supabase" -Force
New-Item -ItemType Directory -Path "C:\Users\gmora\Desktop\restore_backup_20260220\minio" -Force
New-Item -ItemType Directory -Path "C:\Users\gmora\Desktop\restore_backup_20260220\briefflow" -Force
New-Item -ItemType Directory -Path "C:\Users\gmora\Desktop\restore_backup_20260220\scripts" -Force
```

### Passo 1.3: Copiar Dados do Supabase

```powershell
# Copiar volumes do Supabase
Copy-Item -Path "C:\Users\gmora\Desktop\backup_completo_20260219\root\supabase\docker\volumes" -Destination "C:\Users\gmora\Desktop\restore_backup_20260220\supabase\volumes" -Recurse

# Copiar arquivo de configuração do Supabase
Copy-Item -Path "C:\Users\gmora\Desktop\backup_completo_20260219\root\supabase.yaml" -Destination "C:\Users\gmora\Desktop\restore_backup_20260220\supabase\"
```

### Passo 1.4: Copiar Dados do MinIO

```powershell
# Copiar volumes do MinIO
Copy-Item -Path "C:\Users\gmora\Desktop\backup_completo_20260219\var\lib\docker\volumes\minio_data" -Destination "C:\Users\gmora\Desktop\restore_backup_20260220\minio" -Recurse

# Copiar configuração do MinIO
Copy-Item -Path "C:\Users\gmora\Desktop\backup_completo_20260219\root\minio.yaml" -Destination "C:\Users\gmora\Desktop\restore_backup_20260220\minio\"
```

### Passo 1.5: Copiar Dados do BriefFlow

```powershell
# Copiar banco SQLite
Copy-Item -Path "C:\Users\gmora\Desktop\backup_completo_20260219\var\lib\docker\volumes\briefflow_app_work\_data\data\briefflow.db" -Destination "C:\Users\gmora\Desktop\restore_backup_20260220\briefflow\"
```

### Passo 1.6: Colocar Scripts

Copie os 4 arquivos que foram gerados:
- `docker-compose.full-stack.yaml`
- `restore-volumes.sh`
- `verify-backup.sh`
- `.env.creds` (opcional)

Para:
```
C:\Users\gmora\Desktop\restore_backup_20260220\scripts\
```

### Passo 1.7: Verificar Estrutura Final

A estrutura deve ficar assim:

```
restore_backup_20260220\
├── supabase\
│   ├── volumes\
│   │   ├── db\              ← PostgreSQL completo
│   │   ├── api\             ← Kong config
│   │   ├── storage\         ← Storage data
│   │   ├── functions\       ← Edge functions
│   │   ├── pooler\          ← PgBouncer config
│   │   └── logs\            ← Vector config
│   └── supabase.yaml        ← Configuração
├── minio\
│   ├── minio_data\          ← Dados do MinIO
│   └── minio.yaml           ← Configuração
├── briefflow\
│   └── briefflow.db         ← SQLite BriefFlow
└── scripts\
    ├── docker-compose.full-stack.yaml
    ├── restore-volumes.sh
    ├── verify-backup.sh
    └── .env.creds
```

### Passo 1.8: Verificar Tamanho dos Dados

**No Windows PowerShell:**

```powershell
# Verificar tamanho total
Get-ChildItem "C:\Users\gmora\Desktop\restore_backup_20260220" -Recurse | Measure-Object -Property Length -Sum

# Verificar tamanho de cada pasta
Get-ChildItem "C:\Users\gmora\Desktop\restore_backup_20260220" | Select-Object Name, @{Name="Size(MB)";Expression={[math]::Round((Get-ChildItem $_.FullName -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB, 2)}}
```

**Tamanhos esperados:**
- Supabase: ~127MB
- MinIO: ~81KB
- BriefFlow: ~44KB
- Scripts: ~100KB
- **Total: ~128MB**

---

## 🚀 Fase 2: Transferência para VPS

### Passo 2.1: Enviar Arquivos para a VPS

**Via SCP (Git Bash ou PowerShell):**

```bash
scp -r "C:\Users\gmora\Desktop\restore_backup_20260220" \
    SEU_USUARIO@IP_VPS:/tmp/restore_backup_20260220
```

**Via WinSCP ou FileZilla:**
1. Conecte na VPS
2. Navegue para `/tmp/`
3. Crie pasta `restore_backup_20260220`
4. Arraste toda a pasta `restore_backup_20260220` do Windows

### Passo 2.2: Verificar Transferência

Conecte na VPS via SSH:

```bash
ssh SEU_USUARIO@IP_VPS

# Verificar estrutura
ls -la /tmp/restore_backup_20260220/
ls -la /tmp/restore_backup_20260220/supabase/
ls -la /tmp/restore_backup_20260220/minio/
ls -la /tmp/restore_backup_20260220/briefflow/
ls -la /tmp/restore_backup_20260220/scripts/

# Verificar tamanho dos bancos
du -sh /tmp/restore_backup_20260220/supabase/volumes/db/data
du -sh /tmp/restore_backup_20260220/briefflow/briefflow.db
```

**Tamanhos esperados:**
- Supabase PostgreSQL: ~127MB
- BriefFlow SQLite: ~44KB

---

## 🔧 Fase 3: Restauração de Volumes

### Passo 3.1: Dar Permissão de Execução aos Scripts

```bash
cd /tmp/restore_backup_20260220/scripts

# Dar permissão de execução
chmod +x restore-volumes.sh
chmod +x verify-backup.sh
```

### Passo 3.2: Executar Script de Restauração

```bash
# Executar script
sudo ./restore-volumes.sh
```

O script irá:
1. Criar estrutura de volumes em `/opt/coolify/volumes/`
2. Restaurar dados do Supabase
3. Restaurar dados do MinIO
4. Restaurar dados do BriefFlow
5. Ajustar permissões

### Passo 3.3: Verificar Resultados

```bash
# Verificar estrutura criada
ls -la /opt/coolify/volumes/

# Verificar Supabase
ls -la /opt/coolify/volumes/supabase/
du -sh /opt/coolify/volumes/supabase/db_data

# Verificar MinIO
ls -la /opt/coolify/volumes/minio/
du -sh /opt/coolify/volumes/minio/data

# Verificar BriefFlow
ls -la /opt/coolify/volumes/briefflow/
ls -la /opt/coolify/volumes/briefflow/data/briefflow.db
```

### Passo 3.4: Executar Script de Verificação

```bash
cd /tmp/restore_backup_20260220/scripts

# Executar verificação
sudo ./verify-backup.sh
```

O script irá:
1. Verificar estrutura de volumes
2. Verificar dados do Supabase
3. Verificar dados do MinIO
4. Verificar dados do BriefFlow
5. Verificar permissões
6. Verificar configuração de rede
7. Mostrar resumo final

### Passo 3.5: Corrigir Permissões (se necessário)

Se a verificação mostrar erros de permissão:

```bash
# Supabase PostgreSQL
sudo chown -R 999:999 /opt/coolify/volumes/supabase/db_data
sudo chmod -R 750 /opt/coolify/volumes/supabase/db_data

# MinIO
sudo chown -R 1000:1000 /opt/coolify/volumes/minio/data
sudo chmod -R 755 /opt/coolify/volumes/minio/data

# BriefFlow
sudo chown -R 1000:1000 /opt/coolify/volumes/briefflow/data
sudo chmod -R 755 /opt/coolify/volumes/briefflow/data
```

---

## 🐳 Fase 4: Deploy no Coolify

### Passo 4.1: Preparar Docker Compose no Coolify

#### Opção A: Via Painel do Coolify

1. Acesse o painel do Coolify
2. Crie novo serviço "Docker Compose"
3. Selecione:
   - **Fonte:** Upload arquivo ou repositório
   - **Arquivo:** `docker-compose.full-stack.yaml`
4. Clique em "Create Service"

#### Opção B: Via CLI no Servidor

Se o Coolify usa repositório Git:

```bash
# Navegar para diretório do repositório
cd /path/to/repo

# Copiar arquivo
cp /tmp/restore_backup_20260220/scripts/docker-compose.full-stack.yaml .

# Fazer commit e push
git add docker-compose.full-stack.yaml
git commit -m "Add docker-compose full stack"
git push origin main
```

### Passo 4.2: Configurar Environment Variables

No painel do Coolify, configure as seguintes variáveis de ambiente:

**IMPORTANTE:** Marque todas as variáveis como **"Available at Runtime"**

#### Supabase

```bash
POSTGRES_PASSWORD=05289b91561c68fa5ee9a90a7cbc42e3
JWT_SECRET=942db76077ac142b3a2e4850e5e2d57213590e85
SUPABASE_URL=https://supa.agenciatouch.com.br
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0._G0caHkMnfr_HyJR9knteSCT0H9q3tDO5pL3AUb2mic
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3MTUwNTA4MDAsCiAgImV4cCI6IDE4NzI4MTcyMDAKfQ.v61ZT_CkG8YGYa9H1MXV2M1ghvMpeYXYsiBp8DowiZY
LOGFLARE_API_KEY=ebb73a7ca5e3f6ce5235e6bf4d966925
LOGFLARE_PUBLIC_ACCESS_TOKEN=88dde86b00341ba673201ebca897ce66
LOGFLARE_PRIVATE_ACCESS_TOKEN=ebb73a7ca5e3f6ce5235e6bf4d966925
SECRET_KEY_BASE=cdade5f28f76847b12fadb5d28f1e3dab11335c78edd11131ff88932ac5a47f7
VAULT_ENC_KEY=2WckCAOWmpQXT0/UWJdHLqNQQXCXp6nR
```

#### MinIO

```bash
MINIO_ROOT_USER=gabriel
MINIO_ROOT_PASSWORD=G96l207x0122m@
MINIO_CONSOLE_URL=https://minio.agenciatouch.com.br
MINIO_SERVER_URL=https://s3.agenciatouch.com.br
MINIO_REGION=eu-south
AWS_ACCESS_KEY_ID=LFFAZDNE8ANYBZ9FXV46
AWS_SECRET_ACCESS_KEY=FaeIbUhU8tIOOUOP9KDeL3IKdZ4XiQyy1RPxxwdF
MINIO_BUCKET=supabase
```

#### BriefFlow

```bash
NODE_ENV=production
PORT=5000
BRIEFTLOW_PORT=8081
JWT_SECRET=briefflow_jwt_secret_2024_secure_random_abc123
SESSION_SECRET=briefflow_session_secret_2024_secure_random_xyz456
FRONTEND_URL=https://brieflow.agenciatouch.com.br
OPENAI_API_KEY=sk-proj-sua-chave-openai-aqui
```

#### Outras Variáveis

```bash
# Supabase Studio
STUDIO_PORT=3000
STUDIO_ORG_NAME=OrionDesign
STUDIO_PROJECT_NAME=SetupOrion

# Kong
KONG_PORT=8000
KONG_USERNAME=gabriel
KONG_PASSWORD=G96l207x0122m@

# MinIO
MINIO_API_PORT=9000
MINIO_CONSOLE_PORT=9001

# Redis
REDIS_PORT=6379

# Optional
ANTHROPIC_API_KEY=sua_chave_anthropic
SCRAPER_API_URL=http://localhost:8000
```

### Passo 4.3: Mapear Volumes no Docker Compose

No arquivo `docker-compose.full-stack.yaml`, verifique se os volumes estão configurados corretamente:

```yaml
volumes:
  # Supabase PostgreSQL
  supabase_db_data:
    driver_opts:
      type: none
      o: bind
      device: /opt/coolify/volumes/supabase/db_data

  # MinIO
  minio_data:
    driver_opts:
      type: none
      o: bind
      device: /opt/coolify/volumes/minio/data

  # BriefFlow
  briefflow_data:
    driver_opts:
      type: none
      o: bind
      device: /opt/coolify/volumes/briefflow/data
```

### Passo 4.4: Configurar Domínios e Portas

No painel do Coolify:

1. **Supabase:**
   - Domínio: `supa.agenciatouch.com.br`
   - Porta: 8000
   - SSL: LetsEncrypt (automático)

2. **Supabase Studio:**
   - Domínio: `supa-studio.agenciatouch.com.br`
   - Porta: 3000
   - SSL: LetsEncrypt (automático)

3. **MinIO API:**
   - Domínio: `s3.agenciatouch.com.br`
   - Porta: 9000
   - SSL: LetsEncrypt (automático)

4. **MinIO Console:**
   - Domínio: `minio.agenciatouch.com.br`
   - Porta: 9001
   - SSL: LetsEncrypt (automático)

5. **BriefFlow:**
   - Domínio: `brieflow.agenciatouch.com.br`
   - Porta: 8081
   - SSL: LetsEncrypt (automático)

### Passo 4.5: Fazer Deploy

1. No painel do Coolify, clique em "Deploy"
2. Aguarde o build e o início dos containers
3. Verifique os logs para erros

---

## ✅ Fase 5: Verificação e Testes

### Passo 5.1: Verificar Status dos Containers

```bash
# Ver containers rodando
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Ver containers específicos
docker ps | grep supabase
docker ps | grep minio
docker ps | grep briefflow
```

**Esperado: 15 containers rodando**

### Passo 5.2: Verificar Logs

```bash
# Ver logs do Supabase
docker logs supabase-db -f
docker logs supabase-auth -f
docker logs supabase-kong -f

# Ver logs do MinIO
docker logs minio -f

# Ver logs do BriefFlow
docker logs briefflow-app -f

# Ver logs com detalhes
docker logs supabase-db --tail 100
```

### Passo 5.3: Testar Endpoints

```bash
# Testar Supabase Kong (API Gateway)
curl http://localhost:8000/

# Testar Supabase Auth
curl http://localhost:8000/auth/v1/user

# Testar Supabase Studio
curl http://localhost:3000/

# Testar MinIO API
curl http://localhost:9000/minio/health/live

# Testar BriefFlow
curl http://localhost:8081/api/health
```

### Passo 5.4: Acessar Interfaces Web

1. **Supabase Studio:**
   - URL: https://supa-studio.agenciatouch.com.br
   - Usuário: admin
   - Senha: configurada no backup

2. **MinIO Console:**
   - URL: https://minio.agenciatouch.com.br
   - Usuário: `gabriel`
   - Senha: `G96l207x0122m@`

3. **BriefFlow:**
   - URL: https://brieflow.agenciatouch.com.br
   - Login: via Supabase Auth

### Passo 5.5: Verificar Dados Restaurados

#### Supabase Studio

1. Acesse o Supabase Studio
2. Navegue para "Table Editor"
3. Verifique se as tabelas existem
4. Verifique se há dados nas tabelas

#### BriefFlow

1. Acesse o BriefFlow
2. Faça login com sua conta Supabase
3. Verifique se os clientes aparecem
4. Verifique se as sources estão lá
5. Verifique se os briefs e contents estão visíveis

### Passo 5.6: Testar Funcionalidades

- Criar novo cliente no BriefFlow
- Adicionar nova source
- Gerar um brief
- Consultar contents
- Testar autenticação Supabase
- Testar upload no MinIO (se aplicável)

---

## 🔧 Troubleshooting

### Erro: "Permission denied"

**Solução:**
```bash
# Reajustar permissões
sudo chown -R 999:999 /opt/coolify/volumes/supabase/db_data
sudo chmod -R 750 /opt/coolify/volumes/supabase/db_data

sudo chown -R 1000:1000 /opt/coolify/volumes/minio/data
sudo chmod -R 755 /opt/coolify/volumes/minio/data

sudo chown -R 1000:1000 /opt/coolify/volumes/briefflow/data
sudo chmod -R 755 /opt/coolify/volumes/briefflow/data
```

### Erro: "Container não inicia"

**Solução:**
```bash
# Ver logs do container
docker logs NOME_CONTAINER

# Ver detalhes do container
docker inspect NOME_CONTAINER

# Reiniciar container
docker restart NOME_CONTAINER
```

### Erro: "Porta já em uso"

**Solução:**
```bash
# Verificar o que está usando a porta
sudo lsof -i :PORTA

# Matar processo se necessário
sudo kill -9 PID

# Ou mudar a porta no docker-compose
```

### Erro: "Variáveis de ambiente não definidas"

**Solução:**
1. Verifique se todas as variáveis estão configuradas no Coolify
2. Verifique se estão marcadas como "Available at Runtime"
3. Fazer redeploy

### Erro: "Banco de dados não encontrado"

**Solução:**
```bash
# Verificar se os dados foram restaurados
ls -la /opt/coolify/volumes/supabase/db_data/

# Verificar permissões
stat /opt/coolify/volumes/supabase/db_data/

# Re-executar script de restauração
sudo ./restore-volumes.sh
```

### Erro: "MinIO não conecta"

**Solução:**
```bash
# Verificar se os dados do MinIO foram restaurados
ls -la /opt/coolify/volumes/minio/data/

# Verificar logs
docker logs minio

# Verificar conexão
curl http://localhost:9000/minio/health/live
```

### Erro: "BriefFlow não acessa dados"

**Solução:**
```bash
# Verificar se o SQLite existe
ls -la /opt/coolify/volumes/briefflow/data/briefflow.db

# Verificar permissões
stat /opt/coolify/volumes/briefflow/data/briefflow.db

# Verificar logs
docker logs briefflow-app

# Acessar container e verificar
docker exec -it briefflow-app sh
ls -la /app/data/
sqlite3 /app/data/briefflow.db ".tables"
```

---

## ✅ Checklist Final

### Fase 1: Preparação Local

- [ ] Backup localizado
- [ ] Pasta restore_backup_20260220 criada
- [ ] Dados do Supabase copiados
- [ ] Dados do MinIO copiados
- [ ] Dados do BriefFlow copiados
- [ ] Scripts copiados
- [ ] Estrutura verificada
- [ ] Tamanhos verificados

### Fase 2: Transferência

- [ ] Arquivos enviados para VPS
- [ ] Estrutura verificada na VPS
- [ ] Tamanhos verificados na VPS
- [ ] Permissões dos scripts ajustadas

### Fase 3: Restauração

- [ ] Script restore-volumes.sh executado
- [ ] Estrutura de volumes criada
- [ ] Dados do Supabase restaurados
- [ ] Dados do MinIO restaurados
- [ ] Dados do BriefFlow restaurados
- [ ] Permissões ajustadas
- [ ] Script verify-backup.sh executado
- [ ] Verificação concluída com sucesso

### Fase 4: Deploy

- [ ] Docker Compose configurado no Coolify
- [ ] Environment variables configuradas
- [ ] Volumes mapeados corretamente
- [ ] Domínios configurados
- [ ] SSL configurado
- [ ] Deploy executado

### Fase 5: Verificação

- [ ] Containers iniciados com sucesso
- [ ] Logs sem erros
- [ ] Endpoints respondendo
- [ ] Supabase Studio acessível
- [ ] MinIO Console acessível
- [ ] BriefFlow acessível
- [ ] Dados restaurados visíveis
- [ ] Funcionalidades testadas

---

## 📞 Suporte

Se encontrar problemas:

1. **Verificar logs:** `docker logs NOME_CONTAINER`
2. **Consultar troubleshooting:** Veja se há erro similar
3. **Verificar permissões:** Reajuste se necessário
4. **Re-executar scripts:** Restauração e verificação

---

## 📚 Referências

- **Supabase Docs:** https://supabase.com/docs
- **MinIO Docs:** https://min.io/docs
- **Coolify Docs:** https://coolify.io/docs
- **Docker Compose:** https://docs.docker.com/compose/

---

**Última atualização:** Fev 2026
**Versão:** 1.0
**Compatível com:** Supabase Self-Hosted, MinIO, BriefFlow, Coolify
