#!/usr/bin/env python3
"""
BriefFlow Content Scraper - Versão Simplificada
Sistema de coleta de conteúdo de múltiplas fontes
"""

import os
import sys
from pathlib import Path
from datetime import datetime

# Adicionar o diretório src ao path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

def main():
    """Função principal do scraper"""
    print(f"Iniciando BriefFlow Content Scraper - {datetime.now()}")
    
    try:
        # Importar módulos necessários
        from api.server import app
        from utils.config import Config
        
        # Carregar configuração
        config = Config()
        
        print(f"Configuracao validada com sucesso")
        print(f"Diretorio de trabalho: {Path.cwd()}")
        print(f"Banco de dados: {config.get_database_path()}")
        
        # Iniciar a API do scraper
        import uvicorn
        
        print("Iniciando servidor API do scraper")
        uvicorn.run(
            app,
            host=config.get_api_host(),
            port=config.get_api_port(),
            reload=False
        )
        
    except Exception as e:
        print(f"Erro ao iniciar scraper: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()