from app import create_app, db
from app.models import ProgressEntry, Diagnosis, MedicalReport, RecoveryPlan

app = create_app()
with app.app_context():
    print("Dropping relevant tables...")
    # Drop in correct order
    try:
        ProgressEntry.__table__.drop(db.engine)
        Diagnosis.__table__.drop(db.engine)
        print("Dropped ProgressEntry and Diagnosis.")
    except Exception as e:
        print(f"Error dropping: {e}")

    print("Recreating all tables with new schema...")
    db.create_all()
    print("Database updated successfully!")
