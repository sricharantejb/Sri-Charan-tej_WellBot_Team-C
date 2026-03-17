import os
import requests
from dotenv import load_dotenv

load_dotenv()

key = os.environ.get('OPENROUTER_API_KEY')
print(f"Key found: {key[:10]}...")

url = "https://openrouter.ai/api/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}
payload = {
    "model": "deepseek/deepseek-chat",
    "messages": [{"role": "user", "content": "Return a JSON: {'test': 'success'}"}],
    "response_format": {"type": "json_object"}
}

try:
    response = requests.post(url, headers=headers, json=payload, timeout=10)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
