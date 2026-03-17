from app import create_app, db
from app.models import User

app = create_app()
with app.app_context():
    users = User.query.filter_by(google_id='google-id-123').all()
    print(f"Users with google-id-123: {[u.email for u in users]}")
    
    users = User.query.all()
    print(f"All Users: {[u.email for u in users]}")
