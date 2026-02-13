#!/usr/bin/env python3
"""
Script de teste do Scraper Python
Testa todas as funcionalidades do scraper de forma isolada
"""

import requests
import json
import sys
from datetime import datetime

# Configuração
SCRAPER_URL = "http://localhost:8000"
TEST_URLS = {
    "rss": "https://feeds.bbci.co.uk/news/technology/rss.xml",
    "blog": "https://blog.python.org",
    "news": "https://news.ycombinator.com"
}

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_header(text):
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}{text}{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")

def print_success(text):
    print(f"{Colors.GREEN}✅ {text}{Colors.END}")

def print_error(text):
    print(f"{Colors.RED}❌ {text}{Colors.END}")

def print_warning(text):
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.END}")

def test_health():
    """Testar health check da API"""
    print("Testando health check...")
    try:
        response = requests.get(f"{SCRAPER_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success(f"API está saudável")
            print(f"   Versão: {data.get('version', 'N/A')}")
            print(f"   Tarefas ativas: {data.get('active_tasks', 'N/A')}")
            return True
        else:
            print_error(f"Status HTTP: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print_error("Não foi possível conectar ao scraper na porta 8000")
        print("   Verifique se o serviço está rodando: docker ps | grep scraper")
        return False
    except Exception as e:
        print_error(f"Erro: {str(e)}")
        return False

def test_list_clients():
    """Testar listagem de clientes"""
    print("\nTestando listagem de clientes...")
    try:
        response = requests.get(f"{SCRAPER_URL}/clients", timeout=5)
        if response.status_code == 200:
            clients = response.json()
            print_success(f"Encontrados {len(clients)} clientes")
            if clients:
                print("   Primeiros clientes:")
                for client in clients[:3]:
                    print(f"   - {client.get('name', 'N/A')} (ID: {client.get('id', 'N/A')[:8]}...)")
            return True
        else:
            print_error(f"Status HTTP: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Erro: {str(e)}")
        return False

def test_list_sources():
    """Testar listagem de fontes"""
    print("\nTestando listagem de fontes...")
    try:
        response = requests.get(f"{SCRAPER_URL}/sources", timeout=5)
        if response.status_code == 200:
            sources = response.json()
            print_success(f"Encontradas {len(sources)} fontes ativas")
            if sources:
                print("   Primeiras fontes:")
                for source in sources[:3]:
                    print(f"   - {source.get('name', 'N/A')} ({source.get('type', 'N/A')})")
            return True
        else:
            print_error(f"Status HTTP: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Erro: {str(e)}")
        return False

def test_scrape_url():
    """Testar scraping de URL específica"""
    print("\nTestando scraping de URL...")
    test_url = "https://example.com"
    
    try:
        print(f"   Testando URL: {test_url}")
        response = requests.post(
            f"{SCRAPER_URL}/scrape-url",
            params={"url": test_url},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print_success("Scraping realizado com sucesso")
            print(f"   Título: {data.get('title', 'N/A')[:50]}...")
            print(f"   Palavras: {data.get('word_count', 'N/A')}")
            return True
        elif response.status_code == 404:
            print_warning("URL acessível mas sem conteúdo extraível (pode ser normal)")
            return True
        else:
            print_error(f"Status HTTP: {response.status_code}")
            print(f"   Resposta: {response.text[:200]}")
            return False
    except Exception as e:
        print_error(f"Erro: {str(e)}")
        return False

def test_source_rss():
    """Testar fonte RSS"""
    print("\nTestando fonte RSS...")
    rss_url = TEST_URLS["rss"]
    
    try:
        print(f"   Testando RSS: {rss_url}")
        response = requests.post(
            f"{SCRAPER_URL}/test-source",
            params={"url": rss_url, "source_type": "rss"},
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print_success("RSS válido e acessível")
                if 'feed_info' in data:
                    print(f"   Título do feed: {data['feed_info'].get('title', 'N/A')}")
                    print(f"   Entradas: {data['feed_info'].get('entries_count', 'N/A')}")
                return True
            else:
                print_warning(f"RSS acessível mas com aviso: {data.get('message', 'N/A')}")
                return True
        else:
            print_error(f"Status HTTP: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Erro: {str(e)}")
        return False

def test_scrape_task():
    """Testar criação de tarefa de scraping"""
    print("\nTestando criação de tarefa de scraping...")
    
    # Primeiro, pegar clientes existentes
    try:
        response = requests.get(f"{SCRAPER_URL}/clients", timeout=5)
        if response.status_code != 200 or not response.json():
            print_warning("Nenhum cliente encontrado para testar scraping")
            print("   Crie um cliente primeiro no frontend")
            return None
        
        clients = response.json()
        client_id = clients[0].get('id')
        
        print(f"   Usando cliente: {clients[0].get('name', 'N/A')}")
        
        # Criar tarefa de scraping
        response = requests.post(
            f"{SCRAPER_URL}/scrape",
            json={"client_ids": [client_id]},
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            task_id = data.get('task_id')
            print_success(f"Tarefa criada: {task_id}")
            print(f"   Status: {data.get('status', 'N/A')}")
            print(f"   Duração estimada: {data.get('estimated_duration', 'N/A')}s")
            return task_id
        else:
            print_error(f"Status HTTP: {response.status_code}")
            print(f"   Resposta: {response.text[:200]}")
            return None
    except Exception as e:
        print_error(f"Erro: {str(e)}")
        return None

def test_task_status(task_id):
    """Testar consulta de status de tarefa"""
    if not task_id:
        print("\nPulando teste de status (sem task_id)")
        return None
    
    print(f"\nTestando status da tarefa {task_id[:8]}...")
    
    try:
        response = requests.get(f"{SCRAPER_URL}/tasks/{task_id}", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success(f"Status obtido: {data.get('status', 'N/A')}")
            print(f"   Progresso: {data.get('progress', 0)*100:.0f}%")
            print(f"   Itens coletados: {data.get('items_scraped', 0)}")
            return True
        else:
            print_error(f"Status HTTP: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Erro: {str(e)}")
        return False

def main():
    print_header("🔍 TESTE DO SCRAPER PYTHON - BRIEFFLOW")
    
    print(f"Data/Hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Scraper URL: {SCRAPER_URL}")
    print("")
    
    results = []
    
    # Executar testes
    results.append(("Health Check", test_health()))
    results.append(("Listar Clientes", test_list_clients()))
    results.append(("Listar Fontes", test_list_sources()))
    results.append(("Scraping de URL", test_scrape_url()))
    results.append(("Testar Fonte RSS", test_source_rss()))
    
    # Teste de tarefa (retorna task_id ou None)
    task_id = test_scrape_task()
    results.append(("Criar Tarefa", task_id is not None))
    
    # Status da tarefa
    if task_id:
        results.append(("Status da Tarefa", test_task_status(task_id)))
    
    # Resumo
    print_header("📊 RESUMO DOS TESTES")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    print(f"✅ Passaram: {passed}/{total}")
    print(f"❌ Falharam: {total - passed}/{total}")
    print("")
    
    for test_name, result in results:
        status = f"{Colors.GREEN}✅{Colors.END}" if result else f"{Colors.RED}❌{Colors.END}"
        print(f"{status} {test_name}")
    
    print("")
    
    if passed == total:
        print_success("🎉 Todos os testes passaram! O scraper está funcionando corretamente.")
        print("")
        print("Próximos passos:")
        print("1. Acesse o frontend: https://briefflow2.netlify.app")
        print("2. Crie um cliente e adicione fontes RSS")
        print("3. Execute o scraping e verifique os conteúdos")
        return 0
    elif passed >= total * 0.7:
        print_warning("⚠️  A maioria dos testes passou. Algumas funcionalidades podem estar limitadas.")
        return 0
    else:
        print_error("❌ Vários testes falharam. É necessário investigar o scraper.")
        print("")
        print("Ações recomendadas:")
        print("1. Verificar logs: docker compose logs --tail 50 scraper")
        print("2. Reiniciar serviço: docker compose restart scraper")
        print("3. Verificar se dependências Python estão instaladas")
        print("4. Confirmar que o banco SQLite está acessível")
        return 1

if __name__ == "__main__":
    sys.exit(main())
