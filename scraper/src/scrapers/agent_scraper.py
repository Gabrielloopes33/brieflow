"""
Agent Scraper usando Z.ai API
"""

import requests
import sys
from pathlib import Path
from typing import Optional, Dict, Any

from models.scraper import AgentResponse, AgentRequest

sys.path.insert(0, str(Path(__file__).parent.parent))
from utils.config import Config
from utils.logger import setup_logger

logger = setup_logger()

class AgentScraper:
    """Scraper para agente AI usando Z.ai API"""

    ZAI_API_KEY = "5c03177d5d75466293543d34ce3f58d6.Z6AhWru7sTn9I47I"
    ZAI_API_URL = "https://api.z.ai/api/paas/v4/chat/completions"

    def __init__(self):
        """Inicializar o Agent Scraper"""
        self.config = Config()
        self.api_key = self.ZAI_API_KEY
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        })

        # Modelo a ser usado (mais leve e econômico)
        self.model = "glm-5"  # Modelo econômico e rápido

    def run_agent(self, prompt: str) -> Optional[str]:
        """
        Executar agente AI usando Z.ai

        Args:
            prompt: Instruções para o agente

        Returns:
            Resultado gerado pelo agente
        """
        logger.info(f"🤖 Executando agente com prompt: {prompt[:100]}...")

        try:
            payload = {
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": "Você é um assistente útil e especializado em análise de conteúdo e web scraping. Responda de forma clara e concisa em português."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 2000,
                "temperature": 0.7
            }

            response = self.session.post(
                self.ZAI_API_URL,
                json=payload,
                timeout=60
            )

            response.raise_for_status()
            data = response.json()

            # Extrair resposta
            result = self._parse_response(data)

            logger.info(f"✅ Agente executado com sucesso ({len(result)} caracteres)")
            return result

        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Erro na requisição para Z.ai: {e}")
            error_response = self._get_error_response(e)
            return error_response
        except Exception as e:
            logger.error(f"❌ Erro ao executar agente: {e}")
            return f"Erro ao executar agente: {str(e)}"

    def _parse_response(self, data: Dict[str, Any]) -> str:
        """
        Parsear resposta da API do Z.ai

        Args:
            data: Dados da resposta JSON

        Returns:
            String de resposta
        """
        try:
            # Formato padrão de chat completions
            if 'choices' in data and len(data['choices']) > 0:
                choice = data['choices'][0]
                if 'message' in choice and 'content' in choice['message']:
                    return choice['message']['content']

            # Fallback
            logger.warning("⚠️  Formato de resposta não reconhecido")
            return "Não foi possível processar a resposta do agente."

        except Exception as e:
            logger.error(f"❌ Erro ao parsear resposta: {e}")
            return "Erro ao processar resposta do agente."

    def _get_error_response(self, error: Exception) -> str:
        """
        Gerar resposta amigável para erros

        Args:
            error: Exceção capturada

        Returns:
            Mensagem de erro amigável
        """
        error_str = str(error)

        if "401" in error_str or "authentication" in error_str.lower():
            return "Erro de autenticação com Z.ai. Verifique se a API key está correta."
        elif "429" in error_str or "rate limit" in error_str.lower():
            return "Limite de requisições excedido. Tente novamente em alguns instantes."
        elif "timeout" in error_str.lower():
            return "Timeout ao conectar com Z.ai. Tente novamente."
        else:
            return f"Erro de comunicação com Z.ai: {error_str}"

    def test_agent(self, prompt: str = "Explique em uma frase o que é web scraping") -> Dict[str, Any]:
        """
        Testar funcionalidade do agente

        Args:
            prompt: Prompt de teste

        Returns:
            Resultado do teste
        """
        logger.info(f"🧪 Testando agente com prompt: {prompt}")

        try:
            result = self.run_agent(prompt)

            return {
                'success': True if result and "Erro" not in result[:10] else False,
                'message': f"{'Sucesso' if result and 'Erro' not in result[:10] else 'Erro no teste'}",
                'sample_result': result[:200] + "..." if result and len(result) > 200 else result
            }
        except Exception as e:
            return {
                'success': False,
                'message': f"Erro no teste: {str(e)}",
                'sample_result': None
            }


if __name__ == "__main__":
    scraper = AgentScraper()
    result = scraper.run_agent("Explique o que é web scraping em 3 tópicos principais.")
    print(result)