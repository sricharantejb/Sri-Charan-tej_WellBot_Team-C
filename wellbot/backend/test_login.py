import requests
import json

try:
    url = "http://127.0.0.1:5100/api/auth/login"
    payload = {"email": "admin@wellbot.com", "password": "admin123"}
    response = requests.post(url, json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
