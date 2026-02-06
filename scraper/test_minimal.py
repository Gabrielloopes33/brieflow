#!/usr/bin/env python3
"""
Script de teste mínimo para o scraper
"""

import sys
import os
from pathlib import Path

# Adicionar o diretório src ao path
sys.path.append(str(Path(__file__).parent / "src"))

def test_basic_structure():
    """Testar estrutura básica do projeto"""
    print("Testando estrutura basica...")
    
    # Verificar diretórios
    required_dirs = [
        "src",
        "src/api",
        "src/models", 
        "src/scrapers",
        "src/utils",
        "src/processors"
    ]
    
    for dir_path in required_dirs:
        if Path(dir_path).exists():
            print(f"[OK] Diretorio {dir_path} existe")
        else:
            print(f"[ERRO] Diretorio {dir_path} nao encontrado")
            return False
    
    # Verificar arquivos principais
    required_files = [
        "main.py",
        "requirements.txt",
        ".env",
        "src/utils/config.py",
        "src/models/scraper.py",
        "src/scrapers/rss_scraper.py",
        "src/scrapers/web_scraper.py",
        "src/api/server.py"
    ]
    
    for file_path in required_files:
        if Path(file_path).exists():
            print(f"[OK] Arquivo {file_path} existe")
        else:
            print(f"[ERRO] Arquivo {file_path} nao encontrado")
            return False
    
    return True

def test_imports_minimal():
    """Testar importações mínimas"""
    print("\nTestando importacoes minimas...")
    
    try:
        # Testar import básico
        import json
        print("[OK] json importado")
        
        import sqlite3
        print("[OK] sqlite3 importado")
        
        from datetime import datetime
        print("[OK] datetime importado")
        
        # Testar imports do projeto
        sys.path.insert(0, 'src')
        
        from models.scraper import SourceType, ScrapedContent
        print("[OK] Models basicos importados")
        
        print("[OK] Importacoes basicas funcionando!")
        return True
        
    except Exception as e:
        print(f"[ERRO] Erro nas importacoes: {e}")
        return False

def test_database_connection():
    """Testar criação do banco de dados"""
    print("\nTestando banco de dados...")
    
    try:
        # Importar sqlite3 aqui para garantir que está disponível
        import sqlite3
        from datetime import datetime
        
        # Criar diretório de dados se não existir
        data_dir = Path("../data")
        data_dir.mkdir(exist_ok=True)
        
        # Criar banco de teste
        db_path = data_dir / "test.db"
        conn = sqlite3.connect(str(db_path))
        
        # Criar tabela de teste
        conn.execute("""
            CREATE TABLE IF NOT EXISTS test (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                created_at INTEGER
            )
        """)
        
        # Inserir dados de teste
        conn.execute(
            "INSERT INTO test (id, name, created_at) VALUES (?, ?, ?)",
            ("test-1", "Teste", int(datetime.now().timestamp() * 1000))
        )
        
        # Consultar dados
        cursor = conn.execute("SELECT * FROM test")
        row = cursor.fetchone()
        
        conn.close()
        
        if row:
            print(f"[OK] Banco de dados funcionando: {row}")
            # Limpar arquivo de teste
            db_path.unlink()
            return True
        else:
            print("[ERRO] Falha na insercao/consulta")
            return False
            
    except Exception as e:
        print(f"[ERRO] Erro no banco de dados: {e}")
        return False

def create_minimal_env():
    """Criar ambiente mínimo para teste"""
    print("\nCriando ambiente minimo...")
    
    # Criar .env se não existir
    env_file = Path(".env")
    if not env_file.exists():
        print("Criando .env basico...")
        env_content = """
# Configuracoes minimas para teste
ENVIRONMENT=development
SCRAPER_API_HOST=127.0.0.1
SCRAPER_API_PORT=8000
DATABASE_PATH=../data/briefflow.db
BRIEFFLOW_API_URL=http://localhost:5001
USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
REQUEST_DELAY=1.0
MAX_RETRIES=3
REQUEST_TIMEOUT=30
CONTENT_MIN_LENGTH=100
CONTENT_MAX_LENGTH=50000
"""
        env_file.write_text(env_content.strip())
        print("[OK] Arquivo .env criado")
    else:
        print("[OK] Arquivo .env ja existe")
    
    # Criar diretório de dados
    data_dir = Path("../data")
    data_dir.mkdir(exist_ok=True)
    print(f"[OK] Diretorio de dados: {data_dir.absolute()}")
    
    # Criar diretório de logs
    logs_dir = Path("logs")
    logs_dir.mkdir(exist_ok=True)
    print(f"[OK] Diretorio de logs: {logs_dir.absolute()}")

def main():
    """Função principal de teste"""
    print("Iniciando testes minimos do BriefFlow Content Scraper")
    print("=" * 60)
    
    # Verificar estrutura
    if not test_basic_structure():
        print("\nFalha na verificacao de estrutura")
        sys.exit(1)
    
    # Criar ambiente mínimo
    create_minimal_env()
    
    # Testar importações
    if not test_imports_minimal():
        print("\nFalha nos testes de importacao")
        sys.exit(1)
    
    # Testar banco de dados
    if not test_database_connection():
        print("\nFalha nos testes de banco de dados")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("Testes minimos concluidos com sucesso!")
    print("\nProximos passos:")
    print("1. Instale as dependencias: pip install -r requirements-min.txt")
    print("2. Execute o scraper: python main.py")
    print("3. Acesse a API: http://localhost:8000")
    print("4. Acesse a documentacao: http://localhost:8000/docs")

if __name__ == "__main__":
    main()