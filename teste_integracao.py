# Script de Teste Rápido da Integração
# Uso: python teste_integracao.py

import requests
import sys
import time

# Cores para output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
RESET = '\033[0m'

def testar_endpoint(url, descricao):
    """Testa um endpoint e retorna o resultado"""
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            print(f"{GREEN}✅{RESET} {descricao}")
            return True
        else:
            print(f"{RED}❌{RESET} {descricao} - Status: {response.status_code}")
            return False
    except Exception as e:
        print(f"{RED}❌{RESET} {descricao} - Erro: {str(e)}")
        return False

def main():
    print("🧪 Testando integração BriefFlow...\n")
    
    # Testar Node.js backend
    print(f"{YELLOW}1. Testando Backend Node.js (porta 5000):{RESET}")
    node_ok = testar_endpoint("http://localhost:5000/api/health", "Health check Node.js")
    
    if not node_ok:
        print(f"\n{RED}⚠️  Backend Node.js não está rodando!{RESET}")
        print("Inicie com: npm run dev")
        sys.exit(1)
    
    # Testar Scraper Python
    print(f"\n{YELLOW}2. Testando Scraper Python (porta 8000):{RESET}")
    scraper_ok = testar_endpoint("http://localhost:8000/", "Health check Scraper")
    
    if not scraper_ok:
        print(f"\n{RED}⚠️  Scraper Python não está rodando!{RESET}")
        print("Inicie com:")
        print("  cd scraper")
        print("  python src/api/server.py")
        sys.exit(1)
    
    # Testar integração
    print(f"\n{YELLOW}3. Testando Integração (Node.js → Python):{RESET}")
    integracao_ok = testar_endpoint("http://localhost:5000/api/scraper/health", "Integração Node-Python")
    
    if integracao_ok:
        try:
            response = requests.get("http://localhost:5000/api/scraper/health")
            data = response.json()
            print(f"   Status: {data.get('status', 'unknown')}")
            print(f"   Scraper URL: {data.get('scraper_url', 'unknown')}")
        except:
            pass
    
    # Resumo
    print(f"\n{YELLOW}═══════════════════════════════════{RESET}")
    if node_ok and scraper_ok and integracao_ok:
        print(f"{GREEN}🎉 TUDO FUNCIONANDO!{RESET}")
        print(f"\nPróximos passos:")
        print(f"  1. Acesse: http://localhost:5000")
        print(f"  2. Crie um cliente e adicione fontes")
        print(f"  3. Teste o scraping via API")
        print(f"\nVeja o guia: TESTE_GUIA.md")
    else:
        print(f"{RED}⚠️  ALGUNS SERVIÇOS NÃO ESTÃO FUNCIONANDO{RESET}")
        if not node_ok:
            print(f"  - Inicie o backend: npm run dev")
        if not scraper_ok:
            print(f"  - Inicie o scraper: cd scraper && python src/api/server.py")
    print(f"{YELLOW}═══════════════════════════════════{RESET}\n")

if __name__ == "__main__":
    main()
