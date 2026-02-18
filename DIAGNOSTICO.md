# 🔍 Guia de Diagnóstico Rápido

## Comandos úteis para verificar o estado dos serviços

### 1. Verificar se o stack está rodando
```bash
docker service ls | grep brieflow
```
**Esperado:** Ver 3 serviços (app, nginx, redis)

### 2. Verificar se as labels foram aplicadas
```bash
docker service inspect brieflow_app --format '{{json .Spec.Labels}}' | jq '.'
```
**Esperado:** Ver as labels do Traefik na saída

### 3. Verificar se o container está na rede touchNet
```bash
docker service inspect brieflow_app --format '{{.Spec.TaskTemplate.Networks}}'
```
**Esperado:** Ver "touchNet" na lista de redes

### 4. Verificar logs do container
```bash
docker service logs brieflow_app --tail 50
```
**Esperado:** Ver "Server running on port 5000"

### 5. Verificar logs do Traefik
```bash
# Primeiro, encontre o nome do serviço do Traefik
docker service ls | grep traefik

# Depois, verifique os logs
docker service logs <nome_do_serviço_traefik> --tail 100 | grep -i brieflow
```
**Esperado:** Ver mensagens sobre o router "brieflow"

### 6. Testar acesso direto ao container
```bash
curl -I http://185.216.203.73:5001
```
**Esperado:** "HTTP/1.1 200 OK"

### 7. Testar acesso via Traefik
```bash
curl -I https://brieflow.agenciatouch.com.br
```
**Esperado:** "HTTP/1.1 200 OK" ou "301 Moved Permanently" (redirect)

### 8. Verificar DNS
```bash
nslookup brieflow.agenciatouch.com.br
# ou
dig brieflow.agenciatouch.com.br
```
**Esperado:** Ver "185.216.203.73" na resposta

### 9. Verificar se o Traefik está lendo labels da rede touchNet
```bash
# Verificar configuração do Traefik
docker service inspect <traefik_service> | grep -A 10 "providers.docker.network"
```
**Esperado:** Ver "touchNet" ou "*" (todas as redes)

---

## Checklist de Verificação

### ✅ Container
- [ ] Container `brieflow_app` está rodando
- [ ] Container está na porta 5000 (interna) e 5001 (publicada)
- [ ] Container está na rede `touchNet`
- [ ] Logs não mostram erros

### ✅ Labels
- [ ] Labels do Traefik aparecem no serviço
- [ ] Label `traefik.enable=true` está presente
- [ ] Label `traefik.http.routers.brieflow.rule` está presente
- [ ] Label `traefik.http.routers.brieflow.service` está presente

### ✅ Traefik
- [ ] Container do Traefik está rodando
- [ ] Logs mostram o router `brieflow`
- [ ] Não há erros no log do Traefik

### ✅ DNS
- [ ] DNS `brieflow.agenciatouch.com.br` aponta para `185.216.203.73`
- [ ] Propagação do DNS está completa

### ✅ Acesso
- [ ] `http://185.216.203.73:5001` funciona
- [ ] `https://brieflow.agenciatouch.com.br` funciona
- [ ] Certificado SSL é válido (cadeado verde)

---

## Caso de Teste Rápido

### Teste 1: Acesso Direto
```bash
curl http://185.216.203.73:5001
```
✅ **Funciona:** A página HTML é retornada
❌ **Não funciona:** Verifique logs do container

### Teste 2: Acesso HTTPS
```bash
curl -I https://brieflow.agenciatouch.com.br
```
✅ **Funciona:** Retorna 200 ou 301
❌ **Não funciona:** Verifique DNS e labels do Traefik

### Teste 3: Verificar Headers do Traefik
```bash
curl -v https://brieflow.agenciatouch.com.br 2>&1 | grep -E "(Server|X-Forwarded)"
```
✅ **Esperado:**
```
Server: Traefik (ou similar)
X-Forwarded-For: <seu_ip>
X-Forwarded-Proto: https
```
❌ **Não aparece:** O Traefik não está roteando para este domínio

---

## Interpretar os Resultados

### Se o Teste 1 funciona mas o Teste 2 não:
- ❌ Problema: Labels do Traefik não foram aplicadas
- ✅ Solução: Recriar o stack do zero (não editar)

### Se o Teste 1 e Teste 2 funcionam:
- ✅ Problema resolvido!
- 🎉 Teste o login no sistema

### Se nem o Teste 1 funciona:
- ❌ Problema: Container não está rodando corretamente
- ✅ Solução: Verificar logs e variáveis de ambiente

---

## Logs Importantes para Coletar

Se precisar de ajuda, colete estes logs:

```bash
# Logs do container brieflow_app
docker service logs brieflow_app --tail 100 > brieflow_app.log

# Logs do Traefik
docker service logs <traefik_service> --tail 100 > traefik.log

# Configuração do serviço brieflow_app
docker service inspect brieflow_app > brieflow_app_config.json

# Configuração do serviço do Traefik
docker service inspect <traefik_service> > traefik_config.json
```

Envie estes arquivos para diagnóstico.
