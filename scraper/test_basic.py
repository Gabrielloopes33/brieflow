#!/usr/bin/env python3
"""
Script de teste básico para o scraper
"""

import sys
import os
from pathlib import Path

# Adicionar o diretório src ao path
sys.path.append(str(Path(__file__).parent / "src"))

def test_imports():
    """Testar se todos os módulos podem ser importados"""
    print("🧪 Testando importações...")
    
    try:
        from utils.config import Config
        print("✅ Config importado")
    except Exception as e:
        print(f"❌ Erro ao importar Config: {e}")
        return False
    
    try:
        from models.scraper import SourceType, ScrapedContent
        print("✅ Models importados")
    except Exception as e:
        print(f"❌ Erro ao importar Models: {e}")
        return False
    
    try:
        from models.database import Database
        print("✅ Database importado")
    except Exception as e:
        print(f"❌ Erro ao importar Database: {e}")
        return False
    
    try:
        from scrapers.rss_scraper import RSScraper
        print("✅ RSScraper importado")
    except Exception as e:
        print(f"❌ Erro ao importar RSScraper: {e}")
        return False
    
    try:
        from scrapers.web_scraper import WebScraper
        print("✅ WebScraper importado")
    except Exception as e:
        print(f"❌ Erro ao importar WebScraper: {e}")
        return False
    
    try:
        from scrapers.scraper_manager import ScraperManager
        print("✅ ScraperManager importado")
    except Exception as e:
        print(f"❌ Erro ao importar ScraperManager: {e}")
        return False
    
    try:
        from api.server import app
        print("✅ API importada")
    except Exception as e:
        print(f"❌ Erro ao importar API: {e}")
        return False
    
    print("✅ Todos os módulos importados com sucesso!")
    return True

def test_database():
    """Testar conexão com o banco de dados"""
    print("\n🗄️  Testando banco de dados...")
    
    try:
        from models.database import Database
        db = Database()
        print("✅ Conexão com banco estabelecida")
        
        # Testar obter clientes
        clients = db.get_clients()
        print(f"✅ Clientes obtidos: {len(clients)}")
        
        # Testar obter fontes
        sources = db.get_all_active_sources()
        print(f"✅ Fontes ativas obtidas: {len(sources)}")
        
        return True
    except Exception as e:
        print(f"❌ Erro no banco de dados: {e}")
        return False

def test_rss_scraper():
    """Testar scraper RSS"""
    print("\n📡 Testando scraper RSS...")
    
    try:
        from scrapers.rss_scraper import RSScraper
        scraper = RSScraper()
        
        # Usar feed de exemplo
        feed_url = "https://feeds.bbci.co.uk/news/rss.xml"
        print(f"📥 Testando com feed: {feed_url}")
        
        contents = scraper.scrape(feed_url, max_items=2)
        print(f"✅ {len(contents)} itens coletados do feed RSS")
        
        if contents:
            print(f"📄 Exemplo: {contents[0].title}")
        
        return True
    except Exception as e:
        print(f"❌ Erro no scraper RSS: {e}")
        return False

def test_web_scraper():
    """Testar scraper web"""
    print("\n🌐 Testando scraper web...")
    
    try:
        from scrapers.web_scraper import WebScraper
        scraper = WebScraper()
        
        # Usar artigo de exemplo
        article_url = "https://www.python.org/about/"
        print(f"📥 Testando com página: {article_url}")
        
        content = scraper.scrape_single_article(article_url)
        if content:
            print(f"✅ Conteúdo extraído: {content.title}")
            print(f"📏 Comprimento: {len(content.content_text)} caracteres")
            return True
        else:
            print("⚠️  Nenhum conteúdo extraído")
            return True
    except Exception as e:
        print(f"❌ Erro no scraper web: {e}")
        return False

def main():
    """Função principal de teste"""
    print("🚀 Iniciando testes do BriefFlow Content Scraper")
    print("=" * 50)
    
    # Testar importações
    if not test_imports():
        print("\n❌ Falha nos testes de importação")
        sys.exit(1)
    
    # Testar banco de dados
    if not test_database():
        print("\n❌ Falha nos testes de banco de dados")
        sys.exit(1)
    
    # Testar scraper RSS (opcional, requer internet)
    # test_rss_scraper()
    
    # Testar scraper web (opcional, requer internet)
    # test_web_scraper()
    
    print("\n" + "=" * 50)
    print("🎉 Testes básicos concluídos com sucesso!")
    print("💡 Para testes completos, execute com acesso à internet")

if __name__ == "__main__":
    main()