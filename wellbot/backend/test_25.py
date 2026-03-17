import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get('GEMINI_API_KEY')

# Try gemini-2.5-flash with v1beta
url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
data = {"contents": [{"parts": [{"text": "Hello"}]}]}
headers = {"Content-Type": "application/json"}

print(f"URL: {url}")
try:
    response = requests.post(url, headers=headers, json=data)
    print(f"Status: {response.status_code}")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
