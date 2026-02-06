"""
Gerenciador principal de scrapers
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
import asyncio
from concurrent.futures import ThreadPoolExecutor, as_completed

import sys
from pathlib import Path

# Adicionar o diretório pai ao path para importações relativas
parent_dir = Path(__file__).parent.parent
sys.path.insert(0, str(parent_dir))

from models.scraper import Source, ScrapedContent, SourceType, ScrapingTask, ContentStatus
from models.database import Database
from .rss_scraper import RSScraper
from .web_scraper import WebScraper
from utils.config import Config
from utils.logger import setup_logger

logger = setup_logger()

class ScraperManager:
    """Gerenciador principal de scraping"""
    
    def __init__(self):
        """Inicializar o gerenciador"""
        self.config = Config()
        self.db = Database()
        
        # Inicializar scrapers
        self.rss_scraper = RSScraper()
        self.web_scraper = WebScraper()
        
        # Armazenamento de tarefas em execução
        self.running_tasks: Dict[str, ScrapingTask] = {}
        
        logger.info("🤖 Gerenciador de scrapers inicializado")
    
    def start_scraping_task(self, source_ids: Optional[List[str]] = None, 
                          client_ids: Optional[List[str]] = None,
                          force_rescrape: bool = False) -> str:
        """
        Iniciar uma tarefa de scraping
        
        Args:
            source_ids: IDs das fontes para scraping (opcional)
            client_ids: IDs dos clientes para scraping (opcional)
            force_rescrape: Forçar novo scraping mesmo se recente
            
        Returns:
            ID da tarefa criada
        """
        task_id = str(uuid.uuid4())
        
        # Criar tarefa
        task = ScrapingTask(
            id=task_id,
            source_id=source_ids[0] if source_ids and len(source_ids) == 1 else "multiple",
            status=ContentStatus.PENDING
        )
        
        self.running_tasks[task_id] = task
        
        # Iniciar scraping em background
        asyncio.create_task(self._execute_scraping_task(task_id, source_ids, client_ids, force_rescrape))
        
        logger.info(f"🚀 Tarefa de scraping iniciada: {task_id}")
        return task_id
    
    async def _execute_scraping_task(self, task_id: str, 
                                   source_ids: Optional[List[str]],
                                   client_ids: Optional[List[str]],
                                   force_rescrape: bool):
        """
        Executar tarefa de scraping em background
        
        Args:
            task_id: ID da tarefa
            source_ids: IDs das fontes
            client_ids: IDs dos clientes
            force_rescrape: Forçar scraping
        """
        task = self.running_tasks[task_id]
        
        try:
            # Atualizar status
            task.status = ContentStatus.PROCESSING
            task.started_at = datetime.now()
            
            # Obter fontes para scraping
            sources = self._get_sources_for_scraping(source_ids, client_ids)
            
            if not sources:
                task.status = ContentStatus.ERROR
                task.error_message = "Nenhuma fonte encontrada para scraping"
                return
            
            logger.info(f"📋 Processando {len(sources)} fontes para a tarefa {task_id}")
            
            # Processar cada fonte
            total_contents = 0
            for source in sources:
                try:
                    # Verificar se precisa fazer scraping
                    if not force_rescrape and self._should_skip_scraping(source):
                        logger.info(f"⏭️  Pulando fonte recente: {source.name}")
                        continue
                    
                    # Fazer scraping da fonte
                    contents = await self._scrape_source(source)
                    
                    # Salvar conteúdos no banco
                    saved_count = 0
                    for content in contents:
                        content_id = self.db.save_content(content, source.id, source.client_id)
                        if content_id:
                            saved_count += 1
                    
                    logger.info(f"✅ Fonte processada: {source.name} - {saved_count} conteúdos salvos")
                    total_contents += saved_count
                    
                    # Atualizar data do último scraping
                    self.db.update_source_last_scraped(source.id)
                    
                    # Respeitar delay entre fontes
                    import time
                    time.sleep(self.config.get_request_delay())
                    
                except Exception as e:
                    logger.error(f"❌ Erro ao processar fonte {source.name}: {e}")
                    continue
            
            # Atualizar tarefa
            task.status = ContentStatus.COMPLETED
            task.completed_at = datetime.now()
            task.items_scraped = total_contents
            
            logger.info(f"🎉 Tarefa {task_id} concluída: {total_contents} conteúdos coletados")
            
        except Exception as e:
            logger.error(f"❌ Erro na tarefa {task_id}: {e}")
            task.status = ContentStatus.ERROR
            task.error_message = str(e)
            task.completed_at = datetime.now()
    
    def _get_sources_for_scraping(self, source_ids: Optional[List[str]], 
                                 client_ids: Optional[List[str]]) -> List[Source]:
        """
        Obter fontes para scraping baseado nos filtros
        
        Args:
            source_ids: IDs das fontes específicas
            client_ids: IDs dos clientes específicos
            
        Returns:
            Lista de fontes para scraping
        """
        if source_ids:
            # Obter fontes específicas
            sources = []
            for source_id in source_ids:
                # Implementar busca por ID específico
                all_sources = self.db.get_all_active_sources()
                for source in all_sources:
                    if source.id == source_id:
                        sources.append(source)
                        break
            return sources
        
        elif client_ids:
            # Obter fontes por clientes
            sources = []
            for client_id in client_ids:
                client_sources = self.db.get_sources_by_client(client_id)
                sources.extend(client_sources)
            return sources
        
        else:
            # Obter todas as fontes ativas
            return self.db.get_all_active_sources()
    
    def _should_skip_scraping(self, source: Source) -> bool:
        """
        Verificar se o scraping da fonte deve ser pulado
        
        Args:
            source: Fonte a verificar
            
        Returns:
            True se deve pular
        """
        if not source.last_scraped_at:
            return False
        
        # Calcular tempo desde último scraping
        now = datetime.now()
        time_since_last = now - source.last_scraped_at
        
        # RSS feeds podem ser verificados com mais frequência
        if source.type == SourceType.RSS:
            threshold_hours = 1
        else:
            threshold_hours = 24  # Uma vez por dia para outros tipos
        
        return time_since_last.total_seconds() < (threshold_hours * 3600)
    
    async def _scrape_source(self, source: Source) -> List[ScrapedContent]:
        """
        Fazer scraping de uma fonte específica
        
        Args:
            source: Fonte para scraping
            
        Returns:
            Lista de conteúdos coletados
        """
        logger.info(f"🔍 Fazendo scraping da fonte: {source.name} ({source.type})")
        
        try:
            if source.type == SourceType.RSS:
                # Usar executor para rodar em thread separada
                with ThreadPoolExecutor() as executor:
                    future = executor.submit(self.rss_scraper.scrape, source.url)
                    contents = await asyncio.wrap_future(future)
                return contents
            
            elif source.type in [SourceType.BLOG, SourceType.NEWS]:
                with ThreadPoolExecutor() as executor:
                    future = executor.submit(self.web_scraper.scrape, source.url)
                    contents = await asyncio.wrap_future(future)
                return contents
            
            elif source.type == SourceType.YOUTUBE:
                # Implementar scraper do YouTube
                logger.warning("⚠️  Scraper do YouTube não implementado ainda")
                return []
            
            else:
                logger.warning(f"⚠️  Tipo de fonte não suportado: {source.type}")
                return []
                
        except Exception as e:
            logger.error(f"❌ Erro ao fazer scraping da fonte {source.name}: {e}")
            return []
    
    def get_task_status(self, task_id: str) -> Optional[ScrapingTask]:
        """
        Obter status de uma tarefa
        
        Args:
            task_id: ID da tarefa
            
        Returns:
            Status da tarefa ou None se não encontrada
        """
        return self.running_tasks.get(task_id)
    
    def get_all_tasks(self) -> List[ScrapingTask]:
        """Obter todas as tarefas"""
        return list(self.running_tasks.values())
    
    def scrape_single_url(self, url: str) -> Optional[ScrapedContent]:
        """
        Fazer scraping de uma URL específica
        
        Args:
            url: URL para scraping
            
        Returns:
            Conteúdo coletado ou None
        """
        logger.info(f"🎯 Fazendo scraping de URL específica: {url}")
        
        try:
            # Tentar identificar o tipo de conteúdo
            if self._is_rss_feed(url):
                # Fazer scraping do feed RSS
                contents = self.rss_scraper.scrape(url, max_items=1)
                return contents[0] if contents else None
            
            else:
                # Fazer scraping de página web
                with ThreadPoolExecutor() as executor:
                    future = executor.submit(self.web_scraper.scrape_single_article, url)
                    content = asyncio.run(asyncio.wrap_future(future))
                return content
                
        except Exception as e:
            logger.error(f"❌ Erro ao fazer scraping da URL {url}: {e}")
            return None
    
    def _is_rss_feed(self, url: str) -> bool:
        """
        Verificar se URL é de um feed RSS
        
        Args:
            url: URL para verificar
            
        Returns:
            True se parecer RSS
        """
        rss_indicators = ['/rss', '/feed', '/atom.xml', '.rss', '.xml']
        return any(indicator in url.lower() for indicator in rss_indicators)
    
    def test_source(self, source_url: str, source_type: SourceType) -> Dict[str, Any]:
        """
        Testar uma fonte antes de adicioná-la
        
        Args:
            source_url: URL da fonte
            source_type: Tipo da fonte
            
        Returns:
            Resultado do teste
        """
        logger.info(f"🧪 Testando fonte: {source_url} ({source_type})")
        
        result = {
            'success': False,
            'message': '',
            'sample_content': None,
            'feed_info': None
        }
        
        try:
            if source_type == SourceType.RSS:
                # Testar feed RSS
                feed_info = self.rss_scraper.get_feed_info(source_url)
                if feed_info:
                    result['success'] = True
                    result['message'] = f"Feed válido: {feed_info['entries_count']} entradas"
                    result['feed_info'] = feed_info
                    
                    # Obter amostra de conteúdo
                    contents = self.rss_scraper.scrape(source_url, max_items=1)
                    if contents:
                        result['sample_content'] = contents[0].dict()
                else:
                    result['message'] = "Feed inválido ou inacessível"
            
            elif source_type in [SourceType.BLOG, SourceType.NEWS]:
                # Testar scraping de site
                content = self.web_scraper.scrape_single_article(source_url)
                if content:
                    result['success'] = True
                    result['message'] = "Site acessível e conteúdo extraível"
                    result['sample_content'] = content.dict()
                else:
                    result['message'] = "Não foi possível extrair conteúdo do site"
            
            else:
                result['message'] = f"Tipo de fonte não suportado para teste: {source_type}"
                
        except Exception as e:
            result['message'] = f"Erro ao testar fonte: {str(e)}"
        
        return result