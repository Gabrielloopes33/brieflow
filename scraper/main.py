#!/usr/bin/env python3
"""
BriefFlow Content Scraper
Sistema de coleta de conteúdo de múltiplas fontes
"""

import os
import sys
import logging
from pathlib import Path
from datetime import datetime

# Adicionar o diretório src ao path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

# Importar sem prefixo src
from api.server import app
from utils.config import Config
from utils.logger import setup_logger

def main():
    """Função principal do scraper"""
    # Configurar logging
    setup_logger()
    logger = logging.getLogger(__name__)
    
    logger.info("🚀 Iniciando BriefFlow Content Scraper")
    
    # Carregar configuração
    config = Config()
    
    # Verificar se o ambiente está configurado
    if not config.validate():
        logger.error("❌ Configuração inválida. Verifique o arquivo .env")
        sys.exit(1)
    
    logger.info("✅ Configuração validada com sucesso")
    logger.info(f"📂 Diretório de trabalho: {Path.cwd()}")
    logger.info(f"🗄️  Banco de dados: {config.get_database_path()}")
    
    # Iniciar a API do scraper
    import uvicorn
    
    logger.info("🌐 Iniciando servidor API do scraper")
    if config.is_development():
        uvicorn.run(
            app,
            host=config.get_api_host(),
            port=config.get_api_port(),
            reload=False  # Desativar reload para evitar problemas
        )
    else:
        uvicorn.run(
            app,
            host=config.get_api_host(),
            port=config.get_api_port()
        )

if __name__ == "__main__":
    main()