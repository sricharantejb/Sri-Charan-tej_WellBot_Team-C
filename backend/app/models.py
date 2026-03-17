from app import db
from datetime import datetime
import json

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=True) # Nullable for OAuth users
    google_id = db.Column(db.String(120), unique=True, nullable=True)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Profile fields
    blood_group = db.Column(db.String(10), nullable=True)
    weight = db.Column(db.Float, nullable=True) # in kg
    height = db.Column(db.Float, nullable=True) # in cm
    age = db.Column(db.Integer, nullable=True)
    gender = db.Column(db.String(20), nullable=True)
    medical_conditions = db.Column(db.Text, nullable=True) # Existing diseases
    health_goals = db.Column(db.Text, nullable=True)
    lifestyle_preferences = db.Column(db.String(50), default='Vegetarian') # Vegetarian/Non-Vegetarian
    emergency_contact = db.Column(db.String(100), nullable=True)
    is_admin = db.Column(db.Boolean, default=False)
    last_active = db.Column(db.DateTime, default=datetime.utcnow)
    health_streak = db.Column(db.Integer, default=0)
    
    # BMI Tracking
    bmi_value = db.Column(db.Float, nullable=True)
    bmi_category = db.Column(db.String(50), nullable=True) # Underweight, Normal, Overweight, Obese
    bmi_updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    reports = db.relationship('MedicalReport', backref='user', lazy=True)
    plans = db.relationship('RecoveryPlan', backref='user', lazy=True)
    reminders = db.relationship('Reminder', backref='user', lazy=True)
    chat_history = db.relationship('ChatHistory', backref='user', lazy=True)
    diagnoses = db.relationship('Diagnosis', backref='user', lazy=True)

class SystemConfig(db.Model):
    __tablename__ = 'system_config'
    key = db.Column(db.String(50), primary_key=True)
    value = db.Column(db.Text, nullable=False)
    description = db.Column(db.String(255))
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class MedicalReport(db.Model):
    __tablename__ = 'medical_reports'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    upload_time = db.Column(db.DateTime, default=datetime.utcnow)
    file_path = db.Column(db.String(255), nullable=False)
    ocr_text = db.Column(db.Text, nullable=True)
    summary = db.Column(db.Text, nullable=True)
    
    detections = db.relationship('DiseaseDetection', backref='report', lazy=True)

class DiseaseDetection(db.Model):
    __tablename__ = 'disease_detections'
    id = db.Column(db.Integer, primary_key=True)
    report_id = db.Column(db.Integer, db.ForeignKey('medical_reports.id'), nullable=False)
    disease_name = db.Column(db.String(100), nullable=False)
    severity = db.Column(db.String(50))
    notes = db.Column(db.Text)

class RecoveryPlan(db.Model):
    __tablename__ = 'recovery_plans'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date_generated = db.Column(db.DateTime, default=datetime.utcnow)
    veg_diet = db.Column(db.Text) 
    non_veg_diet = db.Column(db.Text)
    exercise_plan = db.Column(db.Text)
    dos = db.Column(db.Text)
    donts = db.Column(db.Text)
    natural_remedies = db.Column(db.Text, default='[]')
    
    progress = db.relationship('ProgressEntry', backref='plan', lazy=True)

class ProgressEntry(db.Model):
    __tablename__ = 'progress_entries'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    plan_id = db.Column(db.Integer, db.ForeignKey('recovery_plans.id'), nullable=True)
    date = db.Column(db.Date, default=datetime.utcnow().date)
    
    # Actual values
    water_intake = db.Column(db.Integer, default=0) # in ml
    sleep_hours = db.Column(db.Float, default=0.0)
    steps = db.Column(db.Integer, default=0)
    mood = db.Column(db.String(50), nullable=True) # Great, Good, Okay, Poor, Awful
    mood_score = db.Column(db.Integer, default=0) # 1-5 or 0-100
    nutrition_score = db.Column(db.Integer, default=0) # 0-100 bonus for healthy eating
    
    # Targets for the day (derived from master plan)
    target_water = db.Column(db.Integer, default=2000)
    target_steps = db.Column(db.Integer, default=5000)
    target_sleep = db.Column(db.Float, default=8.0)
    
    # Task lists stored as JSON strings
    diet_tasks = db.Column(db.Text, default='[]')
    exercise_tasks = db.Column(db.Text, default='[]')
    
    @property
    def recovery_score(self):
        """
        Calculates the daily health score (0-100) based on 4 Golden Pillars @ 25% each:
        1. Hydration Integrity (Water Intake)
        2. Kinetic Performance (Step Count)
        3. Circadian Recovery (Sleep Quality)
        4. AI Protocol Integration (Nutrition Logs + Recovery Task Completion)
        """
        try:
            # 1. Water Progress (25%)
            water_prog = min(self.water_intake / self.target_water, 1.0) if self.target_water > 0 else 1.0
            
            # 2. Activity Progress (25%)
            steps_prog = min(self.steps / self.target_steps, 1.0) if self.target_steps > 0 else 1.0
            
            # 3. Rest Progress (25%)
            sleep_prog = min(self.sleep_hours / self.target_sleep, 1.0) if self.target_sleep > 0 else 1.0
            
            # 4. Integrated Protocol Progress (25%)
            # Merges Nutrition Logs and AI Plan Adherence
            nutrition_prog = min(self.nutrition_score / 100.0, 1.0)
            
            diet_list = json.loads(self.diet_tasks)
            diet_prog = sum(1 for t in diet_list if t.get('completed')) / len(diet_list) if diet_list else 1.0
            
            exercise_list = json.loads(self.exercise_tasks)
            exercise_tasks_prog = sum(1 for t in exercise_list if t.get('completed')) / len(exercise_list) if exercise_list else 1.0
            
            adherence_prog = (diet_prog + exercise_tasks_prog) / 2.0
            
            # Unified Protocol Score (Balances daily lifestyle logs with long-term tasks)
            # We allow active nutrition logging to fulfill 100% of this pillar if excellent,
            # providing a path to index 100 for highly disciplined users.
            protocol_prog = max(nutrition_prog, (nutrition_prog * 0.7) + (adherence_prog * 0.3))
            
            # Final Pillar Calculation
            total_score = (
                (water_prog * 0.25) +
                (steps_prog * 0.25) +
                (sleep_prog * 0.25) +
                (protocol_prog * 0.25)
            ) * 100
            
            return min(round(total_score), 100)
        except Exception as e:
            print(f"Error in Score Algorithm: {e}")
            return 0

    @property
    def is_fully_completed(self):
        """Returns True if user reached 100% of their goals for the day."""
        return self.recovery_score >= 100

class Reminder(db.Model):
    __tablename__ = 'reminders'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.String(50)) # water, exercise, medication
    message = db.Column(db.String(255))
    cron_schedule = db.Column(db.String(100)) # Simple cron string or time
    last_sent = db.Column(db.DateTime)

class ChatHistory(db.Model):
    __tablename__ = 'chat_history'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_message = db.Column(db.Text)
    bot_response = db.Column(db.Text)

class Diagnosis(db.Model):
    __tablename__ = 'diagnoses'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    diagnosed_date = db.Column(db.Date, default=datetime.utcnow().date)
    doctor_name = db.Column(db.String(100))
    medication = db.Column(db.String(255))
    status = db.Column(db.String(50), default='Active') # Active, Recovering, Resolved
    severity = db.Column(db.String(50)) # Low, Moderate, Critical
    notes = db.Column(db.Text)

class Feedback(db.Model):
    __tablename__ = 'feedbacks'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer, default=5)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user_rel = db.relationship('User', backref='feedbacks', lazy=True)

class FoodLog(db.Model):
    __tablename__ = 'food_logs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    food_item = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(50)) # Breakfast, Lunch, etc.
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    is_healthy = db.Column(db.Boolean, default=True)
    is_suggestion = db.Column(db.Boolean, default=False)

class HealthTimeline(db.Model):
    __tablename__ = 'health_timeline'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    event_type = db.Column(db.String(50)) # joined, goal_met, improvement, milestone
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    date = db.Column(db.Date, default=datetime.utcnow().date)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
