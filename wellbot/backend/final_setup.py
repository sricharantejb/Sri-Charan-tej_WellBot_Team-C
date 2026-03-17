import sys
import os

# Add the current directory to sys.path so 'app' can be imported
sys.path.append(os.getcwd())

from app import create_app, db
from app.models import User
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    try:
        db.create_all()
        print("Database tables created/verified.")
        
        admin_email = 'admin@wellbot.com'
        admin = User.query.filter_by(email=admin_email).first()
        
        if not admin:
            print("Creating admin user...")
            admin = User(
                email=admin_email,
                name='Admin User',
                password_hash=generate_password_hash('password'),
                is_admin=True
            )
            db.session.add(admin)
            db.session.commit()
            print("Admin user created successfully.")
        else:
            admin.is_admin = True
            admin.password_hash = generate_password_hash('password')
            db.session.commit()
            print("Admin user updated successfully.")
            
    except Exception as e:
        print(f"Error during setup: {e}")
