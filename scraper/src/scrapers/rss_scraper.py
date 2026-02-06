"""
Scraper para RSS/Atom feeds
"""

import feedparser
import requests
from datetime import datetime
from typing import List, Optional
from urllib.parse import urlparse

import sys
from pathlib import Path

# Adicionar o diretório pai ao path para importações relativas
parent_dir = Path(__file__).parent.parent
sys.path.insert(0, str(parent_dir))

from models.scraper import ScrapedContent, SourceType
from utils.config import Config
from utils.logger import setup_logger

logger = setup_logger()

class RSScraper:
    """Classe para scraping de RSS/Atom feeds"""
    
    def __init__(self):
        """Inicializar o scraper RSS"""
        self.config = Config()
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': self.config.get_user_agent()
        })
    
    def scrape(self, source_url: str, max_items: int = 50) -> List[ScrapedContent]:
        """
        Fazer scraping de um feed RSS/Atom
        
        Args:
            source_url: URL do feed
            max_items: Número máximo de itens a coletar
            
        Returns:
            Lista de conteúdos coletados
        """
        logger.info(f"📡 Iniciando scraping do feed: {source_url}")
        
        try:
            # Fazer download do feed
            response = self.session.get(
                source_url,
                timeout=self.config.get_timeout()
            )
            response.raise_for_status()
            
            # Parsear o feed
            feed = feedparser.parse(response.content)
            
            if feed.bozo:
                logger.warning(f"⚠️  Feed malformado: {feed.bozo_exception}")
            
            contents = []
            
            for entry in feed.entries[:max_items]:
                try:
                    content = self._parse_entry(entry)
                    if content and self._validate_content(content):
                        contents.append(content)
                except Exception as e:
                    logger.error(f"❌ Erro ao processar entrada: {e}")
                    continue
            
            logger.info(f"✅ Feed processado: {len(contents)} itens coletados")
            return contents
            
        except requests.RequestException as e:
            logger.error(f"❌ Erro de requisição: {e}")
            return []
        except Exception as e:
            logger.error(f"❌ Erro geral no scraping: {e}")
            return []
    
    def _parse_entry(self, entry) -> Optional[ScrapedContent]:
        """
        Parsear uma entrada do feed
        
        Args:
            entry: Entrada do feed
            
        Returns:
            Conteúdo parseado ou None se inválido
        """
        # Extrair URL
        url = self._extract_url(entry)
        if not url:
            logger.warning("⚠️  Entrada sem URL válida")
            return None
        
        # Extrair título
        title = getattr(entry, 'title', None) or getattr(entry, 'link', 'Sem título')
        
        # Extrair conteúdo
        content_text = self._extract_content(entry)
        
        # Extrair resumo
        summary = getattr(entry, 'summary', None)
        if summary:
            # Limpar HTML do resumo
            from bs4 import BeautifulSoup
            summary = BeautifulSoup(summary, 'html.parser').get_text(strip=True)
        
        # Extrair autor
        author = None
        if hasattr(entry, 'author') and entry.author:
            author = entry.author
        elif hasattr(entry, 'authors') and entry.authors:
            author = ', '.join([a.get('name', '') for a in entry.authors if a.get('name')])
        
        # Extrair data de publicação
        published_at = None
        for date_field in ['published_parsed', 'updated_parsed']:
            if hasattr(entry, date_field) and getattr(entry, date_field):
                time_struct = getattr(entry, date_field)
                if time_struct:
                    try:
                        published_at = datetime(*time_struct[:6])
                        break
                    except (ValueError, TypeError):
                        continue
        
        # Extrair tags
        tags = []
        if hasattr(entry, 'tags') and entry.tags:
            tags = [tag.term for tag in entry.tags if hasattr(tag, 'term')]
        
        # Calcular estatísticas
        word_count = len(content_text.split()) if content_text else 0
        reading_time = max(1, word_count // 200) if word_count else 0  # 200 palavras por minuto
        
        return ScrapedContent(
            title=title,
            url=url,
            content_text=content_text,
            summary=summary,
            author=author,
            published_at=published_at,
            tags=tags,
            source_type=SourceType.RSS,
            word_count=word_count,
            reading_time=reading_time
        )
    
    def _extract_url(self, entry) -> Optional[str]:
        """Extrair URL da entrada"""
        # Tentar diferentes campos que podem conter a URL
        for url_field in ['link', 'id']:
            if hasattr(entry, url_field):
                url = getattr(entry, url_field)
                if url and self._is_valid_url(url):
                    return url
        
        # Tentar encontrar URL nos links
        if hasattr(entry, 'links'):
            for link in entry.links:
                if hasattr(link, 'href') and self._is_valid_url(link.href):
                    return link.href
        
        return None
    
    def _extract_content(self, entry) -> Optional[str]:
        """Extrair conteúdo textual da entrada"""
        # Tentar diferentes campos de conteúdo
        content_fields = ['content', 'description', 'summary']
        
        for field in content_fields:
            if hasattr(entry, field):
                content = getattr(entry, field)
                if content:
                    # Se for uma lista, pegar o primeiro item
                    if isinstance(content, list) and content:
                        content = content[0]
                    
                    # Se tiver atributo 'value', usar ele
                    if hasattr(content, 'value'):
                        content = content.value
                    
                    # Se for string, limpar HTML
                    if isinstance(content, str):
                        from bs4 import BeautifulSoup
                        return BeautifulSoup(content, 'html.parser').get_text(strip=True)
        
        return None
    
    def _is_valid_url(self, url: str) -> bool:
        """Verificar se URL é válida"""
        try:
            result = urlparse(url)
            return all([result.scheme, result.netloc])
        except Exception:
            return False
    
    def _validate_content(self, content: ScrapedContent) -> bool:
        """Validar se o conteúdo atende aos critérios mínimos"""
        # Verificar comprimento mínimo
        if not content.content_text:
            return False
        
        content_length = len(content.content_text.strip())
        if content_length < self.config.get_content_min_length():
            logger.debug(f"⚠️  Conteúdo muito curto: {content_length} caracteres")
            return False
        
        if content_length > self.config.get_content_max_length():
            logger.debug(f"⚠️  Conteúdo muito longo: {content_length} caracteres")
            return False
        
        return True
    
    def get_feed_info(self, feed_url: str) -> Optional[dict]:
        """
        Obter informações sobre o feed
        
        Args:
            feed_url: URL do feed
            
        Returns:
            Dicionário com informações do feed ou None
        """
        try:
            response = self.session.get(feed_url, timeout=self.config.get_timeout())
            response.raise_for_status()
            
            feed = feedparser.parse(response.content)
            
            if feed.bozo:
                return None
            
            return {
                'title': getattr(feed.feed, 'title', 'Sem título'),
                'description': getattr(feed.feed, 'description', ''),
                'language': getattr(feed.feed, 'language', ''),
                'updated': getattr(feed.feed, 'updated', None),
                'entries_count': len(feed.entries),
                'last_entry': feed.entries[0].published if feed.entries else None
            }
            
        except Exception as e:
            logger.error(f"❌ Erro ao obter informações do feed: {e}")
            return None