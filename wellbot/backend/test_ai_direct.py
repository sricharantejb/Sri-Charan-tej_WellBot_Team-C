import os
import sys
# Add backend to path
sys.path.append('c:\\Users\\Sai shashank\\Downloads\\wellbot\\backend')

from app import create_app
from app.services.ai_service import get_ai_response

app = create_app()

with app.app_context():
    # Load env manually if not loaded
    from dotenv import load_dotenv
    load_dotenv('c:\\Users\\Sai shashank\\Downloads\\wellbot\\backend\\.env')
    
    # Check what's in env
    print(f"OPENAI_API_KEY set: {bool(os.environ.get('OPENAI_API_KEY'))}")
    print(f"GEMINI_API_KEY set: {bool(os.environ.get('GEMINI_API_KEY'))}")
    
    print("Testing OpenAI first...")
    try:
        res = get_ai_response("Say hello world in 1 word.")
        print(f"Response: {res}")
    except Exception as e:
        print(f"ERROR: {e}")
