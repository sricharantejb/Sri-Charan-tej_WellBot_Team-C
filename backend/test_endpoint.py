import requests
import json

# We need a token. Let's assume there's a user we can login as or just use the admin one.
# Since I don't want to create real users, I'll just check if the backend is even up.

BASE_URL = "http://127.0.0.1:5100/api"

def test_chat():
    # Login first
    login_data = {
        "email": "admin@wellbot.com",
        "password": "password"
    }
    try:
        r = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if r.status_code != 200:
            print(f"Login failed: {r.text}")
            return
        
        token = r.json().get('access_token')
        headers = {"Authorization": f"Bearer {token}"}
        
        chat_data = {"message": "hi"}
        r = requests.post(f"{BASE_URL}/chat", json=chat_data, headers=headers)
        print(f"Chat Status: {r.status_code}")
        print(f"Chat Response: {r.text}")
        
    except Exception as e:
        print(f"Error connecting to backend: {e}")

if __name__ == "__main__":
    test_chat()
