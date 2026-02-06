"""
Arquivo de configuração do scraper
"""

import os
from pathlib import Path
from typing import Optional

# Tentar carregar dotenv
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("⚠️  python-dotenv não instalado. Use variáveis de ambiente do sistema.")

class Config:
    """Classe de configuração do scraper"""
    
    def __init__(self):
        """Inicializar configuração"""
        self.base_dir = Path(__file__).parent.parent
        self.data_dir = self.base_dir / "data"
        self.data_dir.mkdir(exist_ok=True)
    
    def is_development(self) -> bool:
        """Verificar se está em modo desenvolvimento"""
        return os.getenv("ENVIRONMENT", "development").lower() == "development"
    
    def get_api_host(self) -> str:
        """Obter host da API"""
        return os.getenv("SCRAPER_API_HOST", "127.0.0.1")
    
    def get_api_port(self) -> int:
        """Obter porta da API"""
        return int(os.getenv("SCRAPER_API_PORT", "8000"))
    
    def get_database_path(self) -> Path:
        """Obter caminho do banco de dados SQLite"""
        db_path = os.getenv("DATABASE_PATH")
        if db_path:
            return Path(db_path)
        
        # Caminho padrão relativo ao backend Node.js
        backend_dir = self.base_dir.parent
        return backend_dir / "data" / "briefflow.db"
    
    def get_briefflow_api_url(self) -> str:
        """Obter URL da API do BriefFlow"""
        return os.getenv("BRIEFFLOW_API_URL", "http://localhost:5001")
    
    def get_briefflow_api_key(self) -> Optional[str]:
        """Obter chave de API do BriefFlow"""
        return os.getenv("BRIEFFLOW_API_KEY")
    
    def get_youtube_api_key(self) -> Optional[str]:
        """Obter chave de API do YouTube"""
        return os.getenv("YOUTUBE_API_KEY")
    
    def get_user_agent(self) -> str:
        """Obter User-Agent para requests"""
        return os.getenv(
            "USER_AGENT",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        )
    
    def get_request_delay(self) -> float:
        """Obter delay entre requests em segundos"""
        return float(os.getenv("REQUEST_DELAY", "1.0"))
    
    def get_max_retries(self) -> int:
        """Obter número máximo de tentativas"""
        return int(os.getenv("MAX_RETRIES", "3"))
    
    def get_timeout(self) -> int:
        """Obter timeout de requests em segundos"""
        return int(os.getenv("REQUEST_TIMEOUT", "30"))
    
    def get_content_min_length(self) -> int:
        """Obter comprimento mínimo do conteúdo"""
        return int(os.getenv("CONTENT_MIN_LENGTH", "100"))
    
    def get_content_max_length(self) -> int:
        """Obter comprimento máximo do conteúdo"""
        return int(os.getenv("CONTENT_MAX_LENGTH", "50000"))
    
    def validate(self) -> bool:
        """Validar configuração básica"""
        try:
            # Verificar se o diretório do banco de dados existe
            db_path = self.get_database_path()
            if not db_path.parent.exists():
                print(f"⚠️  Diretório do banco não existe: {db_path.parent}")
            
            # Verificar se o caminho do banco é válido
            if not str(db_path).endswith('.db'):
                print(f"⚠️  Caminho do banco inválido: {db_path}")
                return False
            
            return True
        except Exception as e:
            print(f"❌ Erro na validação: {e}")
            return False