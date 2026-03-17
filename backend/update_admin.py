import os
os.environ['DATABASE_URL'] = 'sqlite:///site.db'
from app import create_app, db
from app.models import User

app = create_app()
with app.app_context():
    admin = User.query.filter_by(email='admin@wellbot.com').first()
    if admin:
        admin.is_admin = True
        db.session.commit()
        print(f"User {admin.email} is now admin.")
    else:
        print("Admin user not found in database.")
