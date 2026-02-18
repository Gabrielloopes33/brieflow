# 🔐 CONFIGURAÇÃO DO GITHUB ACTIONS

## ⚠️ IMPORTANTE - SEGURANÇA

A chave SSH que você me enviou é **SENSÍVEL**. Após configurar no GitHub:
1. ✅ Nunca compartilhe essa chave novamente
2. ✅ Não salve em lugares públicos
3. ✅ Guarde apenas no GitHub Secrets

---

## 📋 PASSO A PASSO PARA CONFIGURAR

### **ETAPA 1: Adicionar Secrets no GitHub (2 min)**

1. Acesse seu repositório no GitHub
2. Clique em **Settings** (aba superior)
3. No menu lateral esquerdo, clique em **Secrets and variables** → **Actions**
4. Clique no botão verde **"New repository secret"**

Adicione **3 secrets**:

#### Secret 1: HOST
- **Name:** `HOST`
- **Value:** `185.216.203.73`

#### Secret 2: SSH_USER
- **Name:** `SSH_USER`
- **Value:** `root`

#### Secret 3: SSH_PRIVATE_KEY
- **Name:** `SSH_PRIVATE_KEY`
- **Value:** (cole a chave completa abaixo)

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAACmFlczI1Ni1jdHIAAAAGYmNyeXB0AAAAGAAAABAmDHM6u6
fZI/JZ1pZ23zI2AAAAGAAAAAEAAAAzAAAAC3NzaC1lZDI1NTE5AAAAIN+gRcVZgjrc+oOG
25HuDIUC0hxLTimQiVU/Pldz/HwvAAAAoLDKXA/Yp8I4nLZutx4iioBDZSpYU7OVycvNM9
4uR3gkcakPk736wWgjW0j7FkyGE5o1TNTg8586ydpD/vY7fcl1/vc5j3cTRnWlXcPdvwnN
trSn0RpUOAyhSC4X/zZdx+NicLjOrD5BaE0mGwVSb7n4IozCIkOPJREfrhOoiWnFmKQjx3
wiYMLnv421+vNCMMXUnproKCZCAtyqzv7LHhA=
-----END OPENSSH PRIVATE KEY-----
```

---

### **ETAPA 2: Dar Push no Código (1 min)**

No seu terminal local:

```bash
cd Content-Generator
git add .
git commit -m "config: prepara GitHub Actions para deploy"
git push origin main
```

Ou, se já fez o commit:
```bash
git push origin main
```

---

### **ETAPA 3: Verificar Deploy (3 min)**

1. No GitHub, vá em **Actions** (aba superior do repositório)
2. Você verá o workflow "Deploy BriefFlow to VPS" rodando
3. Clique nele para acompanhar o progresso
4. Aguarde completar (cerca de 1-2 minutos)

**Status esperado:** ✅ Deploy successful

---

### **ETAPA 4: Testar (1 min)**

Acesse no navegador:
- http://185.216.203.73:5000/api/health

Deve retornar:
```json
{"status": "healthy"}
```

---

## 🎉 **PRÓXIMOS DEPLOYS**

Depois de configurado, **tudo é automático**:

1. Você faz alterações no código
2. Commits e push para a branch `main`
3. GitHub Actions dispara automaticamente
4. Código é atualizado na VPS em ~2 minutos

**Sem precisar fazer mais nada manualmente!**

---

## 🐛 **TROUBLESHOOTING**

### Erro: "Permission denied (publickey)"
- Verifique se copiou a chave completa (incluindo BEGIN/END)
- Confirme que adicionou a chave pública ao authorized_keys na VPS

### Erro: "docker service update" não encontrado
- O nome do serviço pode estar diferente
- Verifique na VPS: `docker service ls`
- Se for diferente, atualize o workflow

### Deploy falha no Health Check
- Aguarde mais tempo (serviço pode estar iniciando)
- Ou verifique logs na VPS: `docker service logs briefflow_app`

---

## 📞 **PRECISA DE AJUDA?**

Se der erro, me envie:
1. Screenshot do erro no GitHub Actions
2. Output do comando na VPS: `docker service ls`

**Pronto para configurar?** 🚀
