import sys
import os
sys.path.append(os.getcwd())

from app import create_app, db
from app.models import User

app = create_app()
with app.app_context():
    users = User.query.all()
    for u in users:
        print(f"ID:{u.id}, Email:{u.email}, GoogleID:{u.google_id}, Name:{u.name}")
