# Coolify Deployment Guide

## 🚀 Deploy no Coolify - Instruções Especiais

Este documento contém instruções específicas para fazer o deploy da aplicação BriefFlow usando o Coolify.

### ⚠️ Importante: Volumes Docker vs Bind Mounts

Esta versão do docker-compose usa **volumes Docker** para o Prometheus e Grafana ao invés de bind mounts relativos. Isso é necessário porque o Coolify não suporta bind mounts relativos adequadamente.

### 📋 Configuração no Coolify

#### 1. Escolha do Docker Compose File

Use um dos seguintes arquivos docker-compose:
- `docker-compose-updated.yml` (recomendado - mais completo)
- `docker-compose.prod.yml` (produção com limites de recursos)

#### 2. Variáveis de Ambiente

Configure estas variáveis de ambiente no Coolify:

**Obrigatórias:**
- `DB_NAME` = briefflow
- `DB_USER` = postgres
- `DB_PASSWORD` = sua_senha_aqui
- `JWT_SECRET` = segredo_jwt_aqui
- `SESSION_SECRET` = segredo_sessao_aqui

**Opcionais:**
- `GRAFANA_USER` = admin
- `GRAFANA_PASSWORD` = sua_senha_grafana
- `FRONTEND_URL` = http://seu-dominio.com
- `SUPABASE_URL` = https://seu-supabase.supabase.co
- `SUPABASE_ANON_KEY` = sua_chave_anon
- `SUPABASE_SERVICE_KEY` = sua_chave_service
- `ANTHROPIC_API_KEY` = sua_chave_anthropic

#### 3. Ports

A aplicação expõe as seguintes ports:
- `5000` - API do app
- `80` - Nginx
- `443` - Nginx SSL
- `5432` - PostgreSQL (opcional - interno)
- `6379` - Redis (opcional - interno)
- `9090` - Prometheus
- `3001` - Grafana

No Coolify, configure o **port público** como `80` (Nginx).

### 🔧 Como Funciona o Init Container

O docker-compose inclui um container `monitoring-init` que:
1. Copia arquivos de configuração de `./monitoring/` para volumes Docker
2. Executa apenas uma vez (na primeira execução)
3. Deixa os volumes persistidos para os containers Prometheus e Grafana

### 🔄 Atualização de Configurações

Se você precisar atualizar as configurações do Prometheus ou Grafana:

**Opção 1 - No Coolify:**
1. Faça commit das mudanças no arquivo `prometheus.yml` ou dashboards do Grafana
2. Redeploy a aplicação no Coolify
3. O init container rodará novamente e atualizará os volumes

**Opção 2 - Via SSH na VPS:**
```bash
# Reiniciar apenas o init container
docker-compose restart monitoring-init

# Ou remover volumes e recriar (último recurso)
docker-compose down
docker volume rm <nome_do_volume>
docker-compose up -d
```

### 🧹 Limpar Volumes (Último Recurso)

Se os volumes ficarem corrompidos ou precisarem ser resetados:

```bash
# Listar volumes
docker volume ls | grep briefflow

# Remover volumes de config (os dados de métricas permanecem)
docker volume rm briefflow_prometheus_config briefflow_grafana_config

# Recriar volumes
docker-compose up -d
```

### ✅ Verificar Deploy

Após o deploy, verifique se tudo está funcionando:

```bash
# Verificar containers
docker ps

# Verificar logs do init
docker logs briefflow-monitoring-init

# Verificar Prometheus
curl http://localhost:9090/-/healthy

# Verificar Grafana
curl http://localhost:3001/api/health
```

### 🐛 Troubleshooting

#### Erro: "not a directory: unknown"
**Causa:** Bind mount relativo não suportado pelo Coolify
**Solução:** Esta versão já resolve esse problema usando volumes Docker

#### Erro: Config files not found
**Solução:** Verifique se o container `monitoring-init` completou com sucesso:
```bash
docker logs briefflow-monitoring-init
```

#### Grafana não carrega dashboards
**Solução:** Verifique se o volume `grafana_config` existe e tem os arquivos:
```bash
docker exec briefflow-grafana ls -la /etc/grafana/provisioning/
```

### 📊 Acessar Painéis

- **Grafana:** `http://seu-dominio:3001`
  - User: admin (ou definido em `GRAFANA_USER`)
  - Password: definido em `GRAFANA_PASSWORD`

- **Prometheus:** `http://seu-dominio:9090`

- **API:** `http://seu-dominio/api`

### 🎯 Checklist para Deploy

- [ ] Variáveis de ambiente configuradas no Coolify
- [ ] Docker Compose file selecionado
- [ ] Port público configurado (80)
- [ ] Deploy iniciado
- [ ] Verificar logs do `monitoring-init`
- [ ] Verificar logs do Prometheus e Grafana
- [ ] Testar acesso ao Grafana
- [ ] Testar acesso à API

### 📞 Suporte

Se encontrar problemas:
1. Verifique os logs dos containers: `docker logs -f <container_name>`
2. Verifique se volumes foram criados: `docker volume ls`
3. Consulte o documento DEPLOYMENT.md para mais informações
