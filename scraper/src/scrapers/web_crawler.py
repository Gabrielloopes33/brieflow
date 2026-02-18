"""
Web Crawler usando Firecrawl API
Faz crawling completo de um site visitando múltiplas páginas
"""

import requests
import sys
from pathlib import Path
from typing import List, Dict, Any

from models.scraper import CrawlResponse

sys.path.insert(0, str(Path(__file__).parent.parent))
from utils.config import Config
from utils.logger import setup_logger

logger = setup_logger()

class WebCrawler:
    """Crawler para sites usando Firecrawl API"""

    FIRECRAWL_API_URL = "https://api.firecrawl.dev/v1/crawl"
    FIRECRAWL_API_KEY = "fc-c4ff34f7d0644bab97f5d82a65148880"

    def __init__(self):
        """Inicializar o Web Crawler"""
        self.config = Config()
        self.api_key = self.FIRECRAWL_API_KEY
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        })

    def crawl_site(self, url: str, max_pages: int = 10) -> CrawlResponse:
        """
        Fazer crawling de um site visitando múltiplas páginas

        Args:
            url: URL inicial do site
            max_pages: Número máximo de páginas

        Returns:
            Resposta com URLs visitadas
        """
        logger.info(f"🕷️  Crawling site: {url} (max {max_pages} páginas)")

        try:
            # Normalizar URL
            normalized_url = self._normalize_url(url)

            # Iniciar crawl assíncrono com o Firecrawl
            payload = {
                "url": normalized_url,
                "limit": max_pages,
                "scrapeOptions": {
                    "formats": ["markdown"]
                },
                "crawlerOptions": {
                    "limit": max_pages,
                    "maxDepth": 2  # Profundidade máxima
                },
                "pollInterval": 2  # Intervalo de polling em segundos
            }

            # Iniciar o crawl (endpoint POST retorna um job ID)
            response = self.session.post(
                self.FIRECRAWL_API_URL,
                json=payload,
                timeout=30
            )

            response.raise_for_status()
            initial_data = response.json()

            # Se a resposta for imediata (modo síncrono ou site pequeno)
            if 'data' in initial_data and initial_data.get('status') == 'completed':
                urls = self._extract_crawl_urls(initial_data, normalized_url)
                logger.info(f"✅ Crawling concluído: {len(urls)} páginas")
                return CrawlResponse(
                    pages=urls,
                    urls=urls
                )

            # Se precisar fazer polling do job (modo assíncrono)
            if 'id' in initial_data:
                job_id = initial_data['id']
                urls = self._poll_crawl_job(job_id, max_pages, normalized_url)

                logger.info(f"✅ Crawling concluído: {len(urls)} páginas")
                return CrawlResponse(
                    pages=urls,
                    urls=urls
                )

            logger.warning("⚠️  Resposta não reconhecida do Firecrawl")
            return CrawlResponse(pages=[], urls=[])

        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Erro na requisição para Firecrawl: {e}")
            # Fallback para método simples
            return self._fallback_crawl(url, max_pages)
        except Exception as e:
            logger.error(f"❌ Erro no crawling: {e}")
            return CrawlResponse(pages=[], urls=[])

    def _normalize_url(self, url: str) -> str:
        """
        Normalizar URL

        Args:
            url: URL a normalizar

        Returns:
            URL normalizada
        """
        url = url.rstrip('/')
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        return url

    def _extract_crawl_urls(self, data: Dict[str, Any], base_url: str) -> List[str]:
        """
        Extrair URLs da resposta do crawl

        Args:
            data: Dados da resposta
            base_url: URL base

        Returns:
            Lista de URLs
        """
        urls = []

        # Firecrawl retorna os dados em 'data'
        if 'data' in data:
            crawl_data = data['data']

            # Tentar diferentes estruturas de resposta
            if 'children' in crawl_data:
                urls.extend(self._extract_urls_from_tree(crawl_data['children']))
            elif 'links' in crawl_data:
                if isinstance(crawl_data['links'], list):
                    urls.extend(crawl_data['links'])
            elif isinstance(crawl_data, list):
                # Lista de páginas crawleadas
                for item in crawl_data:
                    if isinstance(item, dict) and 'url' in item:
                        urls.append(item['url'])

        # Filtrar apenas URLs válidas
        valid_urls = [url for url in urls if url and url.startswith('http')]

        return valid_urls

    def _extract_urls_from_tree(self, items: List[Dict[str, Any]]) -> List[str]:
        """
        Extrair URLs de estrutura em árvore (children)

        Args:
            items: Lista de itens com children

        Returns:
            Lista de URLs
        """
        urls = []

        for item in items:
            if isinstance(item, dict):
                if 'url' in item and item['url']:
                    urls.append(item['url'])
                if 'children' in item:
                    urls.extend(self._extract_urls_from_tree(item['children']))

        return urls

    def _poll_crawl_job(self, job_id: str, max_pages: int, base_url: str) -> List[str]:
        """
        Fazer polling do job de crawling

        Args:
            job_id: ID do job
            max_pages: Máximo de páginas
            base_url: URL base

        Returns:
            Lista de URLs crawleadas
        """
        poll_url = f"{self.FIRECRAWL_API_URL}/{job_id}"

        max_polls = 30  # Máximo de tentativas de polling (60 segundos)
        poll_interval = 2  # Segundos entre polls

        logger.info(f"⏳ Polling job {job_id}...")

        for attempt in range(max_polls):
            try:
                response = self.session.get(poll_url, timeout=10)
                response.raise_for_status()
                data = response.json()

                status = data.get('status')

                if status == 'completed':
                    logger.info(f"✅ Job completado!")
                    return self._extract_crawl_urls(data, base_url)
                elif status == 'failed':
                    logger.error(f"❌ Job falhou: {data.get('error', 'Erro desconhecido')}")
                    return []
                elif status in ['processing', 'pending']:
                    logger.debug(f"⏳ Job em progresso... ({attempt + 1}/{max_polls})")
                    import time
                    time.sleep(poll_interval)
                    continue
                else:
                    logger.warning(f"⚠️  Status desconhecido: {status}")
                    break

            except requests.exceptions.RequestException as e:
                logger.error(f"❌ Erro no polling: {e}")
                break

        logger.warning("⚠️  Timeout do job")
        return []

    def _fallback_crawl(self, url: str, max_pages: int) -> CrawlResponse:
        """
        Método alternativo de crawling quando Firecrawl falha

        Args:
            url: URL do site
            max_pages: Máximo de páginas

        Returns:
            Resposta com URLs crawleadas
        """
        logger.info(f"🔄 Usando método alternativo para crawling: {url}")

        try:
            # Fazer scrape simples da página inicial
            # Usar endpoint /scrape do Firecrawl
            scrape_url = "https://api.firecrawl.dev/v1/scrape"

            payload = {
                "url": url,
                "formats": ["markdown"]
            }

            response = self.session.post(scrape_url, json=payload, timeout=30)
            response.raise_for_status()
            data = response.json()

            # Extrair links do conteúdo markdown
            if 'data' in data and 'markdown' in data['data']:
                content = data['data']['markdown']
                links = self._extract_links_from_markdown(content, url)
                return CrawlResponse(
                    pages=links[:max_pages],
                    urls=links[:max_pages]
                )

            return CrawlResponse(pages=[], urls=[])

        except Exception as e:
            logger.error(f"❌ Erro no método alternativo: {e}")
            return CrawlResponse(pages=[], urls=[])

    def _extract_links_from_markdown(self, markdown: str, base_url: str) -> List[str]:
        """
        Extrair URLs de conteúdo markdown

        Args:
            markdown: Conteúdo markdown
            base_url: URL base

        Returns:
            Lista de URLs encontradas
        """
        import re

        # Regex para encontrar URLs markdown: [texto](url)
        link_pattern = r'\[([^\]]+)\]\(([^)]+)\)'

        links = re.findall(link_pattern, markdown)

        urls = []

        # Extrair apenas as URLs (segundo elemento da tupla)
        for link in links:
            url = link[1].strip()
            if url.startswith('http'):
                urls.append(url)
            elif url.startswith('/'):
                # URL relativa
                if base_url.endswith('/'):
                    urls.append(base_url + url[1:])
                else:
                    urls.append(base_url + url)

        # Remover duplicatas mantendo ordem
        unique_urls = list(dict.fromkeys(urls))

        return unique_urls

    def test_crawl(self, url: str, max_pages: int = 3) -> Dict[str, Any]:
        """
        Testar funcionalidade de crawling

        Args:
            url: URL de teste
            max_pages: Máximo de páginas

        Returns:
            Resultado do teste
        """
        logger.info(f"🧪 Testando crawling de: {url}")

        try:
            result = self.crawl_site(url, max_pages=max_pages)

            return {
                'success': True if result.pages else False,
                'message': f"{'Sucesso' if result.pages else 'Nenhuma página crawleada'}: {len(result.pages)} páginas",
                'sample_urls': result.pages[:5] if result.pages else None
            }
        except Exception as e:
            return {
                'success': False,
                'message': f"Erro no teste: {str(e)}",
                'sample_urls': None
            }


if __name__ == "__main__":
    crawler = WebCrawler()
    result = crawler.crawl_site("https://example.com", max_pages=10)
    print(f"Crawling concluído: {len(result.pages)} páginas")
    for url in result.pages:
        print(f"  - {url}")