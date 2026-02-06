#!/usr/bin/env python3
"""
BriefFlow Content Scraper - Versao Windows Limpa
"""

import os
import sys
from pathlib import Path

# Adicionar diretorio src ao path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

def main():
    print("Iniciando BriefFlow Content Scraper")
    print("=" * 50)
    
    try:
        # Importar o servidor
        from api.server import app
        import uvicorn
        
        print("API importada com sucesso")
        print("Iniciando servidor na porta 8001...")
        print("Acesse: http://localhost:8001")
        print("Docs: http://localhost:8001/docs")
        print("=" * 50)
        
        # Iniciar o servidor
        uvicorn.run(
            app,
            host="localhost",
            port=8001,
            reload=False,
            log_level="warning"
        )
        
    except ImportError as e:
        print(f"ERRO: Falha ao importar: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"ERRO: Falha ao iniciar: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()