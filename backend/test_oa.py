import os
import requests
from dotenv import load_dotenv

load_dotenv()

key = os.environ.get('OPENAI_API_KEY')
print(f"Key found: {key[:10]}...")

url = "https://api.openai.com/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}
payload = {
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello"}]
}

try:
    response = requests.post(url, headers=headers, json=payload, timeout=10)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
