# Instruções de Atualização da VPS

## 📝 Resumo das Mudanças

1. ✅ Adicionado HTTPS ao BriefFlow via Traefik
2. ✅ Atualizado CORS no Kong para permitir `brieflow.agenciatouch.com.br`
3. ✅ Configurado `FRONTEND_URL` correto

---

## 🚀 Passo a Passo

### 1️⃣ Atualizar Docker Compose do BriefFlow

```bash
# Conecte-se na VPS via SSH
ssh root@185.216.203.73

# Fazer backup do arquivo atual
cp /root/brieflow/docker-compose.yml /root/brieflow/docker-compose.yml.backup

# Copie o arquivo atualizado (docker-compose.brieflow-fixed.yml) para a VPS
# Este arquivo está localizado no seu computador em:
# C:\Users\gmora\Desktop\developer\BriefFlow\PLANEJAMENTO\docker-compose.brieflow-fixed.yml
```

**Use SCP, SFTP ou arraste pelo WinSCP/FileZilla para:**
```
/root/brieflow/docker-compose.yml
```

### 2️⃣ Atualizar Kong Configuration

```bash
# Fazer backup do arquivo atual
cp /root/supabase/docker/volumes/api/kong.yml /root/supabase/docker/volumes/api/kong.yml.backup

# Copie o arquivo kong.yml atualizado para a VPS
# Este arquivo está localizado no seu computador em:
# C:\Users\gmora\Desktop\developer\BriefFlow\PLANEJAMENTO\kong.yml
```

**Use SCP, SFTP ou arraste pelo WinSCP/FileZilla para:**
```
/root/supabase/docker/volumes/api/kong.yml
```

### 3️⃣ Reiniciar Serviços

```bash
# Reiniciar o BriefFlow
cd /root/brieflow
docker stack deploy -c docker-compose.yml brieflow

# OU se estiver usando docker-compose (sem stack):
docker-compose down
docker-compose up -d

# Reiniciar o Kong
cd /root/supabase
docker service update supabase_kong --force

# Verificar se os serviços estão rodando
docker service ls
docker ps
```

### 4️⃣ Verificar Configurações

```bash
# Verificar logs do Kong
docker service logs supabase_kong --tail 50

# Verificar logs do BriefFlow
docker service logs brieflow_app --tail 50

# Testar acesso ao Kong
curl -I https://supa.agenciatouch.com.br/auth/v1/health

# Testar acesso ao BriefFlow
curl -I https://brieflow.agenciatouch.com.br
```

### 5️⃣ Testar na Aplicação

1. Acesse: `https://brieflow.agenciatouch.com.br`
2. Tente criar uma nova conta
3. Verifique o console do navegador (F12) se não há erros de CORS
4. Verifique se o login funciona corretamente

---

## 🔧 Solução de Problemas

### Se o BriefFlow não carregar:

```bash
# Verificar logs
docker service logs brieflow_app

# Verificar se o container está rodando
docker ps | grep brieflow

# Verificar rede touchNet
docker network ls | grep touchNet
```

### Se o Kong não reiniciar:

```bash
# Verificar logs
docker service logs supabase_kong

# Validar configuração do Kong
docker exec -it $(docker ps -q -f name=kong) kong validate /home/kong/kong.yml
```

### Se ainda tiver erro de CORS:

1. Verifique se o DNS `brieflow.agenciatouch.com.br` está apontando para `185.216.203.73`
2. Verifique se o certificado SSL foi gerado corretamente no Traefik
3. Verifique se as variáveis de ambiente estão corretas no docker-compose

---

## 📋 Lista de Arquivos Criados

1. `docker-compose.brieflow-fixed.yml` - Docker Compose atualizado do BriefFlow
2. `kong.yml` - Configuração atualizada do Kong com CORS

---

## ✅ Checklist de Validação

- [ ] DNS configurado: `brieflow.agenciatouch.com.br → 185.216.203.73`
- [ ] Arquivo docker-compose atualizado na VPS
- [ ] Arquivo kong.yml atualizado na VPS
- [ ] Serviços reiniciados
- [ ] HTTPS funcionando no BriefFlow
- [ ] Certificado SSL válido (cadeado verde)
- [ ] CORS configurado no Kong
- [ ] Teste de criação de conta funciona
- [ ] Teste de login funciona
