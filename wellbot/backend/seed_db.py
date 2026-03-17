from dotenv import load_dotenv
import os

load_dotenv()

from app import create_app, db
from app.models import User, RecoveryPlan, ProgressEntry, Feedback
from datetime import datetime, timedelta
import json
from werkzeug.security import generate_password_hash

app = create_app()
with app.app_context():
    # Clear and recreate tables to ensure schema matches
    db.drop_all()
    db.create_all()

    # Create dummy user
    user = User(
        email='test@example.com',
        name='Shashank',
        password_hash=generate_password_hash('password123'),
        age=25,
        weight=70,
        height=175,
        medical_conditions="None",
        health_goals="Weight loss and muscle gain",
        lifestyle_preferences="Vegetarian"
    )
    db.session.add(user)
    
    # Create Admin user
    admin = User(
        email='admin@wellbot.com',
        name='Admin User',
        password_hash=generate_password_hash('admin123'),
        is_admin=True
    )
    db.session.add(admin)
    db.session.commit()

    # Create dummy feedbacks
    f1 = Feedback(user_id=user.id, message="Great app! Love the AI features.", rating=5)
    f2 = Feedback(user_id=user.id, message="Dashboard layout could be cleaner.", rating=4)
    db.session.add_all([f1, f2])
    db.session.commit()

    # Create a plan
    plan = RecoveryPlan(
        user_id=user.id,
        diet_plan=json.dumps([
            {"id": 1, "task": "Drink 500ml green tea", "completed": False},
            {"id": 2, "task": "Eat protein-rich breakfast", "completed": True}
        ]),
        exercise_plan=json.dumps([
            {"id": 3, "task": "15 min light walking", "completed": False}
        ]),
        natural_remedies=json.dumps([
            {"id": 4, "task": "Take 5 soaked almonds", "completed": True}
        ]),
        dos="Keep active, drink water",
        donts="Avoid sugary snacks"
    )
    db.session.add(plan)
    db.session.commit()

    # Create past progress entries
    today = datetime.utcnow().date()
    for i in range(14, 0, -1):
        d = today - timedelta(days=i)
        entry = ProgressEntry(
            user_id=user.id,
            plan_id=plan.id,
            date=d,
            water_intake=1200 + (i * 50),
            steps=3000 + (i * 200),
            sleep_hours=7.0 + (i * 0.1),
            mood='Good',
            mood_score=70 + i,
            diet_tasks=plan.diet_plan,
            exercise_tasks=plan.exercise_plan
        )
        db.session.add(entry)
    
    # Create today's progress
    today_entry = ProgressEntry(
        user_id=user.id,
        plan_id=plan.id,
        date=today,
        water_intake=800,
        steps=2500,
        sleep_hours=6.5,
        mood='Okay',
        mood_score=60,
        diet_tasks=plan.diet_plan,
        exercise_tasks=plan.exercise_plan
    )
    db.session.add(today_entry)
    
    db.session.commit()
    print("Database seeded successfully!")
    print("User: test@example.com / password123")
    print("Admin: admin@wellbot.com / admin123")
