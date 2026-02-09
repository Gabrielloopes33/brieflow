# BriefFlow - Guia de Deploy

## Visão Geral

Este guia fornece instruções completas para fazer o deploy da aplicação BriefFlow em produção usando Docker, Docker Compose e GitHub Actions.

## Arquitetura

- **Frontend**: React + TypeScript + Vite (servido como arquivos estáticos)
- **Backend**: Express + TypeScript
- **Banco de Dados**: PostgreSQL 15
- **Cache**: Redis 7
- **Proxy Reverso**: Nginx
- **Monitoramento**: Prometheus + Grafana
- **Orquestração**: Docker Compose
- **CI/CD**: GitHub Actions

## Pré-requisitos

- VPS com Ubuntu 20.04 ou superior
- Domínio configurado (opcional, para SSL)
- Conta no GitHub
- Conhecimento básico de Docker e Linux
- Mínimo 2GB RAM, 2 vCPUs (recomendado 4GB RAM, 4 vCPUs)

## Guia Rápido de Deploy

### 1. Configurar o VPS

```bash
ssh root@seu-vps-ip

git clone https://github.com/seu-usuario/briefflow.git /opt/briefflow
cd /opt/briefflow

chmod +x setup-vps.sh
./setup-vps.sh
```

### 2. Configurar Variáveis de Ambiente

```bash
cd /opt/briefflow
cp .env.example .env
nano .env
```

Edite as seguintes variáveis obrigatórias:
- `DB_PASSWORD`: Senha do PostgreSQL
- `JWT_SECRET`: Segredo para JWT
- `SESSION_SECRET`: Segredo para sessões
- `GRAFANA_PASSWORD`: Senha do Grafana

### 3. Iniciar a Aplicação

```bash
docker-compose up -d
```

### 4. Verificar Status

```bash
docker ps
docker logs -f briefflow-app
curl http://localhost/api/health
```

## Configuração do GitHub Actions

### 1. Adicionar Secrets ao Repositório

Vá em: Settings > Secrets and variables > Actions > New repository secret

Adicione os seguintes secrets:
- `SSH_PRIVATE_KEY`: Chave SSH privada do VPS
- `SSH_USER`: Usuário do VPS (ex: root)
- `HOST`: IP ou domínio do VPS
- `DOMAIN`: Domínio da aplicação (opcional)

### 2. Gerar Chave SSH

No seu computador local:

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions_key
ssh-copy-id -i ~/.ssh/github_actions_key.pub root@seu-vps-ip
```

Copie o conteúdo de `~/.ssh/github_actions_key` e adicione como `SSH_PRIVATE_KEY` no GitHub.

### 3. Ativar Workflows

Os workflows são executados automaticamente quando você faz push para a branch `main`.

```bash
git add .
git commit -m "Add deployment configuration"
git push origin main
```

## Gerenciamento de Containers

### Iniciar Serviços

```bash
docker-compose up -d
```

### Parar Serviços

```bash
docker-compose down
```

### Reiniciar Serviços

```bash
docker-compose restart
```

### Ver Logs

```bash
docker logs -f briefflow-app
docker logs -f briefflow-nginx
docker logs -f briefflow-postgres
```

### Atualizar Aplicação

#### OPÇÃO 1: Via Portainer (RECOMENDADO) ⭐

1. Acesse seu Portainer: `http://sua-vps:9000`
2. Procure a stack **"brielflow"**
3. Clique em **Editor** da stack
4. Clique em **"Update & Restart"** ou **"Redeploy"**

Isso fará automaticamente:
- ✅ Pull do código
- ✅ Rebuild da imagem
- ✅ Restart do container

#### OPÇÃO 2: Via Script Automatizado (Na VPS) ⭐

```bash
cd /opt/brieflow
chmod +x vps-deploy.sh

# Deploy completo (stop + pull + clean + install + build + start)
./vps-deploy.sh all

# Apenas atualizar código (pull + stop + start)
./vps-deploy.sh code

# Apenas reiniciar containers
./vps-deploy.sh restart

# Ver logs em tempo real (Ctrl+C para sair)
./vps-deploy.sh logs
```

#### OPÇÃO 3: Manual (Na VPS) - NÃO RECOMENDADO

```bash
cd /opt/brieflow

# 1. Pull do código
git pull github main

# 2. Parar containers
docker-compose down

# 3. Limpando build antigo (IMPORTANTE)
rm -rf dist

# 4. Install dependencies
cp /opt/brieflow/package*.json ./
npm install --include=dev

# 5. Build do projeto (production)
npx tsx script/build.ts

# 6. Subir novamente
npx tsx server/production-server.ts

# 7. Verificar logs
docker logs -f brielflow-app
```

## Monitoramento

### Acessar Grafana

```
URL: http://seu-dominio.com:3001
Usuário: admin
Senha: (definida em .env)
```

### Métricas Disponíveis

- Requisitos HTTP por segundo
- Tempo de resposta
- Taxa de erro
- Conexões do banco de dados
- Uso de CPU e memória
- Status dos containers

### Acessar Prometheus

```
URL: http://seu-dominio.com:9090
```

## Configuração de SSL/TLS

### Usar Certbot (Let's Encrypt)

```bash
certbot --nginx -d seudominio.com -d www.seudominio.com
```

### Renovação Automática

Certbot configura renovação automática. Verifique com:

```bash
certbot renew --dry-run
```

## Backup e Restauração

### Backup do Banco de Dados

```bash
docker exec briefflow-postgres pg_dump -U postgres briefflow > backup_$(date +%Y%m%d).sql
```

### Restaurar Backup

```bash
docker exec -i briefflow-postgres psql -U postgres briefflow < backup_20240101.sql
```

### Backup Completo

```bash
docker exec briefflow-postgres pg_dump -U postgres briefflow > backup.sql
tar -czf briefflow_backup_$(date +%Y%m%d).tar.gz backup.sql .env
```

## Troubleshooting

### Container não inicia

```bash
docker logs briefflow-app
docker-compose logs
```

### Problemas de conexão com o banco

```bash
docker exec briefflow-postgres psql -U postgres brielflow -c "SELECT version();"
```

### Limpar caches do Docker

```bash
docker system prune -a
```

### Resetar todo o ambiente

```bash
docker-compose down -v
rm -rf data/*
docker-compose up -d
```

## Performance

### Aumentar recursos do VPS

Edit `docker-compose.yml` e ajuste os limites de recursos:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
```

### Configurar Cache do Redis

O Redis já está configurado para cache de sessões e dados temporários.

### Otimizar Nginx

Edit `nginx/nginx.conf` para ajustar configurações de cache e gzip.

## Segurança

### Configurar Firewall

```bash
ufw status
ufw allow from seu-ip para ssh
ufw enable
```

### Usuário Dedicado

Não use `root` para operações diárias:

```bash
adduser deploy
usermod -aG docker deploy
```

### Atualizar Regularmente

```bash
apt update && apt upgrade
docker-compose pull
docker-compose up -d
```

## Escalabilidade

### Adicionar mais instâncias

No `docker-compose.yml`:

```yaml
services:
  app:
    deploy:
      replicas: 3
```

### Balanceador de Carga

Configure o Nginx com upstream balanceado.

## Custos Estimados

- VPS (2GB RAM, 2 vCPUs): ~$10-20/mês
- Domínio: ~$10/ano
- SSL: Gratuito (Let's Encrypt)

## Suporte

Para problemas e dúvidas:
- Verificar logs: `docker logs -f briefflow-app`
- Documentação: `/docs`
- Issues: GitHub Issues

## Checklist de Deploy

- [ ] VPS configurado com Ubuntu 20.04+
- [ ] Docker e Docker Compose instalados
- [ ] Firewall configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Contêineres iniciados com sucesso
- [ ] Health check passando
- [ ] GitHub Actions configurado
- [ ] SSL/TLS configurado
- [ ] Monitoramento ativo
- [ ] Backup configurado
- [ ] Logs funcionando

## Atualizações Futuras

Para atualizar a aplicação:

1. Faça o merge das mudanças
2. Push para main
3. GitHub Actions faz o deploy automático
4. Verifique os logs e status

## Estrutura de Diretórios

```
/opt/briefflow/
├── client/              # Frontend React
├── server/              # Backend Express
├── shared/              # Código compartilhado
├── nginx/               # Configuração Nginx
├── monitoring/          # Prometheus e Grafana
├── logs/                # Logs da aplicação
├── .env                 # Variáveis de ambiente
├── Dockerfile           # Build da aplicação
├── docker-compose.yml   # Orquestração
└── setup-vps.sh         # Script de setup
```