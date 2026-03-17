import requests
import json

def test_chat_api():
    base_url = "http://localhost:5000/api"
    
    # Login
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }
    r = requests.post(f"{base_url}/auth/login", json=login_data)
    if r.status_code != 200:
        print(f"Login failed: {r.text}")
        return
        
    token = r.json().get('access_token')
    headers = {"Authorization": f"Bearer {token}"}
    
    # Chat
    chat_data = {"message": "hi"}
    r = requests.post(f"{base_url}/chat", json=chat_data, headers=headers)
    print(f"Chat status: {r.status_code}")
    print(f"Chat response: {json.dumps(r.json(), indent=2)}")

if __name__ == "__main__":
    test_chat_api()
