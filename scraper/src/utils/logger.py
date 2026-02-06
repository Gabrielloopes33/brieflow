"""
Configuração de logging do scraper
"""

import logging
import sys
from pathlib import Path

# Tentar importar loguru
try:
    from loguru import logger
    HAS_LOGURU = True
except ImportError:
    HAS_LOGURU = False
    logger = None

def setup_logger():
    """Configurar o logger personalizado"""
    # Usar logging padrão para evitar problemas de encoding
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    # Criar logger com interface compatível
    class SimpleLogger:
        def info(self, message, *args, **kwargs):
            # Limpar mensagem para remover caracteres problemáticos
            clean_msg = str(message).encode('ascii', errors='ignore').decode('ascii')
            logging.info(clean_msg, *args, **kwargs)
        
        def debug(self, message, *args, **kwargs):
            clean_msg = str(message).encode('ascii', errors='ignore').decode('ascii')
            logging.debug(clean_msg, *args, **kwargs)
        
        def warning(self, message, *args, **kwargs):
            clean_msg = str(message).encode('ascii', errors='ignore').decode('ascii')
            logging.warning(clean_msg, *args, **kwargs)
        
        def error(self, message, *args, **kwargs):
            clean_msg = str(message).encode('ascii', errors='ignore').decode('ascii')
            logging.error(clean_msg, *args, **kwargs)
    
    return SimpleLogger()