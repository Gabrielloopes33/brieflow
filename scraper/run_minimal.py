import os
import sys
from pathlib import Path

# Adicionar src ao path
sys.path.insert(0, str(Path(__file__).parent / "src"))

# Configurar encoding para Windows
if sys.platform == "win32":
    import locale
    locale.setlocale(locale.LC_ALL, 'C.UTF-8')

# Iniciar servidor mínimo
print("Starting server...")
try:
    from api.server import app
    import uvicorn
    
    # Iniciar sem logs problemáticos
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8002,
        reload=False,
        access_log=False,
        log_level="error"
    )
except Exception as e:
    print(f"Error: {e}")
    input("Press Enter to exit...")