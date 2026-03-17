from app import db, create_app
from app.models import User, ProgressEntry, HealthTimeline
from datetime import datetime

app = create_app()
with app.app_context():
    user = User.query.filter(User.name.like('%SAI SHASHANK%')).first()
    if user:
        print(f"BEFORE: Streak: {user.health_streak}")
        today = datetime.utcnow().date()
        entry = ProgressEntry.query.filter_by(user_id=user.id, date=today).first()
        if entry:
            print(f"Today Score: {entry.recovery_score}")
            from app.routes.api import check_and_update_streak
            res = check_and_update_streak(user.id, 0, entry.recovery_score)
            print(f"Update Result: {res}")
        
        db.session.refresh(user)
        print(f"AFTER: Streak: {user.health_streak}")
        
        milestone = HealthTimeline.query.filter_by(user_id=user.id, event_type='goal_met', date=today).first()
        print(f"Today Milestone: {'Exists' if milestone else 'Missing'}")
    else:
        print("User not found")
