import requests
import json

def test_analyze_paste():
    # Login to get a token
    login_url = "http://localhost:5100/api/auth/login"
    login_data = {
        "email": "sai@shashank.com", # Assuming this user exists from previous context or I'll try jetski_test_123@example.com
        "password": "password123"
    }
    
    # Try one of the users
    resp = requests.post(login_url, json=login_data)
    if resp.status_code != 200:
        # Try another one
        login_data = {"email": "jetski_test_123@example.com", "password": "password123"}
        resp = requests.post(login_url, json=login_data)
        
    if resp.status_code == 200:
        token = resp.json().get('access_token')
        print(f"Logged in, token obtained.")
        
        analyze_url = "http://localhost:5100/api/plan/analyze-paste"
        headers = {"Authorization": f"Bearer {token}"}
        payload = {"text": "Drink more water and exercise daily. Take paracetamol for fever."}
        
        print("Sending analyze-paste request...")
        resp = requests.post(analyze_url, json=payload, headers=headers)
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text}")
    else:
        print(f"Login failed: {resp.status_code} {resp.text}")

if __name__ == "__main__":
    test_analyze_paste()
