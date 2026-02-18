"""
Search Scraper usando DuckDuckGo API (gratuito)
"""

import requests
import sys
from pathlib import Path
from typing import List, Dict, Any, Optional
from html import unescape

from models.scraper import SearchResult, SearchRequest

sys.path.insert(0, str(Path(__file__).parent.parent))
from utils.config import Config
from utils.logger import setup_logger

logger = setup_logger()

class SearchScraper:
    """Scraper para buscas web usando DuckDuckGo"""

    DDG_API_URL = "https://api.duckduckgo.com/"

    def __init__(self):
        """Inicializar o Search Scraper"""
        self.config = Config()
        self.session = requests.Session()

    def search(self, query: str, num_results: int = 5) -> List[SearchResult]:
        """
        Fazer busca web usando DuckDuckGo

        Args:
            query: Termo de busca
            num_results: Número de resultados desejados

        Returns:
            Lista de resultados de busca
        """
        logger.info(f"🔍 Buscando: {query} (max {num_results} resultados)")

        try:
            # DuckDuckGo Instant Answer API
            params = {
                'q': query,
                'format': 'json',
                'no_html': 1,
                'skip_disambig': 0
            }

            response = self.session.get(
                self.DDG_API_URL,
                params=params,
                timeout=30
            )

            response.raise_for_status()
            data = response.json()

            # Parsear resultados da resposta do DuckDuckGo
            results = self._parse_ddg_response(data, num_results)

            logger.info(f"✅ Busca concluída: {len(results)} resultados encontrados")
            return results

        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Erro na requisição para DuckDuckGo: {e}")
            return []
        except Exception as e:
            logger.error(f"❌ Erro na busca: {e}")
            return []

    def _parse_ddg_response(self, data: Dict[str, Any], num_results: int) -> List[SearchResult]:
        """
        Parsear resposta da API do DuckDuckGo

        Args:
            data: Dados da resposta JSON
            num_results: Número máximo de resultados

        Returns:
            Lista de SearchResult
        """
        results = []

        # DuckDuckGo retorna 'RelatedTopics' com resultados
        if 'RelatedTopics' in data:
            for item in data['RelatedTopics'][:num_results]:
                try:
                    # RelatedTopics podem ser Topics ou Results
                    if 'FirstURL' in item and 'Text' in item:
                        result = SearchResult(
                            title=self._clean_text(item.get('Text', 'Sem título')),
                            url=item.get('FirstURL', ''),
                            description=item.get('Result', '') or item.get('Text', '')[:200]
                        )
                        results.append(result)
                except Exception as e:
                    logger.warning(f"⚠️  Erro ao parsear resultado: {e}")
                    continue

        return results

    def _clean_text(self, text: str) -> str:
        """
        Limpar texto de HTML entities e espaços extras

        Args:
            text: Texto a limpar

        Returns:
            Texto limpo
        """
        if not text:
            return 'Sem título'

        # Remover HTML entities
        text = unescape(text)

        # Limpar espaços extras
        text = ' '.join(text.split())

        return text

    def test_search(self, query: str) -> Dict[str, Any]:
        """
        Testar funcionalidade de busca

        Args:
            query: Termo de teste

        Returns:
            Resultado do teste
        """
        logger.info(f"🧪 Testando busca com: {query}")

        try:
            results = self.search(query, num_results=1)

            return {
                'success': True if results else False,
                'message': f"{'Sucesso' if results else 'Nenhum resultado encontrado'}: {len(results)} resultados",
                'sample_results': [r.dict() for r in results[:1]] if results else None
            }
        except Exception as e:
            return {
                'success': False,
                'message': f"Erro no teste: {str(e)}",
                'sample_results': None
            }


if __name__ == "__main__":
    scraper = SearchScraper()
    results = scraper.search("python web scraping", num_results=5)
    for i, result in enumerate(results, 1):
        print(f"\n{i}. {result.title}")
        print(f"   URL: {result.url}")
        print(f"   {result.description}")