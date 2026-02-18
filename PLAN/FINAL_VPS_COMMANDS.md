# 🚀 COMANDOS FINAIS PARA VPS

## ✅ O Que Foi Corrigido e Pushado

### 1. **Navegação do Landing.tsx**
- Mudou `useNavigate()` para `useLocation()` (compatível com wouter v3.3.5)
- Resolve erro de build do Vite

### 2. **Docker Compose de Produção**
- Criado `docker-compose.production.yml` que usa build do Vite diretamente
- Remove dependência de `script/build.ts` (que usava esbuild)

### 3. **Build Simplificado**
- Usa apenas `npx vite build` (sem dependências extras)
- Mais rápido e menos propenso a erros

---

## 🎉 Commit e Push Realizados

```
Commit: 14dcb41
Mensagem: fix: correct navigation and add production docker-compose
Repositório: https://github.com/Gabriellopes33/brieflow.git
```

---

## 📋 COMANDOS PARA EXECUTAR NA VPS

### Opção A: Script Automático (RECOMENDADO)

```bash
cd /opt/brieflow

# Copiar o script
cat > final-deploy.sh << 'DEPLOY_EOF'
#!/bin/bash

echo "🚀 === DEPLOY FINAL ==="
cd /opt/brieflow

echo "📥 Pull das correções..."
git pull github main

echo "🧹 Limpando..."
rm -rf dist .vite node_modules

echo "📦 Instalando..."
npm install

echo "🏗️  Build (Vite apenas)..."
npx vite build --config vite.config.ts --mode production

echo "📋 Copiando docker-compose..."
cp docker-compose.production.yml /tmp/docker-compose-final.yml

echo "🗑️  Removendo stack..."
docker stack rm brielflow
sleep 15

echo "🚀 Deploy novo..."
docker stack deploy -c /tmp/docker-compose-final.yml brielflow

echo "⏳ Aguardando..."
sleep 20

echo "📊 Status:"
docker service ls | grep brielflow

echo "✅ DEPLOY CONCLUÍDO!"
DEPLOY_EOF

chmod +x final-deploy.sh

# Executar
./final-deploy.sh
```

### Opção B: Passo a Passo Manual

```bash
# 1. Pull
cd /opt/brieflow
git pull github main

# 2. Limpar
rm -rf dist .vite node_modules

# 3. Instalar
npm install

# 4. Build (apenas Vite)
npx vite build --config vite.config.ts --mode production

# 5. Verificar build
ls -la dist/public/

# 6. Copiar docker-compose
cp docker-compose.production.yml /tmp/docker-compose-final.yml

# 7. Remover stack antiga
docker stack rm brielflow

# 8. Aguardar
sleep 15

# 9. Deploy novo
docker stack deploy -c /tmp/docker-compose-final.yml brielflow

# 10. Aguardar containers
sleep 20

# 11. Verificar status
docker service ls | grep brielflow
```

---

## ✨ O Que Esperar Após o Deploy

### 1. **Frontend Funcional**
- Acessando `http://seu-servidor:5001`
- Você verá a interface do BriefFlow (não mais "API running!")

### 2. **Botão de Login Funciona**
- Clicar em "Fazer Login"
- Vai para `/auth`

### 3. **Página de Autenticação**
- Login com email e senha
- Criar nova conta
- Recuperar senha

### 4. **Dashboard Funcional**
- Após login, redirecionado para `/dashboard`
- Interface completa da aplicação

---

## 🔧 Se Ainda Der Erro

### Ver 1: Verificar se o build criou arquivos

```bash
ls -la /opt/brieflow/dist/public/
```

Deve ver `index.html` e `assets/`.

### Ver 2: Verificar logs do container

```bash
docker service logs brielflow_app --tail 100
```

### Ver 3: Verificar se os arquivos estão acessíveis dentro do container

```bash
docker exec $(docker ps -q -f name=brielflow_app) sh -c "ls -la /app/dist/public/"
```

### Ver 4: Se aparecer erro de "Frontend not built"

Significa que o `production-server.ts` não está encontrando o caminho correto. Verifique:

```bash
docker exec $(docker ps -q -f name=brielflow_app) sh -c "cat /app/server/production-server.ts" | grep dist
```

---

## 📊 Comparação: Antes vs Depois

| Item | Antes | Depois |
|------|--------|--------|
| Build do Vite | ❌ Falhava (useNavigate) | ✅ Funciona (useLocation) |
| Build completo | ❌ Falhava (esbuild) | ✅ Funciona (só Vite) |
| Docker compose | ⚠️ Usava tsx direto | ✅ Usa build pré |
| Frontend | ❌ "API running" | ✅ Interface completa |
| Login | ❌ Demo (cookies) | ✅ Supabase real |
| Navegação | ❌ useNavigate não existe | ✅ useLocation funciona |

---

## 🎯 Checklist de Sucesso

- [ ] Pull realizado com sucesso
- [ ] npm install sem erros
- [ ] npx vite build concluído
- [ ] dist/public/index.html existe
- [ ] docker stack rm funcionou
- [ ] docker stack deploy funcionou
- [ ] brielflow_app está "running"
- [ ] Acessando http://seu-servidor:5001 mostra interface
- [ ] Botão "Fazer Login" funciona
- [ ] Página /auth carrega
- [ ] Criar conta funciona
- [ ] Login funciona
- [ ] Dashboard carrega

---

## 🆘 Emergência

Se algo der errado:

```bash
# Ver logs
docker service logs brielflow_app --tail 100

# Ver container
docker ps -a | grep brielflow

# Reiniciar stack
docker service scale brielflow_app=0 && docker service scale brielflow_app=1

# Rollback (re-deployar versão antiga)
cd /opt/brieflow
git reset --hard 59f5fd5
git pull github main
./final-deploy.sh
```

---

**Execute os comandos na VPS e teste a aplicação!** 🚀
