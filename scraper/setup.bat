@echo off
echo 🐍 Configurando ambiente Python para o BriefFlow Content Scraper

REM Verificar se Python está instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python não encontrado. Por favor, instale Python 3.8 ou superior.
    pause
    exit /b 1
)

echo ✅ Python detectado

REM Criar ambiente virtual
if not exist "venv" (
    echo 📦 Criando ambiente virtual...
    python -m venv venv
)

REM Ativar ambiente virtual
echo 🔧 Ativando ambiente virtual...
call venv\Scripts\activate.bat

REM Atualizar pip
echo ⬆️  Atualizando pip...
python -m pip install --upgrade pip

REM Instalar dependências
echo 📚 Instalando dependências...
pip install -r requirements.txt

REM Baixar modelos do spaCy
echo 🧠 Baixando modelos do spaCy...
python -m spacy download en_core_web_sm
python -m spacy download pt_core_news_sm

REM Baixar dados do NLTK
echo 📖 Baixando dados do NLTK...
python -c "
import nltk
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('vader_lexicon')
print('✅ NLTK data baixado com sucesso')
"

echo 🎉 Ambiente Python configurado com sucesso!
echo.
echo Para usar o scraper:
echo 1. Ative o ambiente virtual: venv\Scripts\activate.bat
echo 2. Configure o arquivo .env
echo 3. Execute: python main.py
echo.
echo A API do scraper estará disponível em: http://localhost:8000
echo Documentação: http://localhost:8000/docs
pause