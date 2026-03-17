from app import create_app, db
from app.models import User
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    users = User.query.all()
    print(f"Total users in DB: {len(users)}")
    for u in users:
        print(f" - ID: {u.id}, Email: {u.email}, Name: {u.name}, Admin: {u.is_admin}")

    # Ensure admin@wellbot.com exists and is admin
    admin = User.query.filter_by(email='admin@wellbot.com').first()
    if not admin:
        print("Creating admin user...")
        admin = User(
            email='admin@wellbot.com',
            name='System Administrator',
            password_hash=generate_password_hash('password'),
            is_admin=True
        )
        db.session.add(admin)
        db.session.commit()
        print("Admin user created successfully.")
    else:
        if not admin.is_admin:
            admin.is_admin = True
            db.session.commit()
            print("Updated existing user admin@wellbot.com to Admin status.")
        else:
            print("Admin user already exists and is active.")
