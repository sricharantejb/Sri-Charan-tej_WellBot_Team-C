import requests
import os
from dotenv import load_dotenv

load_dotenv('c:\\Users\\Sai shashank\\Downloads\\wellbot\\backend\\.env')
api_key = os.environ.get('GEMINI_API_KEY')

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"

try:
    res = requests.get(url, timeout=30)
    print(f"Status: {res.status_code}")
    if res.status_code == 200:
        models = res.json().get('models', [])
        for m in models:
            print(f"Model ID: {m.get('name')}")
    else:
        print(f"Error: {res.text}")
except Exception as e:
    print(f"Error: {e}")
