from app import create_app, db
from sqlalchemy import text

from dotenv import load_dotenv
load_dotenv()

app = create_app()
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
print(f"Using database: {app.config['SQLALCHEMY_DATABASE_URI']}")
with app.app_context():
    try:
        # Add columns to users table
        with db.engine.connect() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN blood_group VARCHAR(10)"))
            conn.execute(text("ALTER TABLE users ADD COLUMN weight FLOAT"))
            conn.execute(text("ALTER TABLE users ADD COLUMN height FLOAT"))
            conn.execute(text("ALTER TABLE users ADD COLUMN age INTEGER"))
            conn.execute(text("ALTER TABLE users ADD COLUMN gender VARCHAR(20)"))
            conn.execute(text("ALTER TABLE users ADD COLUMN medical_conditions TEXT"))
            conn.execute(text("ALTER TABLE users ADD COLUMN emergency_contact VARCHAR(100)"))
            conn.commit()
        print("Columns added successfully")
    except Exception as e:
        print(f"Error: {e}")
