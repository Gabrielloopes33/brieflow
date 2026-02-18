# 🔄 Atualização do Modelo do Agent - glm-4-flash

## ✅ O que foi mudado

### Modelo alterado:
- **Antes**: `glm-5`
- **Depois**: `glm-4-flash`

### Por que:
- `glm-5` pode não estar disponível/acessível com a API key atual
- `glm-4-flash` é um modelo **mais rápido e compatível**
- Modelo flash é otimizado para respostas rápidas

---

## 🚀 Como Aplicar na VPS

### Passo 1: Conectar
```bash
ssh root@185.216.203.73
```

### Passo 2: Executar script
```bash
cd /opt/brieflow
bash update-agent-model.sh
```

Este script faz:
- ✅ Git pull do código atualizado
- ✅ Reinicia scraper (sem rebuild)
- ✅ Aguarda 30 segundos para startup
- ✅ Verifica status do container
- ✅ Mostra logs
- ✅ Testa endpoint `/agent`

### Passo 3: Verificar resultado
```bash
# Verificar status
docker ps | grep briefflow-scraper

# Deve mostrar:
# briefflow-scraper   ...   Up Xm (healthy)   ...
```

---

## 🧪 Como Testar no Frontend

### 1. Acessar aplicação
```
https://briefflow2.netlify.app
```

### 2. Fazer login
- Usar suas credenciais

### 3. Selecionar cliente
- Escolher um cliente existente ou criar novo

### 4. Ir para aba **Agent**
- Clicar em "Agent" nas abas de scraping

### 5. Testar Agent
```
Prompt: Olá mundo, responda em 1 frase
[Run Agent]
```

### 6. Verificar resultado
- ✅ Deve aparecer resposta do Z.ai
- ✅ Deve salvar no banco com "Salvar no Banco"
- ✅ Logs do scraper devem mostrar: `✅ Agente executado com sucesso`

---

## 📊 O que esperar

### Com sucesso:
```json
{
  "result": "Olá! Sou um assistente de IA especializado em análise de conteúdo e web scraping."
}
```

### Com erro de saldo na Z.ai:
```json
{
  "result": "Erro de comunicação com Z.ai: 404 Client Error: Not Found..."
}
```

Ou mensagem amigável:
```
Erro ao executar agente: Insufficient balance or no resource package. Please recharge.
```

**Se isso acontecer**:
1. Ir em: https://z.ai/manage-apikey/billing
2. Carregar saldo na conta
3. Tentar novamente

---

## 🔍 Troubleshooting

### Agent ainda retorna erro após atualização

#### 1. Verificar logs do scraper
```bash
docker logs briefflow-scraper --tail 50
```

Procurar por:
- `INFO | 🤖 Executando agente com prompt...`
- `INFO | ✅ Agente executado com sucesso`
- `ERROR | ❌ Erro na requisição para Z.ai`

#### 2. Testar endpoint manualmente
```bash
curl -s -X POST http://localhost:8000/agent \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test"}'
```

#### 3. Testar de dentro do container
```bash
docker exec briefflow-scraper python -c "
from scrapers.agent_scraper import AgentScraper
scraper = AgentScraper()
result = scraper.run_agent('Olá mundo')
print(f'Resultado: {result}')
"
```

#### 4. Verificar API key
```bash
# No scraper/.env
grep ZAI_API_KEY /opt/brieflow/scraper/.env

# Deve mostrar:
# ZAI_API_KEY=5c03177d5d75466293543d34ce3f58d6.Z6AhWru7sTn9I47I
```

#### 5. Testar API key com curl
```bash
curl -s https://api.z.ai/api/paas/v4/chat/completions \
  -H "Authorization: Bearer 5c03177d5d75466293543d34ce3f58d6.Z6AhWru7sTn9I47I" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-4-flash",
    "messages": [
      {"role": "user", "content": "test"}
    ]
  }'
```

---

## 📦 Diferenças: glm-5 vs glm-4-flash

| Característica | glm-5 | glm-4-flash |
|-------------|-------|--------------|
| Velocidade | Média | Rápida ⚡ |
| Custo | Mais alto | Mais baixo 💰 |
| Compatibilidade | Menos estável | Mais estável ✅ |
| Uso ideal | Tarefas complexas | Respostas rápidas |
| API | Z.ai | Z.ai |

---

## 📝 Notas Importantes

1. **glm-4-flash é otimizado para velocidade**
2. **Menos tokens por requisição** = Mais econômico
3. **Se funcionar bem, manter este modelo**
4. **Se ainda falhar, considerar desabilitar Agent temporariamente**

---

## ✅ Checklist de Sucesso

Execute `bash update-agent-model.sh` na VPS e verifique:

- [ ] Git pull funcionou
- [ ] Scraper reiniciou
- [ ] Container está healthy
- [ ] Endpoint `/agent` funciona
- [ ] Logs mostram: `Agente executado com sucesso`
- [ ] Frontend Agent tab funciona
- [ ] Pode salvar no banco

---

## 🚀 Próximos Passos

Após confirmar que glm-4-flash funciona:

1. **Testar outros endpoints**:
   - Scrape ✅ (já funciona)
   - Search ✅ (já funciona)
   - Map ✅ (já funciona)
   - Crawl ✅ (já funciona)

2. **Testar salvar no banco**:
   - Todas as funções devem salvar no Supabase
   - Verificar se o conhecimento aparece

3. **Monitorar uso da API Z.ai**:
   - Verificar se saldo está sendo consumido
   - Monitorar rate limits se houver

---

## 📦 Commits Enviados

1. **`0089811`** - fix: change Z.ai model to glm-4-flash
2. **`8974200`** - add: script to update agent model without rebuild

---

**Execute `bash update-agent-model.sh` na VPS agora!** 🚀

O Agent tab deve funcionar com o modelo glm-4-flash!
