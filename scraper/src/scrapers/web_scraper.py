"""
Scraper para sites web genéricos (blogs, notícias, etc.)
"""

import requests
from bs4 import BeautifulSoup
from datetime import datetime
from typing import List, Optional, Dict, Any
from urllib.parse import urljoin, urlparse
import time
import re

import sys
from pathlib import Path

# Adicionar o diretório pai ao path para importações relativas
parent_dir = Path(__file__).parent.parent
sys.path.insert(0, str(parent_dir))

from models.scraper import ScrapedContent, SourceType
from utils.config import Config
from utils.logger import setup_logger

logger = setup_logger()

class WebScraper:
    """Classe para scraping de sites web genéricos"""
    
    def __init__(self):
        """Inicializar o scraper web"""
        self.config = Config()
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': self.config.get_user_agent()
        })
        
        # Configurações por padrão de site
        self.site_configs = {
            # Configurações genéricas
            'default': {
                'title_selectors': ['h1', '.entry-title', '.post-title', 'title'],
                'content_selectors': [
                    '.entry-content', '.post-content', '.content', 
                    'article', '.post-body', '.post-content',
                    'main', '.main-content'
                ],
                'author_selectors': [
                    '.author', '.by-author', '.post-author',
                    '.entry-author', 'meta[name="author"]'
                ],
                'date_selectors': [
                    '.entry-date', '.post-date', '.published',
                    'meta[property="article:published_time"]',
                    'meta[name="date"]', 'time[datetime]'
                ],
                'exclude_selectors': [
                    'script', 'style', 'nav', 'header', 'footer',
                    '.sidebar', '.comments', '.advertisement',
                    '.ads', '.social-share'
                ]
            },
            # Configurações específicas para sites populares
            'medium.com': {
                'title_selectors': ['h1[data-testid="storyTitle"]', 'h1'],
                'content_selectors': ['article[data-testid="storyContent"]', 'article'],
                'author_selectors': ['a[data-testid="authorName"]', '.author'],
                'date_selectors': ['time[datetime]', 'meta[property="article:published_time"]']
            },
            'wordpress': {
                'title_selectors': ['h1.entry-title', 'h1'],
                'content_selectors': ['.entry-content', '.post-content'],
                'author_selectors': ['.author.vcard', '.post-author', 'meta[name="author"]'],
                'date_selectors': ['.entry-date', '.post-date', 'time.entry-date']
            }
        }
    
    def scrape(self, source_url: str, max_articles: int = 20) -> List[ScrapedContent]:
        """
        Fazer scraping de um site web
        
        Args:
            source_url: URL do site
            max_articles: Número máximo de artigos a coletar
            
        Returns:
            Lista de conteúdos coletados
        """
        logger.info(f"🌐 Iniciando scraping do site: {source_url}")
        
        try:
            # Obter página principal
            response = self.session.get(
                source_url,
                timeout=self.config.get_timeout()
            )
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Descobrir artigos na página
            article_links = self._discover_article_links(soup, source_url)
            
            if not article_links:
                logger.warning("⚠️  Nenhum artigo encontrado na página")
                return []
            
            logger.info(f"📄 Encontrados {len(article_links)} artigos")
            
            # Limitar número de artigos
            article_links = article_links[:max_articles]
            
            # Coletar conteúdo de cada artigo
            contents = []
            for i, article_url in enumerate(article_links, 1):
                logger.info(f"📖 Processando artigo {i}/{len(article_links)}: {article_url}")
                
                try:
                    content = self._scrape_article(article_url)
                    if content and self._validate_content(content):
                        contents.append(content)
                    
                    # Respeitar delay entre requisições
                    time.sleep(self.config.get_request_delay())
                    
                except Exception as e:
                    logger.error(f"❌ Erro ao processar artigo {article_url}: {e}")
                    continue
            
            logger.info(f"✅ Site processado: {len(contents)} artigos coletados")
            return contents
            
        except requests.RequestException as e:
            logger.error(f"❌ Erro de requisição: {e}")
            return []
        except Exception as e:
            logger.error(f"❌ Erro geral no scraping: {e}")
            return []
    
    def scrape_single_article(self, article_url: str) -> Optional[ScrapedContent]:
        """
        Fazer scraping de um único artigo
        
        Args:
            article_url: URL do artigo
            
        Returns:
            Conteúdo coletado ou None
        """
        logger.info(f"📖 Fazendo scraping do artigo: {article_url}")
        
        try:
            content = self._scrape_article(article_url)
            if content and self._validate_content(content):
                return content
            return None
            
        except Exception as e:
            logger.error(f"❌ Erro ao fazer scraping do artigo: {e}")
            return None
    
    def _discover_article_links(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """
        Descobrir links de artigos na página
        
        Args:
            soup: BeautifulSoup da página
            base_url: URL base para resolução de links relativos
            
        Returns:
            Lista de URLs de artigos
        """
        article_links = set()
        
        # Seletores comuns para links de artigos
        link_selectors = [
            'a[href*="/post/"]',
            'a[href*="/article/"]',
            'a[href*="/news/"]',
            'a[href*="/blog/"]',
            'a[href*="/story/"]',
            '.post-title a',
            '.entry-title a',
            '.article-title a',
            'h2 a',
            'h3 a',
            'a[href*="/p/"]',  # Medium
        ]
        
        for selector in link_selectors:
            links = soup.select(selector)
            for link in links:
                href = link.get('href')
                if href and self._is_article_url(href):
                    absolute_url = urljoin(base_url, href)
                    article_links.add(absolute_url)
        
        # Remover duplicatas e ordenar
        return list(article_links)
    
    def _is_article_url(self, url: str) -> bool:
        """
        Verificar se URL parece ser de um artigo
        
        Args:
            url: URL para verificar
            
        Returns:
            True se parecer URL de artigo
        """
        # Padrões comuns de artigos
        article_patterns = [
            r'/post/\d+',
            r'/article/',
            r'/story/',
            r'/blog/\d+',
            r'/news/\d+',
            r'/p/\d+',  # Medium
            r'/\d{4}/\d{2}/',  # Data no URL
            r'wordpress.com/\d{4}/',
        ]
        
        for pattern in article_patterns:
            if re.search(pattern, url, re.IGNORECASE):
                return True
        
        return False
    
    def _scrape_article(self, article_url: str) -> Optional[ScrapedContent]:
        """
        Fazer scraping de um artigo específico
        
        Args:
            article_url: URL do artigo
            
        Returns:
            Conteúdo parseado ou None
        """
        try:
            response = self.session.get(
                article_url,
                timeout=self.config.get_timeout()
            )
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Obter configuração específica do site
            domain = urlparse(article_url).netloc
            config = self._get_site_config(domain)
            
            # Extrair título
            title = self._extract_title(soup, config)
            
            # Extrair conteúdo
            content_text = self._extract_content(soup, config)
            
            # Extrair resumo (primeiro parágrafo ou meta description)
            summary = self._extract_summary(soup)
            
            # Extrair autor
            author = self._extract_author(soup, config)
            
            # Extrair data de publicação
            published_at = self._extract_date(soup, config)
            
            # Extrair tags
            tags = self._extract_tags(soup)
            
            # Calcular estatísticas
            word_count = len(content_text.split()) if content_text else 0
            reading_time = max(1, word_count // 200) if word_count else 0
            
            return ScrapedContent(
                title=title,
                url=article_url,
                content_text=content_text,
                summary=summary,
                author=author,
                published_at=published_at,
                tags=tags,
                source_type=SourceType.BLOG,
                word_count=word_count,
                reading_time=reading_time
            )
            
        except Exception as e:
            logger.error(f"❌ Erro ao fazer scraping do artigo: {e}")
            return None
    
    def _get_site_config(self, domain: str) -> Dict[str, Any]:
        """
        Obter configuração específica para um domínio
        
        Args:
            domain: Domínio do site
            
        Returns:
            Configuração do site
        """
        # Verificar se há configuração específica
        for site_domain, config in self.site_configs.items():
            if site_domain != 'default' and site_domain in domain:
                return config
        
        # Verificar se é WordPress
        if 'wordpress.com' in domain or self._is_wordpress_site(domain):
            return self.site_configs['wordpress']
        
        return self.site_configs['default']
    
    def _is_wordpress_site(self, domain: str) -> bool:
        """
        Verificar se o site usa WordPress (simplificado)
        
        Args:
            domain: Domínio do site
            
        Returns:
            True se parecer WordPress
        """
        # Esta é uma verificação simplificada
        # Em produção, poderíamos fazer uma requisição para verificar
        wordpress_indicators = ['wp-content', 'wp-includes', 'wp-json']
        return any(indicator in domain.lower() for indicator in wordpress_indicators)
    
    def _extract_title(self, soup: BeautifulSoup, config: Dict[str, Any]) -> str:
        """Extrair título do artigo"""
        for selector in config['title_selectors']:
            elements = soup.select(selector)
            if elements:
                title = elements[0].get_text(strip=True)
                if title and len(title) > 5:  # Título mínimo
                    return title
        
        # Fallback: tag title
        title_tag = soup.find('title')
        if title_tag:
            return title_tag.get_text(strip=True)
        
        return 'Sem título'
    
    def _extract_content(self, soup: BeautifulSoup, config: Dict[str, Any]) -> str:
        """Extrair conteúdo principal do artigo"""
        # Remover elementos indesejados
        for selector in config['exclude_selectors']:
            for element in soup.select(selector):
                element.decompose()
        
        # Tentar encontrar conteúdo principal
        for selector in config['content_selectors']:
            elements = soup.select(selector)
            if elements:
                content = elements[0].get_text(separator='\n', strip=True)
                if content and len(content) > 100:  # Conteúdo mínimo
                    return content
        
        # Fallback: extrair todo o texto do body
        body = soup.find('body')
        if body:
            return body.get_text(separator='\n', strip=True)
        
        return ''
    
    def _extract_summary(self, soup: BeautifulSoup) -> Optional[str]:
        """Extrair resumo do artigo"""
        # Tentar meta description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if meta_desc and meta_desc.get('content'):
            return meta_desc.get('content')
        
        # Tentar og:description
        og_desc = soup.find('meta', attrs={'property': 'og:description'})
        if og_desc and og_desc.get('content'):
            return og_desc.get('content')
        
        # Tentar primeiro parágrafo
        first_p = soup.find('p')
        if first_p:
            text = first_p.get_text(strip=True)
            if text and len(text) < 300:  # Resumo razoável
                return text
        
        return None
    
    def _extract_author(self, soup: BeautifulSoup, config: Dict[str, Any]) -> Optional[str]:
        """Extrair autor do artigo"""
        for selector in config['author_selectors']:
            elements = soup.select(selector)
            if elements:
                author = elements[0].get_text(strip=True)
                if author and len(author) > 2:
                    return author
        
        # Tentar meta author
        meta_author = soup.find('meta', attrs={'name': 'author'})
        if meta_author and meta_author.get('content'):
            return meta_author.get('content')
        
        return None
    
    def _extract_date(self, soup: BeautifulSoup, config: Dict[str, Any]) -> Optional[datetime]:
        """Extrair data de publicação"""
        for selector in config['date_selectors']:
            elements = soup.select(selector)
            if elements:
                element = elements[0]
                
                # Tentar diferentes formatos de data
                date_str = None
                
                # Atributo datetime
                if element.get('datetime'):
                    date_str = element.get('datetime')
                # Meta content
                elif element.get('content'):
                    date_str = element.get('content')
                # Texto do elemento
                else:
                    date_str = element.get_text(strip=True)
                
                if date_str:
                    date = self._parse_date(date_str)
                    if date:
                        return date
        
        return None
    
    def _parse_date(self, date_str: str) -> Optional[datetime]:
        """
        Parsear string de data para datetime
        
        Args:
            date_str: String de data
            
        Returns:
            Datetime ou None se inválido
        """
        # Padrões comuns de data
        date_patterns = [
            r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}',  # ISO
            r'\d{4}/\d{2}/\d{2}',
            r'\d{2}/\d{2}/\d{4}',
            r'\d{2}-\d{2}-\d{4}',
            r'\w+ \d{1,2}, \d{4}',  # Month DD, YYYY
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, date_str)
            if match:
                try:
                    from dateutil.parser import parse
                    return parse(match.group())
                except Exception:
                    continue
        
        return None
    
    def _extract_tags(self, soup: BeautifulSoup) -> List[str]:
        """Extrair tags do artigo"""
        tags = []
        
        # Tentar meta keywords
        meta_keywords = soup.find('meta', attrs={'name': 'keywords'})
        if meta_keywords and meta_keywords.get('content'):
            tags.extend([tag.strip() for tag in meta_keywords.get('content').split(',')])
        
        # Tentar article:tag
        article_tags = soup.find_all('meta', attrs={'property': 'article:tag'})
        for tag in article_tags:
            if tag.get('content'):
                tags.append(tag.get('content'))
        
        # Tentar classes de tags comuns
        tag_selectors = ['.tag', '.category', '.label', '.tags a']
        for selector in tag_selectors:
            elements = soup.select(selector)
            for element in elements:
                tag_text = element.get_text(strip=True)
                if tag_text and tag_text not in tags:
                    tags.append(tag_text)
        
        return tags[:10]  # Limitar a 10 tags
    
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
        
        # Verificar se não é apenas boilerplate
        boilerplate_phrases = [
            'page not found',
            '404 error',
            'access denied',
            'subscribe to read',
            'login to continue'
        ]
        
        content_lower = content.content_text.lower()
        if any(phrase in content_lower for phrase in boilerplate_phrases):
            logger.debug("⚠️  Conteúdo parece ser boilerplate")
            return False
        
        return True