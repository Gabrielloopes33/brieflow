#!/bin/bash

set -e

echo "🚀 Iniciando setup do VPS para BriefFlow..."

echo "📦 Atualizando sistema..."
apt update && apt upgrade -y

echo "🐳 Instalando Docker e Docker Compose..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

usermod -aG docker $USER

echo "📦 Instalando ferramentas adicionais..."
apt install -y git curl wget fail2ban ufw htop

echo "🔧 Configurando Firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "📁 Criando diretórios necessários..."
mkdir -p /opt/briefflow
mkdir -p /opt/briefflow/logs/nginx
mkdir -p /opt/briefflow/nginx/ssl

echo "📋 Clonando repositório (se fornecido)..."
if [ ! -z "$GIT_REPO" ]; then
    cd /opt/briefflow
    git clone $GIT_REPO .
else
    echo "⚠️  GIT_REPO não fornecido. Copie os arquivos manualmente para /opt/briefflow"
fi

echo "🔐 Configurando variáveis de ambiente..."
if [ -f /opt/briefflow/.env.example ]; then
    cp /opt/briefflow/.env.example /opt/briefflow/.env
    echo "⚠️  Edite /opt/briefflow/.env com suas credenciais reais!"
fi

echo "🛡️  Configurando Fail2ban..."
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
EOF

systemctl enable fail2ban
systemctl start fail2ban

echo "📊 Configurando logrotate..."
cat > /etc/logrotate.d/briefflow << 'EOF'
/opt/briefflow/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
}
EOF

echo "🔧 Configurando swap (se necessário)..."
if [ $(free -m | awk '/Swap:/ {print $2}') -lt 1024 ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "🌐 Configurando certbot para SSL (opcional)..."
apt install -y certbot python3-certbot-nginx

if [ ! -z "$DOMAIN" ] && [ ! -z "$EMAIL" ]; then
    echo "📝 Obtendo certificado SSL para $DOMAIN..."
    certbot --nginx --non-interactive --agree-tos --email $EMAIL --domains $DOMAIN
else
    echo "⚠️  Certbot instalado mas certificado não configurado."
    echo "Para configurar SSL, execute: certbot --nginx -d seu-dominio.com"
fi

echo "🐳 Configurando Docker..."
systemctl enable docker
systemctl start docker

echo "🔄 Configurando Docker para limpeza automática..."
cat > /etc/systemd/system/docker-prune.service << 'EOF'
[Unit]
Description=Docker System Prune
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
ExecStart=/usr/bin/docker system prune -af --filter "until=168h"

[Install]
WantedBy=multi-user.target
EOF

cat > /etc/systemd/system/docker-prune.timer << 'EOF'
[Unit]
Description=Run Docker Prune Weekly
Requires=docker-prune.service

[Timer]
OnCalendar=weekly
Persistent=true

[Install]
WantedBy=timers.target
EOF

systemctl enable docker-prune.timer
systemctl start docker-prune.timer

echo "🚀 Iniciando containers Docker..."
cd /opt/briefflow
if [ -f docker-compose.yml ]; then
    docker-compose up -d
    echo "✅ Containers iniciados com sucesso!"
else
    echo "⚠️  docker-compose.yml não encontrado. Execute docker-compose up -d manualmente."
fi

echo "📝 Informações importantes:"
echo "   - Diretório da aplicação: /opt/briefflow"
echo "   - Logs: /opt/briefflow/logs/"
echo "   - Firewall: ufw status"
echo "   - Docker containers: docker ps"
echo "   - Docker logs: docker logs -f briefflow-app"

echo "✅ Setup completo! O VPS está pronto para uso."
echo ""
echo "🔒 Recomendações de segurança:"
echo "   1. Edite /opt/briefflow/.env com credenciais reais"
echo "   2. Configure chaves SSH para autenticação"
echo "   3. Instale e configure SSL/TLS"
echo "   4. Mantenha o sistema atualizado: apt update && apt upgrade"
echo "   5. Monitore os logs regularmente"