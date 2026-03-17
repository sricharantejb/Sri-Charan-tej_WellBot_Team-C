import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get('GEMINI_API_KEY')

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
data = {"contents": [{"parts": [{"text": "Hello"}]}]}
headers = {"Content-Type": "application/json"}

print(f"URL: {url.replace(api_key, 'HIDDEN')}")

try:
    response = requests.post(url, headers=headers, json=data)
    print(f"Status: {response.status_code}")
    print("Response Body:")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
