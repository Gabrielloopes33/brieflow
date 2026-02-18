"""
Agent Scraper usando OpenAI API
Modelo: gpt-4o-mini (rápido, econômico e inteligente)
"""

import os
import sys
from pathlib import Path
from typing import Optional, Dict, Any
from openai import OpenAI

from models.scraper import AgentResponse, AgentRequest

sys.path.insert(0, str(Path(__file__).parent.parent))
from utils.config import Config
from utils.logger import setup_logger

logger = setup_logger()

class OpenAIAgentScraper:
    """Scraper para agente AI usando OpenAI API"""

    def __init__(self):
        """Inicializar o OpenAI Agent Scraper"""
        self.config = Config()
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.api_url = os.getenv("OPENAI_API_URL", "https://api.openai.com/v1")
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

        # Verificar se a API key está configurada
        if not self.api_key:
            logger.warning("⚠️  OPENAI_API_KEY não configurada. Configure no .env")
            self.api_key = "sk-dummy-key"

        # Inicializar cliente OpenAI
        try:
            self.client = OpenAI(
                api_key=self.api_key,
                base_url=self.api_url if self.api_url != "https://api.openai.com/v1" else None
            )
            logger.info(f"✅ OpenAI Client inicializado (modelo: {self.model})")
        except Exception as e:
            logger.error(f"❌ Erro ao inicializar OpenAI Client: {e}")
            self.client = None

    def run_agent(self, prompt: str) -> Optional[str]:
        """
        Executar agente AI usando OpenAI

        Args:
            prompt: Instruções para o agente

        Returns:
            Resultado gerado pelo agente
        """
        if not self.client:
            return "Erro: OpenAI Client não inicializado. Verifique OPENAI_API_KEY no .env"

        logger.info(f"🤖 Executando agente OpenAI (modelo: {self.model}) com prompt: {prompt[:100]}...")

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "Você é um assistente útil e especializado em análise de conteúdo e web scraping. Responda de forma clara e concisa em português. Seja conciso e direto."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=2000,
                temperature=0.7
            )

            # Extrair resposta
            result = response.choices[0].message.content

            logger.info(f"✅ Agente OpenAI executado com sucesso ({len(result)} caracteres)")
            return result

        except Exception as e:
            logger.error(f"❌ Erro ao executar agente OpenAI: {e}")
            error_response = self._get_error_response(e)
            return error_response

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
        if "401" in error_str or "authentication" in error_str.lower() or "api_key" in error_str.lower():
            return "Erro de autenticação com OpenAI. Verifique se a OPENAI_API_KEY está correta no .env."
        elif "429" in error_str or "rate limit" in error_str.lower():
            return "Limite de requisições OpenAI excedido. Tente novamente em alguns instantes."
        elif "timeout" in error_str.lower():
            return "Timeout ao conectar com OpenAI. Tente novamente."
        elif "insufficient_quota" in error_str.lower() or "billing" in error_str.lower():
            return "Erro: Sem saldo na conta OpenAI. Verifique seu billing em https://platform.openai.com/account/billing"
        elif "model" in error_str.lower() and "not found" in error_str.lower():
            return f"Erro: Modelo '{self.model}' não encontrado. Verifique se o modelo está disponível."
        else:
            return f"Erro de comunicação com OpenAI: {error_str[:150]}"

    def test_agent(self, prompt: str = "Olá mundo, responda em 1 frase") -> Dict[str, Any]:
        """
        Testar funcionalidade do agente

        Args:
            prompt: Prompt de teste

        Returns:
            Dicionário com resultado do teste
        """
        logger.info(f"🧪 Testando agente OpenAI com prompt: {prompt}")

        try:
            result = self.run_agent(prompt)

            return {
                'success': True if result and "Erro" not in result[:10] else False,
                'message': f"{'Sucesso' if result and 'Erro' not in result[:10] else 'Falha'}",
                'sample_result': result[:200] + "..." if result and len(result) > 200 else result,
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
    scraper = OpenAIAgentScraper()
    result = scraper.run_agent("Olá mundo, responda em 1 frase")
    print(result)
