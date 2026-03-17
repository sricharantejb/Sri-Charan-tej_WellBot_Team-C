from dotenv import load_dotenv
import os

load_dotenv()

from app import create_app

app = create_app()

with app.app_context():
    from app import db
    db.create_all()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5100))
    app.run(debug=True, host='0.0.0.0', port=port)
