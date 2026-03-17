import os
import requests
from dotenv import load_dotenv

load_dotenv()

def test_gemini():
    api_key = os.environ.get('GEMINI_API_KEY')
    print(f"Testing API Key: {api_key}")
    
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/"
        f"models/gemini-2.5-flash:generateContent?key={api_key}"
    )
    headers = {"Content-Type": "application/json"}
    data = {"contents": [{"parts": [{"text": "Hello, this is a test."}]}]}

    try:
        response = requests.post(url, headers=headers, json=data, timeout=30)
        print(f"Status Code: {response.status_code}")
        if response.status_code != 200:
            print(f"Error Response: {response.text}")
        else:
            response_data = response.json()
            print(f"Success Response: {response_data['candidates'][0]['content']['parts'][0]['text']}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_gemini()
