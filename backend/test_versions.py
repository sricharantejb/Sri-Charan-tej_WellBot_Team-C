import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get('GEMINI_API_KEY')

# Try v1
url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={api_key}"
data = {"contents": [{"parts": [{"text": "Hello"}]}]}
headers = {"Content-Type": "application/json"}

print(f"URL: {url}")
try:
    response = requests.post(url, headers=headers, json=data)
    print(f"V1 Status: {response.status_code}")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")

# Try gemini-1.5-flash-latest
url2 = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={api_key}"
try:
    response = requests.post(url2, headers=headers, json=data)
    print(f"Latest Status: {response.status_code}")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
