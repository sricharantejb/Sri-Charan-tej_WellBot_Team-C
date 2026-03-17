import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ.get('GEMINI_API_KEY')
print(f"Testing API Key: {api_key[:10]}...")

models_to_try = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"]
versions = ["v1beta", "v1"]

for v in versions:
    for m in models_to_try:
        url = f"https://generativelanguage.googleapis.com/{v}/models/{m}:generateContent?key={api_key}"
        data = {"contents": [{"parts": [{"text": "Say 'Health Assist'"}]}]}
        headers = {"Content-Type": "application/json"}
        
        try:
            print(f"Trying {v} with {m}...")
            response = requests.post(url, headers=headers, json=data, timeout=5)
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                print(f"SUCCESS with {v}/{m}!")
                print(response.json()['candidates'][0]['content']['parts'][0]['text'])
                break
            else:
                try:
                    err_msg = response.json().get('error', {}).get('message', 'No msg')
                    print(f"Error: {err_msg}")
                except:
                    print(f"Raw response: {response.text[:100]}")
        except Exception as e:
            print(f"Exception: {e}")
    else:
        continue
    break
