import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ.get('GEMINI_API_KEY')
print(f"API Key: {api_key[:10]}...")

# Testing with 1.5-flash
url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
data = {"contents": [{"parts": [{"text": "Hello, how are you?"}]}]}
headers = {"Content-Type": "application/json"}

try:
    response = requests.post(url, headers=headers, json=data)
    print(f"Status Code 1.5: {response.status_code}")
    if response.status_code == 200:
        print("Success 1.5!")
        print(response.json()['candidates'][0]['content']['parts'][0]['text'])
    else:
        print(response.text)
except Exception as e:
    print(f"Error: {e}")

# Testing with the one currently in code: 2.5-flash
url2 = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
try:
    response = requests.post(url2, headers=headers, json=data)
    print(f"Status Code 2.5: {response.status_code}")
    print(response.text)
except Exception as e:
    print(f"Error 2.5: {e}")
