# 🚀 Coolify Restoration Kit - Supabase + BriefFlow + MinIO

Kit completo para restaurar o stack de aplicações no Coolify a partir do backup.

## 📦 O que está incluído

- ✅ **docker-compose.full-stack.yaml** - Docker Compose completo com 15 serviços
- ✅ **restore-volumes.sh** - Script para restaurar volumes do backup
- ✅ **verify-backup.sh** - Script para verificar integridade do backup
- ✅ **RESTORATION-GUIDE.md** - Guia completo passo-a-passo
- ✅ **.env.creds** - Template de credenciais

## 🎯 Visão Rápida

### Serviços a serem restaurados

| Stack | Serviços | Dados |
|-------|----------|-------|
| **Supabase** | 12 serviços | 127MB |
| **MinIO** | 1 serviço | 81KB |
| **BriefFlow** | 2 serviços | 44KB |
| **TOTAL** | **15 serviços** | **~128MB** |

### Domínios

- Supabase: `supa.agenciatouch.com.br`
- Supabase Studio: `supa-studio.agenciatouch.com.br`
- MinIO API: `s3.agenciatouch.com.br`
- MinIO Console: `minio.agenciatouch.com.br`
- BriefFlow: `brieflow.agenciatouch.com.br`

## 📋 Processo em 3 Etapas

### **Etapa 1: Preparação (Windows)**

1. Localizar o backup em `C:\Users\gmora\Desktop\backup_completo_20260219\`
2. Criar pasta `restore_backup_20260220\`
3. Copiar dados do Supabase, MinIO e BriefFlow
4. Colocar os arquivos desta pasta

### **Etapa 2: Transferência (para VPS)**

```bash
scp -r "C:\Users\gmora\Desktop\restore_backup_20260220" \
    SEU_USUARIO@IP_VPS:/tmp/restore_backup_20260220
```

### **Etapa 3: Execução (na VPS)**

```bash
# Acessar VPS
ssh SEU_USUARIO@IP_VPS

# Restaurar volumes
cd /tmp/restore_backup_20260220
sudo ./restore-volumes.sh

# Verificar integridade
sudo ./verify-backup.sh

# Configurar no Coolify
# - Usar docker-compose.full-stack.yaml
# - Configurar environment variables
# - Fazer deploy
```

## 📁 Estrutura Final da Pasta

```
restore_backup_20260220\
├── supabase\              ← Dados do Supabase (127MB)
│   ├── volumes\
│   └── supabase.yaml
├── minio\                 ← Dados do MinIO (81KB)
│   ├── minio_data\
│   └── minio.yaml
├── briefflow\             ← Dados do BriefFlow (44KB)
│   └── briefflow.db
└── scripts\               ← Arquivos fornecidos
    ├── docker-compose.full-stack.yaml
    ├── restore-volumes.sh
    ├── verify-backup.sh
    ├── RESTORATION-GUIDE.md
    └── .env.creds
```

## 🔑 Credenciais Principais

**Supabase:**
```
POSTGRES_PASSWORD: 05289b91561c68fa5ee9a90a7cbc42e3
JWT_SECRET: 942db76077ac142b3a2e4850e5e2d57213590e85
SUPABASE_URL: https://supa.agenciatouch.com.br
```

**MinIO:**
```
MINIO_ROOT_USER: gabriel
MINIO_ROOT_PASSWORD: G96l207x0122m@
```

## ✅ Checklist Rápido

### Fase 1: Preparação
- [ ] Backup localizado
- [ ] Pasta restore_backup criada
- [ ] Dados copiados (Supabase, MinIO, BriefFlow)
- [ ] Scripts copiados

### Fase 2: Transferência
- [ ] Arquivos enviados para VPS
- [ ] Estrutura verificada na VPS

### Fase 3: Execução
- [ ] Scripts com permissão de execução
- [ ] restore-volumes.sh executado
- [ ] verify-backup.sh executado com sucesso

### Fase 4: Deploy
- [ ] Docker Compose configurado no Coolify
- [ ] Environment variables configuradas
- [ ] Deploy realizado

### Fase 5: Verificação
- [ ] Containers rodando
- [ ] Logs sem erros
- [ ] Interfaces acessíveis
- [ ] Dados restaurados visíveis

## 📚 Documentação Completa

Para instruções detalhadas, consulte o arquivo **RESTORATION-GUIDE.md**.

Ele contém:
- Guia passo-a-passo completo
- Troubleshooting detalhado
- Checklist completo
- Verificação de cada componente

## 🎉 Após a Restauração

Você terá:

- ✅ Supabase Full funcionando (12 serviços)
- ✅ MinIO funcionando (S3 Storage)
- ✅ BriefFlow funcionando (app + redis)
- ✅ Todos os dados restaurados
- ✅ Interface web Supabase Studio
- ✅ Interface web MinIO Console
- ✅ Aplicação BriefFlow acessível

## ⚠️ Requisitos Mínimos

- **RAM:** 6GB (mínimo), 8GB (recomendado)
- **CPU:** 2 vCPUs (mínimo), 4 vCPUs (recomendado)
- **Armazenamento:** 5GB (mínimo), 10GB (recomendado)

## 🆘 Problemas?

1. **Verifique logs:** `docker logs NOME_CONTAINER`
2. **Consulte o guia:** RESTORATION-GUIDE.md
3. **Re-execute scripts:** restore-volumes.sh, verify-backup.sh
4. **Verifique permissões:** chown, chmod

---

**Criado em:** Fev 2026
**Versão:** 1.0
**Total de serviços:** 15
**Tamanho total:** ~128MB
