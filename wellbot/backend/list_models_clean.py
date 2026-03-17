import os
import requests
from dotenv import load_dotenv
import json

load_dotenv()

def list_models():
    api_key = os.environ.get('GEMINI_API_KEY')
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    try:
        response = requests.get(url)
        models = response.json().get('models', [])
        for m in models:
            print(f"- {m['name']}")
    except Exception as e:
        print(e)

if __name__ == "__main__":
    list_models()
