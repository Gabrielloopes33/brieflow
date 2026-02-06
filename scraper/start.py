#!/usr/bin/env python3
"""
Script de inicialização do BriefFlow Content Scraper - Versão Corrigida
"""

import os
import sys
import subprocess
from pathlib import Path
import time

def check_python_version():
    """Verificar versão do Python"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("ERRO: Python 3.8+ e requerido")
        print(f"Versao atual: {version.major}.{version.minor}.{version.micro}")
        return False
    print(f"OK: Python {version.major}.{version.minor}.{version.micro}")
    return True

def check_dependencies():
    """Verificar dependências instaladas"""
    required_modules = [
        'fastapi',
        'uvicorn', 
        'requests',
        'beautifulsoup4',
        'feedparser',
        'pydantic',
        'python-dotenv'
    ]
    
    missing_modules = []
    for module in required_modules:
        try:
            __import__(module)
        except ImportError:
            missing_modules.append(module)
    
    if missing_modules:
        print(f"AVISO: Modulos faltando: {', '.join(missing_modules)}")
        print("Tentando instalar dependencias...")
        return False
    
    print("OK: Todas as dependencias estao instaladas")
    return True

def check_database():
    """Verificar banco de dados"""
    db_path = Path(__file__).parent.parent / "data" / "briefflow.db"
    if db_path.exists():
        print(f"OK: Banco de dados encontrado em {db_path}")
        return True
    else:
        print(f"AVISO: Banco de dados nao encontrado em {db_path}")
        print("Ele sera criado automaticamente na primeira execucao")
        return True

def start_scraper():
    """Iniciar o scraper"""
    print("=" * 60)
    print("BriefFlow Content Scraper - Inicializacao")
    print("=" * 60)
    
    # Verificar pré-requisitos
    if not check_python_version():
        return False
    
    if not check_dependencies():
        return False
    
    if not check_database():
        return False
    
    print("\nIniciando o scraper...")
    print("Acesse: http://127.0.0.1:8000")
    print("Documentacao: http://127.0.0.1:8000/docs")
    print("API: http://127.0.0.1:8000/api")
    print("\nPressione CTRL+C para parar")
    print("=" * 60)
    
    # Adicionar diretório src ao path
    src_path = Path(__file__).parent / "src"
    if str(src_path) not in sys.path:
        sys.path.insert(0, str(src_path))
    
    try:
        # Importar e iniciar o servidor
        from api.server import app
        from utils.config import Config
        import uvicorn
        
        config = Config()
        
        # Iniciar o servidor
        uvicorn.run(
            app,
            host="127.0.0.1",
            port=8000,
            reload=False,
            log_level="warning"  # Reduzir logs do uvicorn
        )
        
    except ImportError as e:
        print(f"ERRO: Falha ao importar modulos: {e}")
        return False
    except Exception as e:
        print(f"ERRO: Falha ao iniciar servidor: {e}")
        return False

def main():
    """Função principal"""
    try:
        success = start_scraper()
        if not success:
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n\nScraper interrompido pelo usuario")
    except Exception as e:
        print(f"ERRO FATAL: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()