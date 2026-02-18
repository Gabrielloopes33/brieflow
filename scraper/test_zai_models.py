#!/usr/bin/env python3
"""
Script de teste para diferentes modelos da API Z.ai
Execute: python test_zai_models.py
"""

import requests
import sys
from pathlib import Path

# Adicionar o diretório pai ao path
sys.path.insert(0, str(Path(__file__).parent.parent))

ZAI_API_KEY = "5c03177d5d75466293543d34ce3f58d6.Z6AhWru7sTn9I47I"
ZAI_API_URL = "https://api.z.ai/api/paas/v4/chat/completions"

# Modelos para testar
MODELS_TO_TEST = [
    "glm-4-flash",
    "glm-4",
    "glm-4-air",
    "gpt-3.5-turbo",
    "gpt-4",
]

test_prompt = "Olá, responda em 1 frase."

headers = {
    "Authorization": f"Bearer {ZAI_API_KEY}",
    "Content-Type": "application/json"
}

print("=" * 60)
print("Testing Z.ai Models")
print("=" * 60)
print()

for model in MODELS_TO_TEST:
    print(f"\n🧪 Testing model: {model}")
    print("-" * 40)
    
    payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful AI assistant."
            },
            {
                "role": "user",
                "content": test_prompt
            }
        ],
        "max_tokens": 500,
        "temperature": 0.7
    }
    
    try:
        response = requests.post(
            ZAI_API_URL,
            json=payload,
            headers=headers,
            timeout=30
        )
        
        response.raise_for_status()
        data = response.json()
        
        if 'choices' in data and len(data['choices']) > 0:
            result = data['choices'][0]['message']['content']
            print(f"✅ SUCCESS: {model[:50]}")
            print(f"   Result: {result[:100]}...")
        else:
            print(f"❌ ERROR: No choices in response")
            print(f"   Response: {data}")
        
    except requests.exceptions.RequestException as e:
        status_code = e.response.status_code if hasattr(e, 'response') else 0
        error_detail = e.response.text if hasattr(e, 'response') else str(e)
        
        print(f"❌ ERROR: {model[:50]}")
        print(f"   Status: {status_code}")
        print(f"   Detail: {error_detail[:200]}...")
    except Exception as e:
        print(f"❌ ERROR: {model[:50]}")
        print(f"   Exception: {str(e)[:200]}...")

print("\n" + "=" * 60)
print("Test Complete")
print("=" * 60)
print()
print("Recomendações:")
print("1. Use o modelo que funcionou acima no agent_scraper.py")
print("2. Se nenhum funcionar, verifique a API key")
print("3. Se o problema persistir, considere usar outra API (ex: OpenAI)")
