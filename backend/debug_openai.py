import os
import requests
from dotenv import load_dotenv

load_dotenv('c:\\Users\\Sai shashank\\Downloads\\wellbot\\backend\\.env')
api_key = os.environ.get('OPENAI_API_KEY')

print(f"Key: {api_key[:15]}...")

url = "https://api.openai.com/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}
data = {
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "hi"}]
}

try:
    res = requests.post(url, headers=headers, json=data, timeout=30)
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text}")
except Exception as e:
    print(f"Error: {e}")
