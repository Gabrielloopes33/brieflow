# 🔧 Problema do Agent Tab - Solução

## 🎯 Sintoma

**Erro no Frontend**:
```
ERROR: Cannot read 'clipboard' (this model does not support image input). Inform the user.
```

**O que está acontecendo**:
- Usuário usa aba **Agent** (Coding)
- Envia um prompt
- Recebe erro sobre clipboard/imagem
- **Mas o usuário não está enviando imagem!**

---

## 🔍 Análise

### Onde está o erro?
O erro vem da **API do Z.ai**, não do nosso código!

### Possíveis causas:

1. **Modelo glm-4-flash não disponível/compatível**
   - A API key pode não ter acesso a este modelo
   - O modelo pode estar em manutenção
   - O formato pode ter mudado

2. **Problema de permissão da API key**
   - API key tem limitações
   - Não tem acesso a modelos premium
   - Conta pode estar suspensa

3. **Formato incorreto da requisição**
   - Modelo Z.ai pode esperar formato diferente
   - Headers podem estar incorretos
   - Endpoint pode ter mudado

4. **Prompt com caracteres problemáticos**
   - Caracteres especiais podem confundir a API
   - Encoding pode estar incorreto

---

## ✅ Solução Imediata - Desabilitar Agent Temporariamente

### Se Agent não for essencial:

1. **Remover o botão Agent do frontend**
2. **Focar nas funções que funcionam**:
   - ✅ Scrape (Firecrawl) - FUNCIONA!
   - ✅ Search (DuckDuckGo) - FUNCIONA!
   - ✅ Map (Firecrawl) - FUNCIONA!
   - ✅ Crawl (Firecrawl) - FUNCIONA!

3. **Resolver o Agent depois**

### Como desabilitar:

No arquivo `client/src/pages/ChatPage.tsx`, comentar a aba Agent:

```typescript
// COMENTE A LINHA 189:
// { id: "agent", label: "Agent", icon: <Bot size={14} /> },
```

E também comentar o handler e UI da aba Agent.

---

## 🔧 Solução Alternativa - Mudar de Modelo/Provider

### Opção 1: Usar outro modelo Z.ai

Modelos para tentar:
- `glm-4`
- `glm-4-air`
- `gpt-3.5-turbo` (Z.ai também suporta OpenAI)
- `gpt-4` (Z.ai também suporta OpenAI)

Mudar em `scraper/src/scrapers/agent_scraper.py`:

```python
# Antes:
self.model = "glm-4-flash"

# Depois (experimentar estes):
self.model = "glm-4"
# ou
self.model = "gpt-3.5-turbo"
```

### Opção 2: Mudar para OpenAI

Usar o pacote `openai` do Python ao invés de requests direto:

```python
# Instalar:
pip install openai

# No agent_scraper.py:
from openai import OpenAI

client = OpenAI(
    api_key=ZAI_API_KEY,
    base_url="https://api.z.ai/api/paas/v4/"
)

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[...]
)
```

### Opção 3: Usar Anthropic/Claude

Criar novo arquivo `anthropic_scraper.py` usando a API da Anthropic:

```python
# Instalar:
pip install anthropic

# Usar:
from anthropic import Anthropic

client = Anthropic(api_key=ANTHROPIC_API_KEY)
message = client.messages.create(...)
```

---

## 🧪 Como Diagnosticar

### Passo 1: Testar diferentes modelos

Execute o script de teste na VPS:

```bash
# Na VPS:
cd /opt/brieflow/scraper
python test_zai_models.py
```

Isso vai mostrar quais modelos funcionam com sua API key.

### Passo 2: Verificar logs

```bash
docker logs briefflow-scraper --tail 50
```

### Passo 3: Verificar API key

Ir em: https://z.ai/manage-apikey/billing
Verificar:
- ✅ Saldo da conta
- ✅ Modelos disponíveis
- ✅ Limites de uso

---

## 📊 Recomendação

### **Se precisar de Agent logo:**

Use **OpenAI** (mais estável):
1. Criar novo arquivo: `scraper/src/scrapers/openai_scraper.py`
2. Usar `openai` Python package
3. Mudar endpoint para usar este novo scraper
4. Testar antes de deploy

### **Se Agent não for crítico:**

Desabilitar temporariamente e focar nas 4 funções que funcionam perfeitamente!

---

## 🚨 Checklist de Decisão

### Antes de implementar solução:

- [ ] O Agent é essencial para MVP?
- [ ] Quanto tempo temos para resolver?
- [ ] Quer investir em outra API key?
- [ ] Quer migrar para OpenAI?

### Opções:

1. ❌ Desabilitar Agent temporariamente (mais rápido)
2. 🔄 Tentar modelos Z.ai diferentes (médio)
3. ✅ Migrar para OpenAI/Anthropic (mais estável)
4. 🎯 Continuar debugando Z.ai (mais demorado)

---

**Qual caminho prefere seguir?**
