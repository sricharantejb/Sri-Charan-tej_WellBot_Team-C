from app import db, create_app
from app.models import User, ProgressEntry, HealthTimeline
from datetime import datetime, timedelta

app = create_app()
with app.app_context():
    user = User.query.filter(User.name.like('%SAI SHASHANK%')).first()
    if user:
        print(f"User: {user.name} (ID: {user.id})")
        print(f"Stored Streak: {user.health_streak}")
        
        today = datetime.utcnow().date()
        print(f"Scanning from: {today}")
        
        # Check entries for the last 10 days
        for i in range(10):
            d = today - timedelta(days=i)
            entry = ProgressEntry.query.filter_by(user_id=user.id, date=d).first()
            if entry:
                print(f"Date: {d} | Score: {entry.recovery_score}")
            else:
                print(f"Date: {d} | No Entry")
                
        # Calculate what the streak should be
        actual_streak = 0
        current_check = today
        while True:
            entry = ProgressEntry.query.filter_by(user_id=user.id, date=current_check).first()
            if entry and entry.recovery_score >= 100:
                actual_streak += 1
                current_check -= timedelta(days=1)
            else:
                break
        print(f"Calculated Actual Streak: {actual_streak}")

    else:
        print("User not found")
