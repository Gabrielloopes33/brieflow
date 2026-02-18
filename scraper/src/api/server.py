"""
API REST do scraper
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any
from datetime import datetime
import asyncio
import sys
from pathlib import Path

# Adicionar o diretório pai ao path para importações relativas
parent_dir = Path(__file__).parent.parent
sys.path.insert(0, str(parent_dir))

from models.scraper import (
    ScrapingRequest, ScrapingResponse, TaskStatusResponse,
    Source, Client, ScrapedContent, SourceType,
    ScrapeRequest, ScrapeResponse, SearchRequest, SearchResponse,
    AgentRequest, AgentResponse, MapRequest, MapResponse,
    CrawlRequest, CrawlResponse
)
from models.database import Database
from scrapers.scraper_manager import ScraperManager
from scrapers.web_scraper import WebScraper
from scrapers.search_scraper import SearchScraper
from scrapers.openai_agent_scraper import OpenAIAgentScraper
from scrapers.agent_scraper import AgentScraper
from scrapers.anthropic_agent_scraper import AnthropicAgentScraper
from scrapers.site_mapper import SiteMapper
from scrapers.web_crawler import WebCrawler
from utils.config import Config
from utils.logger import setup_logger

logger = setup_logger()

# Inicializar FastAPI
app = FastAPI(
    title="BriefFlow Content Scraper API",
    description="API para coleta de conteúdo de múltiplas fontes",
    version="1.0.0"
)

# Configurar CORS
config = Config()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar origens permitidas
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar componentes
db = Database()
scraper_manager = ScraperManager()
web_scraper = WebScraper()
search_scraper = SearchScraper()
openai_agent_scraper = OpenAIAgentScraper()
agent_scraper = AgentScraper()
anthropic_agent_scraper = AnthropicAgentScraper()
site_mapper = SiteMapper()
web_crawler = WebCrawler()

# Endpoint para health check
@app.get("/")
async def health_check():
    """Verificar saúde da API do scraper"""
    return {
        "status": "healthy",
        "service": "BriefFlow Content Scraper API",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/health")
async def detailed_health_check():
    """Health check detalhado"""
    return {
        "status": "healthy",
        "service": "BriefFlow Content Scraper API",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "database": {
            "path": str(config.get_database_path()),
            "accessible": True  # Em produção, verificar conexão real
        },
        "active_tasks": len(scraper_manager.get_all_tasks())
    }

# Endpoint para obter clientes
@app.get("/clients", response_model=List[Client])
async def get_clients():
    """Obter todos os clientes"""
    try:
        clients = db.get_clients()
        return clients
    except Exception as e:
        logger.error(f"❌ Erro ao obter clientes: {e}")
        raise HTTPException(status_code=500, detail="Erro ao obter clientes")

# Endpoint para obter fontes de um cliente
@app.get("/clients/{client_id}/sources", response_model=List[Source])
async def get_client_sources(client_id: str):
    """Obter fontes de um cliente"""
    try:
        sources = db.get_sources_by_client(client_id)
        return sources
    except Exception as e:
        logger.error(f"❌ Erro ao obter fontes do cliente {client_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro ao obter fontes do cliente")

# Endpoint para obter todas as fontes ativas
@app.get("/sources", response_model=List[Source])
async def get_all_sources():
    """Obter todas as fontes ativas"""
    try:
        sources = db.get_all_active_sources()
        return sources
    except Exception as e:
        logger.error(f"❌ Erro ao obter fontes: {e}")
        raise HTTPException(status_code=500, detail="Erro ao obter fontes")

# Endpoint para iniciar scraping
@app.post("/scrape", response_model=ScrapingResponse)
async def start_scraping(request: ScrapingRequest, background_tasks: BackgroundTasks):
    """
    Iniciar uma tarefa de scraping
    
    - **source_ids**: IDs específicos das fontes para scraping
    - **client_ids**: IDs dos clientes para scraping
    - **force_rescrape**: Forçar novo scraping mesmo se recente
    """
    try:
        # Validar requisição
        if not request.source_ids and not request.client_ids:
            raise HTTPException(
                status_code=400, 
                detail="É necessário especificar source_ids ou client_ids"
            )
        
        # Iniciar tarefa de scraping
        task_id = scraper_manager.start_scraping_task(
            source_ids=request.source_ids,
            client_ids=request.client_ids,
            force_rescrape=request.force_rescrape
        )
        
        logger.info(f"🚀 Tarefa de scraping iniciada: {task_id}")
        
        return ScrapingResponse(
            task_id=task_id,
            status="pending",
            estimated_duration=180  # 3 minutos estimado
        )
        
    except Exception as e:
        logger.error(f"❌ Erro ao iniciar scraping: {e}")
        raise HTTPException(status_code=500, detail="Erro ao iniciar scraping")

# Endpoint para obter status de tarefa
@app.get("/tasks/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(task_id: str):
    """Obter status de uma tarefa de scraping"""
    try:
        task = scraper_manager.get_task_status(task_id)
        
        if not task:
            raise HTTPException(status_code=404, detail="Tarefa não encontrada")
        
        # Calcular progresso estimado (simplificado)
        progress = 0.0
        if task.status == "completed":
            progress = 1.0
        elif task.status == "processing":
            progress = 0.5  # Estimado
        
        # Calcular conclusão estimada
        estimated_completion = None
        if task.status == "processing" and task.started_at:
            # Estimar 3 minutos totais
            from datetime import timedelta
            elapsed = (datetime.now() - task.started_at).total_seconds()
            remaining = max(0, 180 - elapsed)
            estimated_completion = datetime.now() + timedelta(seconds=remaining)
        
        return TaskStatusResponse(
            task_id=task.id,
            status=task.status,
            progress=progress,
            items_scraped=task.items_scraped,
            started_at=task.started_at,
            estimated_completion=estimated_completion,
            error_message=task.error_message
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao obter status da tarefa {task_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro ao obter status da tarefa")

# Endpoint para obter todas as tarefas
@app.get("/tasks", response_model=List[TaskStatusResponse])
async def get_all_tasks():
    """Obter todas as tarefas de scraping"""
    try:
        tasks = scraper_manager.get_all_tasks()
        
        responses = []
        for task in tasks:
            progress = 0.0
            if task.status == "completed":
                progress = 1.0
            elif task.status == "processing":
                progress = 0.5
            
            response = TaskStatusResponse(
                task_id=task.id,
                status=task.status,
                progress=progress,
                items_scraped=task.items_scraped,
                started_at=task.started_at,
                estimated_completion=None,
                error_message=task.error_message
            )
            responses.append(response)
        
        return responses
        
    except Exception as e:
        logger.error(f"❌ Erro ao obter tarefas: {e}")
        raise HTTPException(status_code=500, detail="Erro ao obter tarefas")

# Endpoint para fazer scraping de URL específica
@app.post("/scrape-url", response_model=Optional[ScrapedContent])
async def scrape_single_url(url: str):
    """
    Fazer scraping de uma URL específica
    
    - **url**: URL para scraping
    """
    try:
        if not url or not url.strip():
            raise HTTPException(status_code=400, detail="URL é obrigatória")
        
        content = scraper_manager.scrape_single_url(url.strip())
        
        if not content:
            raise HTTPException(
                status_code=404, 
                detail="Não foi possível extrair conteúdo da URL"
            )
        
        return content
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao fazer scraping da URL {url}: {e}")
        raise HTTPException(status_code=500, detail="Erro ao fazer scraping da URL")

# Endpoint para testar fonte
@app.post("/test-source")
async def test_source(url: str, source_type: SourceType):
    """
    Testar uma fonte antes de adicioná-la
    
    - **url**: URL da fonte
    - **source_type**: Tipo da fonte (rss, blog, news, youtube)
    """
    try:
        if not url or not url.strip():
            raise HTTPException(status_code=400, detail="URL é obrigatória")
        
        result = scraper_manager.test_source(url.strip(), source_type)
        
        return {
            "success": result["success"],
            "message": result["message"],
            "sample_content": result.get("sample_content"),
            "feed_info": result.get("feed_info")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao testar fonte {url}: {e}")
        raise HTTPException(status_code=500, detail="Erro ao testar fonte")

# Endpoint para obter conteúdos de um cliente
@app.get("/clients/{client_id}/contents")
async def get_client_contents(client_id: str, limit: int = 100):
    """Obter conteúdos de um cliente"""
    try:
        contents = db.get_contents_by_client(client_id, limit)
        return {
            "contents": contents,
            "count": len(contents)
        }
    except Exception as e:
        logger.error(f"❌ Erro ao obter conteúdos do cliente {client_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro ao obter conteúdos")

# Endpoint para informações da API
@app.get("/info")
async def get_api_info():
    """Obter informações da API"""
    return {
        "name": "BriefFlow Content Scraper API",
        "version": "1.0.0",
        "description": "API para coleta de conteúdo de múltiplas fontes",
        "supported_source_types": ["rss", "blog", "news"],
        "features": [
            "RSS/Atom feed scraping",
            "Web scraping genérico",
            "Agendamento de tarefas",
            "Monitoramento de progresso",
            "Teste de fontes",
            "Web search (Firecrawl)",
            "AI Agent (Z.ai)",
            "Site mapping",
            "Web crawling"
        ],
        "endpoints": {
            "health": "/health",
            "clients": "/clients",
            "sources": "/sources",
            "scraping": "/scrape",
            "task_status": "/tasks/{task_id}",
            "scrape_url": "/scrape-url",
            "test_source": "/test-source",
            "contents": "/clients/{client_id}/contents",
            "scrape": "/scrape (nova API)",
            "search": "/search",
            "agent": "/agent",
            "map": "/map",
            "crawl": "/crawl"
        }
    }

# ==================== NOVOS ENDPOINTS DO FRONTEND ====================

# Scrape URL com formatos específicos
@app.post("/scrape", response_model=ScrapeResponse)
async def scrape_url(request: ScrapeRequest):
    """
    Fazer scraping de URL com formatos específicos usando Firecrawl

    - url: URL para scraping
    - formats: Lista de formatos desejados (markdown, html, links)
    """
    try:
        logger.info(f"📖 Scraping URL: {request.url} (formats: {request.formats})")

        if not request.url or not request.url.strip():
            raise HTTPException(status_code=400, detail="URL é obrigatória")

        # Usar Firecrawl API diretamente
        import requests
        scrape_url = "https://api.firecrawl.dev/v1/scrape"

        payload = {
            "url": request.url.strip(),
            "formats": request.formats or ["markdown"]
        }

        headers = {
            "Authorization": "Bearer fc-c4ff34f7d0644bab97f5d82a65148880",
            "Content-Type": "application/json"
        }

        response = requests.post(scrape_url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()

        if not data.get("success"):
            raise HTTPException(status_code=500, detail="Falha no scraping via Firecrawl")

        # Extrair dados da resposta
        scrape_data = data.get("data", {})
        response_obj = ScrapeResponse(url=request.url)

        # Markdown
        if 'markdown' in request.formats or not request.formats:
            response_obj.markdown = scrape_data.get("markdown")

        # HTML
        if 'html' in request.formats:
            # Firecrawl não retorna HTML por padrão, tentar obter do markdown
            html_content = scrape_data.get("html")
            if not html_content and response_obj.markdown:
                # Converter markdown para HTML simples
                html_content = f"<div class='content'>{response_obj.markdown.replace(chr(10), '<br>')}</div>"
            response_obj.html = html_content

        # Links
        if 'links' in request.formats:
            import re
            markdown = scrape_data.get("markdown", "")
            links = re.findall(r'https?://[^\s\)\]\n]+', markdown)
            response_obj.links = list(set(links))  # Remover duplicatas

        logger.info(f"✅ Scraping concluído: {request.url}")
        return response_obj

    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Erro na requisição para Firecrawl: {e}")
        raise HTTPException(status_code=500, detail=f"Erro de comunicação: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao fazer scraping da URL {request.url}: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao fazer scraping: {str(e)}")

# Web Search
@app.post("/search", response_model=SearchResponse)
async def search_web(request: SearchRequest):
    """
    Fazer busca na web usando Firecrawl

    - query: Termo de busca
    - numResults: Número de resultados (1-50)
    """
    try:
        logger.info(f"🔍 Buscando: {request.query} (results: {request.numResults})")

        if not request.query or not request.query.strip():
            raise HTTPException(status_code=400, detail="Query é obrigatória")

        results = search_scraper.search(request.query.strip(), request.numResults)

        return SearchResponse(results=results)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro na busca: {e}")
        raise HTTPException(status_code=500, detail=f"Erro na busca: {str(e)}")

# AI Agent (OpenAI - Recomendado)
@app.post("/agent", response_model=AgentResponse)
async def run_agent_openai(request: AgentRequest):
    """
    Executar agente AI usando OpenAI API (recomendado)

    - prompt: Instruções para o agente
    """
    try:
        logger.info(f"🤖 Executando agente OpenAI (modelo: {openai_agent_scraper.model})")

        if not request.prompt or not request.prompt.strip():
            raise HTTPException(status_code=400, detail="Prompt é obrigatório")

        result = openai_agent_scraper.run_agent(request.prompt.strip())

        return AgentResponse(result=result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao executar agente OpenAI: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao executar agente: {str(e)}")

# AI Agent (Z.ai - Legado, mantido por compatibilidade)
@app.post("/agent-zai", response_model=AgentResponse)
async def run_agent_zai(request: AgentRequest):
    """
    Executar agente AI usando Z.ai (legado)

    - prompt: Instruções para o agente
    """
    try:
        logger.info(f"🤖 Executando agente Z.ai: {request.prompt[:100]}...")

        if not request.prompt or not request.prompt.strip():
            raise HTTPException(status_code=400, detail="Prompt é obrigatório")

        result = agent_scraper.run_agent(request.prompt.strip())

        return AgentResponse(result=result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao executar agente: Z.ai: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao executar agente: {str(e)}")

# AI Agent (Anthropic - Mantido por compatibilidade)
@app.post("/agent-anthropic", response_model=AgentResponse)
async def run_agent_anthropic(request: AgentRequest):
    """
    Executar agente AI usando Anthropic API (mantido por compatibilidade)

    - prompt: Instruções para o agente
    """
    try:
        logger.info(f"🤖 Executando agente Anthropic (modelo: {anthropic_agent_scraper.model})")

        if not request.prompt or not request.prompt.strip():
            raise HTTPException(status_code=400, detail="Prompt é obrigatório")

        result = anthropic_agent_scraper.run_agent(request.prompt.strip())

        return AgentResponse(result=result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao executor agente Anthropic: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao executar agente: {str(e)}")

# Map Site
@app.post("/map", response_model=MapResponse)
async def map_site(request: MapRequest):
    """
    Mapear estrutura de URLs de um site usando Firecrawl

    - url: URL do site
    """
    try:
        logger.info(f"🗺️  Mapeando site: {request.url}")

        if not request.url or not request.url.strip():
            raise HTTPException(status_code=400, detail="URL é obrigatória")

        result = site_mapper.map_site(request.url.strip())

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao mapear site: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao mapear site: {str(e)}")

# Crawl Site
@app.post("/crawl", response_model=CrawlResponse)
async def crawl_site(request: CrawlRequest):
    """
    Fazer crawling de um site usando Firecrawl

    - url: URL inicial
    - maxPages: Máximo de páginas (1-100)
    """
    try:
        logger.info(f"🕷️  Crawling site: {request.url} (max pages: {request.maxPages})")

        if not request.url or not request.url.strip():
            raise HTTPException(status_code=400, detail="URL é obrigatória")

        result = web_crawler.crawl_site(request.url.strip(), request.maxPages)

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro no crawling: {e}")
        raise HTTPException(status_code=500, detail=f"Erro no crawling: {str(e)}")

# Inicialização
@app.on_event("startup")
async def startup_event():
    """Evento de inicialização da API"""
    logger.info("🚀 BriefFlow Content Scraper API iniciada")
    logger.info(f"📁 Banco de dados: {config.get_database_path()}")
    logger.info(f"🌐 API do BriefFlow: {config.get_briefflow_api_url()}")

@app.on_event("shutdown")
async def shutdown_event():
    """Evento de desligamento da API"""
    logger.info("🛑 BriefFlow Content Scraper API desligada")

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        app,
        host=config.get_api_host(),
        port=config.get_api_port(),
        reload=config.is_development()
    )