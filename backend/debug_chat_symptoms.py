import requests
import json

# Log in first
login_url = "http://localhost:5000/api/auth/login"
login_data = {"email": "test@example.com", "password": "password"}

try:
    response = requests.post(login_url, json=login_data)
    token = response.json().get('token')
    
    chat_url = "http://localhost:5000/api/chat"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    chat_data = {"message": "I have a high fever and body aches"}
    
    chat_response = requests.post(chat_url, headers=headers, json=chat_data)
    print(f"Chat Response: {chat_response.text}")
except Exception as e:
    print(f"Error: {e}")
