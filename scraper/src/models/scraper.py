"""
Modelos de dados para o scraper
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, HttpUrl
from enum import Enum

class SourceType(str, Enum):
    """Tipos de fontes suportadas"""
    RSS = "rss"
    BLOG = "blog"
    NEWS = "news"
    YOUTUBE = "youtube"

class ContentStatus(str, Enum):
    """Status do conteúdo"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    ERROR = "error"

class ScrapedContent(BaseModel):
    """Modelo de conteúdo coletado"""
    title: str = Field(..., description="Título do conteúdo")
    url: str = Field(..., description="URL original do conteúdo")
    content_text: Optional[str] = Field(None, description="Texto completo do conteúdo")
    summary: Optional[str] = Field(None, description="Resumo do conteúdo")
    author: Optional[str] = Field(None, description="Autor do conteúdo")
    published_at: Optional[datetime] = Field(None, description="Data de publicação")
    tags: List[str] = Field(default_factory=list, description="Tags do conteúdo")
    source_type: SourceType = Field(..., description="Tipo da fonte")
    
    # Metadados
    word_count: Optional[int] = Field(None, description="Número de palavras")
    reading_time: Optional[int] = Field(None, description="Tempo estimado de leitura em minutos")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

class Source(BaseModel):
    """Modelo de fonte de conteúdo"""
    id: str = Field(..., description="ID da fonte")
    name: str = Field(..., description="Nome da fonte")
    url: str = Field(..., description="URL da fonte")
    type: SourceType = Field(..., description="Tipo da fonte")
    client_id: str = Field(..., description="ID do cliente proprietário")
    is_active: bool = Field(True, description="Se a fonte está ativa")
    last_scraped_at: Optional[datetime] = Field(None, description="Última data de coleta")
    created_at: datetime = Field(default_factory=datetime.now, description="Data de criação")
    
    # Configurações específicas do scraper
    scraper_config: Dict[str, Any] = Field(default_factory=dict, description="Configurações específicas do scraper")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

class Client(BaseModel):
    """Modelo de cliente"""
    id: str = Field(..., description="ID do cliente")
    name: str = Field(..., description="Nome do cliente")
    description: Optional[str] = Field(None, description="Descrição do cliente")
    niche: Optional[str] = Field(None, description="Nicho de mercado")
    target_audience: Optional[str] = Field(None, description="Público-alvo")
    created_at: datetime = Field(default_factory=datetime.now, description="Data de criação")

class ScrapingTask(BaseModel):
    """Modelo de tarefa de scraping"""
    id: str = Field(..., description="ID da tarefa")
    source_id: str = Field(..., description="ID da fonte")
    status: ContentStatus = Field(ContentStatus.PENDING, description="Status da tarefa")
    started_at: Optional[datetime] = Field(None, description="Data de início")
    completed_at: Optional[datetime] = Field(None, description="Data de conclusão")
    error_message: Optional[str] = Field(None, description="Mensagem de erro")
    items_scraped: int = Field(0, description="Número de itens coletados")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

class Brief(BaseModel):
    """Modelo de pauta de conteúdo"""
    id: str = Field(..., description="ID da pauta")
    client_id: str = Field(..., description="ID do cliente")
    content_ids: List[str] = Field(default_factory=list, description="IDs dos conteúdos base")
    title: str = Field(..., description="Título da pauta")
    angle: Optional[str] = Field(None, description="Ângulo abordado")
    key_points: List[str] = Field(default_factory=list, description="Pontos principais")
    content_type: Optional[str] = Field(None, description="Tipo de conteúdo sugerido")
    suggested_copy: Optional[str] = Field(None, description="Texto sugerido")
    status: str = Field("draft", description="Status da pauta")
    created_at: datetime = Field(default_factory=datetime.now, description="Data de criação")
    generated_by: str = Field("scraper", description="Quem gerou a pauta")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

class AnalysisConfig(BaseModel):
    """Modelo de configuração de análise"""
    id: str = Field(..., description="ID da configuração")
    client_id: str = Field(..., description="ID do cliente")
    min_content_length: int = Field(500, description="Comprimento mínimo do conteúdo")
    topics_of_interest: List[str] = Field(default_factory=list, description="Tópicos de interesse")
    exclude_patterns: List[str] = Field(default_factory=list, description="Padrões a excluir")
    created_at: datetime = Field(default_factory=datetime.now, description="Data de criação")

# Request/Response Models
class ScrapingRequest(BaseModel):
    """Modelo de requisição de scraping"""
    source_ids: Optional[List[str]] = Field(None, description="IDs das fontes para scraping")
    client_ids: Optional[List[str]] = Field(None, description="IDs dos clientes para scraping")
    force_rescrape: bool = Field(False, description="Forçar novo scraping mesmo se recente")

class ScrapingResponse(BaseModel):
    """Modelo de resposta de scraping"""
    task_id: str = Field(..., description="ID da tarefa criada")
    status: str = Field(..., description="Status inicial da tarefa")
    estimated_duration: Optional[int] = Field(None, description="Duração estimada em segundos")

class TaskStatusResponse(BaseModel):
    """Modelo de resposta de status da tarefa"""
    task_id: str = Field(..., description="ID da tarefa")
    status: ContentStatus = Field(..., description="Status atual")
    progress: float = Field(0.0, description="Progresso de 0 a 1")
    items_scraped: int = Field(0, description="Número de itens coletados")
    started_at: Optional[datetime] = Field(None, description="Data de início")
    estimated_completion: Optional[datetime] = Field(None, description="Data estimada de conclusão")
    error_message: Optional[str] = Field(None, description="Mensagem de erro se houver")