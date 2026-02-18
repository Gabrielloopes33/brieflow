"""
Agent Scraper usando Anthropic API
Modelo: Claude 3.5 Sonnet (rápido, econômico e inteligente)
"""

import sys
from pathlib import Path
from typing import Optional

from models.scraper import AgentResponse, AgentRequest

sys.path.insert(0, str(Path(__file__).parent.parent))
from utils.logger import setup_logger

logger = setup_logger()

class AnthropicAgentScraper:
    """Scraper para agente AI usando Anthropic API"""

    # Usar a API key já configurada no sistema (server/.env)
    # A API key do Anthropic já está disponível via routes.ts
    ANTHROPIC_API_KEY = "sk-ant-api03-sua-chave-aqui"  # Será substituída por env ou import de config
    
    # Endpoint OpenAI-compatible do Z.ai
    ZAI_OPENAI_COMPATIBLE_URL = "https://api.z.ai/api/paas/v4/chat/completions"
    
    # Modelos disponíveis (ordem por custo/performance)
    AVAILABLE_MODELS = {
        "claude-3-5-sonnet-20241022": "Claude 3.5 Sonnet (Recomendado - Rápido, Econômico)",
        "claude-3-haiku-20250307": "Claude 3 Haiku (Rápido, Econômico)",
        "claude-3-opus-20240229": "Claude 3 Opus (Equilibrado)",
        "claude-sonnet-4-20240514": "Claude 3 Sonnet (Equilibrado)",
    }

    # Modelo padrão (Rápido, Econômico, Inteligente)
    DEFAULT_MODEL = "claude-3-5-sonnet20241022"

    def __init__(self, model: Optional[str] = None):
        """Inicializar o Anthropic Agent Scraper"""
        self.model = model or self.DEFAULT_MODEL
        
        # Verificar se o modelo existe na lista
        if self.model not in self.AVAILABLE_MODELS:
            logger.warning(f"⚠️  Modelo '{self.model}' não disponível, usando padrão")
            self.model = self.DEFAULT_MODEL
        elif self.model != self.DEFAULT_MODEL:
            logger.info(f"ℹ️️  Usando modelo alternativo: {self.model}")

    def run_agent(self, prompt: str) -> Optional[str]:
        """
        Executar agente AI usando Anthropic API

        Args:
            prompt: Instruções para o agente

        Returns:
            Resultado gerado pelo agente
        """
        logger.info(f"🤖 Executando agente Anthropic (modelo: {self.model})")

        try:
            # Importar requests aqui para não carregar no startup
            import requests

            headers = {
                'Authorization': f'Bearer {self.ANTHROPIC_API_KEY}',
                'Content-Type': 'application/json'
            }

            payload = {
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": "Você é um assistente útil e especializado em análise de conteúdo e web scraping. Responda de forma clara e concisa em português. Seja conciso e direto."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 2000,
                "temperature": 0.7  # Um pouco de criatividade
            }

            logger.info(f"📤 Enviando requisição para modelo: {self.model}")

            response = requests.post(
                self.ZAI_OPENAI_COMPATIBLE_URL,
                json=payload,
                headers=headers,
                timeout=30
            )

            response.raise_for_status()
            data = response.json()

            # Extrair resposta
            result = self._parse_response(data)

            logger.info(f"✅ Agente Anthropic executado com sucesso ({len(result)} caracteres)")
            return result

        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Erro na requisição para Anthropic: {e}")
            error_response = self._get_error_response(e)
            return error_response
        except Exception as e:
            logger.error(f"❌ Erro ao executar agente: {e}")
            return f"Erro ao executar agente: {str(e)}"

    def _parse_response(self, data: dict) -> str:
        """
        Parsear resposta da API (formato OpenAI-compatible)

        Args:
            data: Dados da resposta JSON

        Returns:
            String de resposta
        """
        try:
            # Formato padrão de chat completions (OpenAI-compatible)
            if 'choices' in data and len(data['choices']) > 0:
                content = data['choices'][0]['message']['content']
                return content

            # Fallback para outros formatos possíveis
            elif 'data' in data and 'content' in data['data']:
                return data['data']['content']

            logger.warning("⚠️  Formato de resposta não reconhecido")
            return "Não foi possível processar a resposta da API"

        except Exception as e:
            logger.error(f"❌ Erro ao parsear resposta: {e}")
            return "Erro ao processar resposta: " + str(e)

    def _get_error_response(self, error: Exception) -> str:
        """
        Gerar mensagem de erro amigável

        Args:
            error: Exceção capturada

        Returns:
            Mensagem de erro
        """
        error_str = str(error)

        # Erros específicos da API
        if "401" in error_str or "insufficient quota" in error_str.lower():
            return "Erro: API do Anthropic sem saldo. Carregue os créditos para continuar usando."
        elif "404" in error_str or "not found" in error_str:
            return "Erro: Modelo não encontrado. Verifique se o modelo está correto."
        elif "429" in error_str or "too many requests" in error_str:
            return "Erro: Muitas requisições. Aguarde alguns instantes e tente novamente."
        else:
            return f"Erro de comunicação com Anthropic: {error_str[:150]}"

    def test_agent(self, prompt: str = "Olá mundo, responda em 1 frase") -> dict:
        """
        Testar funcionalidade do agente

        Args:
            prompt: Prompt de teste

        Returns:
            Dicionário com resultado do teste
        """
        logger.info(f"🧪 Testando agente Anthropic com prompt: {prompt}")

        try:
            result = self.run_agent(prompt)

            return {
                'success': True if result and not result.startswith("Erro") else False,
                'message': 'Sucesso' if result and not result.startswith("Erro") else 'Falha',
                'sample_result': result[:200] if result else None,
                'model': self.model
            }
        except Exception as e:
            logger.error(f"❌ Erro no teste: {e}")
            return {
                'success': False,
                'message': f"Erro no teste: {str(e)}",
                'sample_result': None,
                'model': self.model
            }


# Função para teste rápido
if __name__ == "__main__":
    scraper = AnthropicAgentScraper()
    result = scraper.run_agent("Olá mundo, responda em 1 frase")
    print(result)
