# BriefFlow Content Scraper

Sistema de coleta de conteúdo de múltiplas fontes (RSS, blogs, sites de notícias) desenvolvido em Python.

## 🚀 Funcionalidades

- **RSS/Atom Feeds**: Extração automática de feeds RSS e Atom
- **Web Scraping**: Coleta de conteúdo de sites genéricos com detecção inteligente de estrutura
- **Processamento de Texto**: Extração de entidades, resumos e análise de sentimentos
- **API REST**: Interface completa para integração com o backend Node.js
- **Agendamento**: Sistema de agendamento de tarefas de scraping
- **Monitoramento**: Status em tempo real das tarefas de scraping

## 📋 Pré-requisitos

- Python 3.8+
- SQLite 3
- Node.js 18+ (backend)

## 🔧 Instalação

### Windows

```bash
# Executar script de instalação
setup.bat

# Ou manualmente:
python -m venv venv
venv\Scripts\activate.bat
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python -m spacy download pt_core_news_sm
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('vader_lexicon')"
```

### Linux/macOS

```bash
# Executar script de instalação
chmod +x setup.sh
./setup.sh

# Ou manualmente:
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python -m spacy download pt_core_news_sm
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('vader_lexicon')"
```

## ⚙️ Configuração

1. Copie `.env.example` para `.env`
2. Configure as variáveis de ambiente:

```env
# Ambiente
ENVIRONMENT=development

# API do Scraper
SCRAPER_API_HOST=127.0.0.1
SCRAPER_API_PORT=8000

# Banco de Dados
DATABASE_PATH=../data/briefflow.db

# API do BriefFlow
BRIEFFLOW_API_URL=http://localhost:5001
```

## 🚀 Execução

```bash
# Ativar ambiente virtual
# Windows: venv\Scripts\activate.bat
# Linux/macOS: source venv/bin/activate

# Iniciar API do scraper
python main.py
```

A API estará disponível em: http://localhost:8000

## 📖 Documentação da API

### Endpoints Principais

- `GET /` - Health check
- `GET /health` - Health check detalhado
- `GET /clients` - Listar clientes
- `GET /clients/{client_id}/sources` - Fontes de um cliente
- `POST /scrape` - Iniciar tarefa de scraping
- `GET /tasks/{task_id}` - Status da tarefa
- `POST /scrape-url` - Scraping de URL específica
- `POST /test-source` - Testar fonte

### Exemplos de Uso

#### Iniciar Scraping

```bash
curl -X POST "http://localhost:8000/scrape" \
  -H "Content-Type: application/json" \
  -d '{
    "client_ids": ["client-1"],
    "force_rescrape": false
  }'
```

#### Verificar Status da Tarefa

```bash
curl "http://localhost:8000/tasks/task-id-here"
```

#### Fazer Scraping de URL Específica

```bash
curl -X POST "http://localhost:8000/scrape-url" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/article"}'
```

#### Testar Fonte

```bash
curl -X POST "http://localhost:8000/test-source" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/feed.xml",
    "source_type": "rss"
  }'
```

## 🏗️ Estrutura

```
scraper/
├── main.py                 # Ponto de entrada
├── requirements.txt        # Dependências Python
├── .env                  # Configuração
├── src/
│   ├── api/
│   │   ├── server.py     # API FastAPI
│   │   └── __init__.py
│   ├── models/
│   │   ├── scraper.py   # Modelos de dados
│   │   ├── database.py  # Interface SQLite
│   │   └── __init__.py
│   ├── scrapers/
│   │   ├── rss_scraper.py    # Scraper RSS
│   │   ├── web_scraper.py    # Scraper Web
│   │   ├── scraper_manager.py # Gerenciador
│   │   └── __init__.py
│   ├── processors/
│   │   └── __init__.py
│   └── utils/
│       ├── config.py     # Configuração
│       ├── logger.py     # Logging
│       └── __init__.py
├── data/                # Diretório de dados
├── logs/                # Logs
└── venv/               # Ambiente virtual
```

## 🔍 Tipos de Fontes Suportados

1. **RSS/Atom Feeds**
   - Extração automática de título, conteúdo, autor e data
   - Suporte para namespaces populares
   - Detecção de conteúdo duplicado

2. **Blogs e Sites de Notícias**
   - Detecção automática de estrutura do site
   - Suporte para WordPress, Medium e plataformas populares
   - Extração de título, conteúdo, autor, data e tags

3. **YouTube** (em desenvolvimento)
   - Extração de metadados de vídeos
   - Transcrição de conteúdo

## 📊 Fluxo de Processamento

1. **Descoberta**: Identificar URLs de artigos
2. **Extração**: Baixar e parsear conteúdo
3. **Limpeza**: Remover HTML e formatação
4. **Validação**: Verificar qualidade do conteúdo
5. **Armazenamento**: Salvar no banco SQLite
6. **Análise**: Processamento com NLP (opcional)

## 🛠️ Desenvolvimento

### Executar Testes

```bash
python -m pytest tests/
```

### Formatar Código

```bash
black src/
flake8 src/
```

### Logs

Os logs são salvos em `logs/scraper.log` e também exibidos no console.

## 🤝 Integração com Backend Node.js

O scraper se integra com o backend através:

1. **Banco de dados SQLite compartilhado**
2. **API REST para comunicação**
3. **Webhooks para notificações** (em desenvolvimento)

## 🔒 Segurança

- Rate limiting entre requisições
- Validação de conteúdo
- User-Agent personalizado
- Tratamento de erros robusto

## 📈 Monitoramento

- Health checks detalhados
- Métricas de scraping
- Status de tarefas em tempo real
- Logs estruturados

## 🚀 Próximos Passos

- [ ] Implementar scraper do YouTube
- [ ] Adicionar processamento de NLP
- [ ] Implementar agendamento automático
- [ ] Adicionar cache de conteúdo
- [ ] Implementar webhooks

## 📝 Licença

MIT License - Veja o arquivo LICENSE para detalhes.