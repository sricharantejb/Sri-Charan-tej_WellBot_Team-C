import requests
import os
from dotenv import load_dotenv

load_dotenv('c:\\Users\\Sai shashank\\Downloads\\wellbot\\backend\\.env')
api_key = os.environ.get('GEMINI_API_KEY')

# Model name verified from list_models.py
model = "gemini-2.0-flash"
url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
data = {"contents": [{"parts": [{"text": "Say hello world"}]}]}
headers = {"Content-Type": "application/json"}

try:
    res = requests.post(url, headers=headers, json=data, timeout=30)
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text}")
except Exception as e:
    print(f"Error: {e}")
