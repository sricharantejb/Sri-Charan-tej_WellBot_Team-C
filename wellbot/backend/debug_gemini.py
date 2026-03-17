import requests
import os
from dotenv import load_dotenv

load_dotenv('c:\\Users\\Sai shashank\\Downloads\\wellbot\\backend\\.env')

api_key = os.environ.get('GEMINI_API_KEY')
print(f"Key: {api_key[:5]}...{api_key[-5:] if api_key else 'None'}")

model = "gemini-1.5-flash"
url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
data = {"contents": [{"parts": [{"text": "Say hello world"}]}]}
headers = {"Content-Type": "application/json"}

try:
    res = requests.post(url, headers=headers, json=data, timeout=30)
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text}")
except Exception as e:
    print(f"Error: {e}")
