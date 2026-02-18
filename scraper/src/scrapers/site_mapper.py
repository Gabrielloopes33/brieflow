"""
Site Mapper usando Firecrawl API
Descobre todas as URLs de um site
"""

import requests
import sys
from pathlib import Path
from typing import List, Dict, Any
from urllib.parse import urlparse

from models.scraper import MapResponse

sys.path.insert(0, str(Path(__file__).parent.parent))
from utils.config import Config
from utils.logger import setup_logger

logger = setup_logger()

class SiteMapper:
    """Mapper para descobrir URLs de um site usando Firecrawl"""

    FIRECRAWL_API_URL = "https://api.firecrawl.dev/v1/map"
    FIRECRAWL_API_KEY = "fc-c4ff34f7d0644bab97f5d82a65148880"
    MAX_URLS = 100  # Limite de URLs para evitar sobrecarga

    def __init__(self):
        """Inicializar o Site Mapper"""
        self.config = Config()
        self.api_key = self.FIRECRAWL_API_KEY
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        })

    def map_site(self, url: str, max_urls: int = None) -> MapResponse:
        """
        Mapear todas as URLs de um site

        Args:
            url: URL do site
            max_urls: Número máximo de URLs (default: 100)

        Returns:
            Resposta com lista de URLs encontradas
        """
        if max_urls is None:
            max_urls = self.MAX_URLS

        logger.info(f"🗺️  Mapeando site: {url} (max {max_urls} URLs)")

        try:
            # Normalizar URL
            normalized_url = self._normalize_url(url)

            # Tentar usar o endpoint /map do Firecrawl
            payload = {
                "url": normalized_url,
                "searchLimit": max_urls,
                "ignoreSitemap": False  # Usar sitemap se disponível
            }

            response = self.session.post(
                self.FIRECRAWL_API_URL,
                json=payload,
                timeout=30
            )

            response.raise_for_status()
            data = response.json()

            # Extrair URLs da resposta
            urls = self._extract_urls(data, normalized_url)

            # Filtrar e deduplicar URLs
            unique_urls = self._filter_urls(urls, normalized_url, max_urls)

            logger.info(f"✅ Site mapeado: {len(unique_urls)} URLs encontradas")

            return MapResponse(
                links=unique_urls,
                urls=unique_urls  # Campo alternativo para compatibilidade
            )

        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Erro na requisição para Firecrawl: {e}")
            # Fallback para método alternativo
            return self._fallback_map(url, max_urls)
        except Exception as e:
            logger.error(f"❌ Erro ao mapear site: {e}")
            return MapResponse(links=[], urls=[])

    def _normalize_url(self, url: str) -> str:
        """
        Normalizar URL

        Args:
            url: URL a normalizar

        Returns:
            URL normalizada
        """
        # Remover barra final se existir
        url = url.rstrip('/')

        # Adicionar https:// se não tiver protocolo
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url

        return url

    def _extract_urls(self, data: Dict[str, Any], base_url: str) -> List[str]:
        """
        Extrair URLs da resposta do Firecrawl

        Args:
            data: Dados da resposta
            base_url: URL base

        Returns:
            Lista de URLs
        """
        urls = []

        # Firecrawl /map retorna 'data' com 'links' ou 'links' direto
        if 'data' in data:
            if 'links' in data['data']:
                links = data['data']['links']
                if isinstance(links, list):
                    urls.extend(links)
            elif 'children' in data['data']:
                # Estrutura alternativa com children
                urls.extend(self._extract_urls_from_children(data['data']['children']))
        elif 'links' in data:
            # Links direto na raiz
            if isinstance(data['links'], list):
                urls.extend(data['links'])

        return urls

    def _extract_urls_from_children(self, children: List[Dict[str, Any]]) -> List[str]:
        """
        Extrair URLs de estrutura aninhada (children)

        Args:
            children: Lista de children com URLs

        Returns:
            Lista de URLs
        """
        urls = []

        for item in children:
            if isinstance(item, dict):
                if 'url' in item:
                    urls.append(item['url'])
                if 'children' in item:
                    urls.extend(self._extract_urls_from_children(item['children']))

        return urls

    def _filter_urls(self, urls: List[str], base_url: str, max_urls: int) -> List[str]:
        """
        Filtrar e deduplicar URLs

        Args:
            urls: Lista de URLs
            base_url: URL base do site
            max_urls: Número máximo de URLs

        Returns:
            Lista filtrada de URLs únicas
        """
        # Remover duplicatas mantendo ordem
        seen = set()
        unique_urls = []

        base_domain = urlparse(base_url).netloc

        for url in urls:
            # Normalizar URL
            normalized = url.rstrip('/')

            # Verificar se é do mesmo domínio
            url_domain = urlparse(normalized).netloc

            # Filtrar URLs inválidas ou de outros domínios
            if not normalized or normalized == base_url:
                continue

            # Apenas URLs do mesmo domínio
            if url_domain and url_domain != base_domain:
                continue

            # Ignorar URLs com parâmetros de tracking, etc.
            if any(pattern in normalized.lower() for pattern in ['#', '?', 'tel:', 'mailto:', 'javascript:']):
                continue

            # Ignorar tipos de arquivos não relevantes
            if any(ext in normalized.lower() for ext in ['.pdf', '.jpg', '.png', '.gif', '.zip', '.css', '.js']):
                continue

            if normalized not in seen:
                seen.add(normalized)
                unique_urls.append(normalized)

                # Limitar número de URLs
                if len(unique_urls) >= max_urls:
                    break

        return unique_urls[:max_urls]

    def _fallback_map(self, url: str, max_urls: int) -> MapResponse:
        """
        Método alternativo de mapeamento quando Firecrawl falha

        Args:
            url: URL do site
            max_urls: Número máximo de URLs

        Returns:
            Resposta com URLs encontradas
        """
        logger.info(f"🔄 Usando método alternativo para mapear: {url}")

        try:
            # Tentar sitemap.xml
            sitemap_url = url.rstrip('/') + '/sitemap.xml'
            response = self.session.get(sitemap_url, timeout=10)

            if response.status_code == 200:
                return self._parse_sitemap(response.text, max_urls)

            logger.warning("⚠️  Sitemap não encontrado, retornando lista vazia")
            return MapResponse(links=[], urls=[])

        except Exception as e:
            logger.error(f"❌ Erro no método alternativo: {e}")
            return MapResponse(links=[], urls=[])

    def _parse_sitemap(self, sitemap_xml: str, max_urls: int) -> MapResponse:
        """
        Parsear sitemap XML

        Args:
            sitemap_xml: Conteúdo XML do sitemap
            max_urls: Número máximo de URLs

        Returns:
            Resposta com URLs do sitemap
        """
        try:
            from xml.etree import ElementTree as ET

            root = ET.fromstring(sitemap_xml)

            # Namespace do sitemap
            namespace = {'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9'}

            urls = []

            # Tentar com namespace
            locs = root.findall('.//sm:loc', namespace) or root.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')

            # Tentar sem namespace
            if not locs:
                locs = root.findall('.//loc')

            for loc in locs:
                if loc.text:
                    urls.append(loc.text.strip())

            # Filtrar e deduplicar
            unique_urls = list(dict.fromkeys(urls))  # Remove duplicates mantendo ordem

            logger.info(f"✅ Sitemap parseado: {len(unique_urls)} URLs")
            return MapResponse(
                links=unique_urls[:max_urls],
                urls=unique_urls[:max_urls]
            )

        except Exception as e:
            logger.error(f"❌ Erro ao parsear sitemap: {e}")
            return MapResponse(links=[], urls=[])

    def test_map(self, url: str) -> Dict[str, Any]:
        """
        Testar funcionalidade de mapeamento

        Args:
            url: URL de teste

        Returns:
            Resultado do teste
        """
        logger.info(f"🧪 Testando mapeamento de: {url}")

        try:
            result = self.map_site(url, max_urls=10)

            return {
                'success': True if result.links else False,
                'message': f"{'Sucesso' if result.links else 'Nenhuma URL encontrada'}: {len(result.links)} URLs",
                'sample_urls': result.links[:5] if result.links else None
            }
        except Exception as e:
            return {
                'success': False,
                'message': f"Erro no teste: {str(e)}",
                'sample_urls': None
            }


if __name__ == "__main__":
    mapper = SiteMapper()
    result = mapper.map_site("https://example.com", max_urls=20)
    print(f"Encontradas {len(result.links)} URLs:")
    for url in result.links:
        print(f"  - {url}")