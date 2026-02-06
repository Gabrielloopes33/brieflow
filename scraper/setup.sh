#!/bin/bash

echo "🐍 Configurando ambiente Python para o BriefFlow Content Scraper"

# Verificar se Python 3.8+ está instalado
python_version=$(python3 --version 2>&1 | awk '{print $2}')
required_version="3.8"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ Python $required_version ou superior é necessário. Versão atual: $python_version"
    exit 1
fi

echo "✅ Python $python_version detected"

# Criar ambiente virtual
if [ ! -d "venv" ]; then
    echo "📦 Criando ambiente virtual..."
    python3 -m venv venv
fi

# Ativar ambiente virtual
echo "🔧 Ativando ambiente virtual..."
source venv/bin/activate

# Atualizar pip
echo "⬆️  Atualizando pip..."
pip install --upgrade pip

# Instalar dependências
echo "📚 Instalando dependências..."
pip install -r requirements.txt

# Baixar modelos do spaCy (se necessário)
echo "🧠 Baixando modelos do spaCy..."
python -m spacy download en_core_web_sm
python -m spacy download pt_core_news_sm

# Baixar dados do NLTK
echo "📖 Baixando dados do NLTK..."
python -c "
import nltk
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('vader_lexicon')
print('✅ NLTK data baixado com sucesso')
"

echo "🎉 Ambiente Python configurado com sucesso!"
echo ""
echo "Para usar o scraper:"
echo "1. Ative o ambiente virtual: source venv/bin/activate"
echo "2. Configure o arquivo .env"
echo "3. Execute: python main.py"
echo ""
echo "A API do scraper estará disponível em: http://localhost:8000"
echo "Documentação: http://localhost:8000/docs"