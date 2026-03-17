import requests
import json

# Log in first
login_url = "http://localhost:5000/api/auth/login"
login_data = {"email": "test@example.com", "password": "password"} # Assuming this user exists

try:
    # Try sign up first if login fails
    signup_url = "http://localhost:5000/api/auth/signup"
    signup_data = {"name": "Test User", "email": "test@example.com", "password": "password"}
    requests.post(signup_url, json=signup_data)
    
    response = requests.post(login_url, json=login_data)
    token = response.json().get('token')
    
    chat_url = "http://localhost:5000/api/chat"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    chat_data = {"message": "hi"}
    
    chat_response = requests.post(chat_url, headers=headers, json=chat_data)
    print(f"Chat Response: {chat_response.text}")
except Exception as e:
    print(f"Error: {e}")
