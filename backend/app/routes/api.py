from flask import Blueprint, request, jsonify, current_app
import json
from app import db
from app.models import User, MedicalReport, RecoveryPlan, ProgressEntry, Reminder, DiseaseDetection
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta

def check_and_update_streak(user_id, old_score, new_score):
    """Internal helper to recalculated and set correct streak."""
    if new_score >= 100:
        from app.models import HealthTimeline, ProgressEntry
        today = datetime.utcnow().date()
        
        # Check if we already recorded today's milestone
        existing = HealthTimeline.query.filter_by(user_id=user_id, event_type='goal_met', date=today).first()
        
        # RECALCULATE ACTUAL STREAK: Count consecutive 100% days backwards from today
        actual_streak = 0
        current_check = today
        while True:
            entry = ProgressEntry.query.filter_by(user_id=user_id, date=current_check).first()
            if entry and entry.recovery_score >= 100:
                actual_streak += 1
                current_check -= timedelta(days=1)
            else:
                break
        
        user = User.query.get(user_id)
        if user:
            # Update to actual calculated value
            user.health_streak = actual_streak
            db.session.commit()
            
            if not existing:
                milestone = HealthTimeline(
                    user_id=user_id,
                    event_type='goal_met',
                    title=f"{user.health_streak} Day Milestone!",
                    description=f"Congratulations! You've achieved 100% daily protocol. Current streak is {user.health_streak} days.",
                    date=today
                )
                db.session.add(milestone)
                db.session.commit()
                return True
    return False

api_bp = Blueprint('api', __name__)

@api_bp.route('/ping', methods=['GET'])
def ping():
    return jsonify({"message": "pong"}), 200

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@api_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_data():
    user_id = int(get_jwt_identity())
    today = datetime.utcnow().date()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    progress = ProgressEntry.query.filter_by(user_id=user_id, date=today).first()
    
    if not progress:
        yesterday = today - timedelta(days=1)
        yesterday_entry = ProgressEntry.query.filter_by(user_id=user_id, date=yesterday).first()
        
        # If yesterday was NOT completed, the streak MUST be zero for a fresh day today.
        if not yesterday_entry or yesterday_entry.recovery_score < 100:
             user.health_streak = 0
             db.session.commit()
        else:
             # If yesterday was completed, we keep the yesterday's streak record
             # and wait for today's completion to increment it in check_and_update_streak
             pass

        latest_plan = RecoveryPlan.query.filter_by(user_id=user_id).order_by(RecoveryPlan.date_generated.desc()).first()
        plan_id = latest_plan.id if latest_plan else None
        
        # Decide diet based on preference
        diet_init = '[]'
        if latest_plan:
            if user.lifestyle_preferences == 'Non-Vegetarian':
                diet_init = latest_plan.non_veg_diet or '[]'
            else:
                diet_init = latest_plan.veg_diet or '[]'
                
        exercise_init = latest_plan.exercise_plan if latest_plan and latest_plan.exercise_plan else '[]'

        progress = ProgressEntry(
            user_id=user_id, plan_id=plan_id, date=today,
            target_water=2000, target_steps=6000, target_sleep=8.0,
            diet_tasks=diet_init, exercise_tasks=exercise_init
        )
        db.session.add(progress)
        user.last_active = datetime.utcnow() # Update last active on first sync of the day
        db.session.commit()
    
    reports_count = MedicalReport.query.filter_by(user_id=user_id).count()
    
    # AI Logic
    from app.services.ai_service import generate_smart_suggestions, generate_coach_insights
    suggestions = generate_smart_suggestions({
        "water": progress.water_intake, "steps": progress.steps, "sleep": progress.sleep_hours
    }, {"medical_conditions": user.medical_conditions, "health_goals": user.health_goals})
    
    coach_advice = generate_coach_insights({
        "water_intake": progress.water_intake, "target_water": progress.target_water,
        "steps": progress.steps, "target_steps": progress.target_steps,
        "sleep_hours": progress.sleep_hours, "target_sleep": progress.target_sleep,
        "mood": progress.mood or "Normal", "mood_score": progress.mood_score,
        "recovery_score": progress.recovery_score
    })

    # Risk Calculation
    risk_level = "Healthy"
    risk_description = "You are maintaining excellent health habits. Keep it up!"
    if progress.recovery_score < 60:
        risk_level = "Health Risk"
        if progress.water_intake < progress.target_water * 0.5:
            risk_description = "Health Insight\nYour hydration levels are critically low today.\n\nRecommendation:\nIncrease water intake by 500ml immediately."
        elif progress.steps < progress.target_steps * 0.5:
            risk_description = "Health Insight\nYour physical activity is dangerously low.\n\nRecommendation:\nTake a 15-minute walk to stimulate circulation."
        else:
            risk_description = "Health Insight\nMultiple health metrics are below target.\n\nRecommendation:\nFocus on hydration, light exercise, and proper rest tonight."
    elif progress.recovery_score < 80:
        risk_level = "Moderate Risk"
        if progress.water_intake < progress.target_water:
            risk_description = "Health Insight\nYour hydration levels are slightly below optimal.\n\nRecommendation:\nDrink an extra glass of water to meet your goal."
        elif progress.steps < progress.target_steps:
            risk_description = "Health Insight\nYou are slightly behind on your step count today.\n\nRecommendation:\nTry an evening stroll to complete your goal."
        else:
            risk_description = "Health Insight\nYou are close to your goals but need a small push.\n\nRecommendation:\nEnsure you get 8 hours of sleep tonight for full recovery."

    # Streak Handling: If 100% first time today
    today_completed = progress.recovery_score >= 100
    
    # Final verification: If they are at 100% now, ensure streak is updated (catch-all)
    if progress.recovery_score >= 100:
        check_and_update_streak(user_id, 0, progress.recovery_score) # 0 as old_score triggers the logic
        user = User.query.get(user_id) # Refresh user state for accurate return
        
    # Include Latest Plan Details for immediate Dashboard oversight
    latest_plan = RecoveryPlan.query.filter_by(user_id=user_id).order_by(RecoveryPlan.date_generated.desc()).first()
    plan_info = {
        "dos": latest_plan.dos if latest_plan else "Consult a professional",
        "donts": latest_plan.donts if latest_plan else "None currently",
        "has_plan": latest_plan is not None
    }

    return jsonify({
        "user_name": user.name,
        "health_score": progress.recovery_score,
        "water_intake": progress.water_intake,
        "target_water": progress.target_water,
        "sleep_hours": progress.sleep_hours,
        "target_sleep": progress.target_sleep,
        "steps": progress.steps,
        "target_steps": progress.target_steps,
        "nutrition_score": progress.nutrition_score,
        "mood": progress.mood,
        "health_streak": user.health_streak or 0,
        "reports_count": reports_count,
        "is_completed": today_completed,
        "diet_tasks": json.loads(progress.diet_tasks) if progress.diet_tasks else [],
        "exercise_tasks": json.loads(progress.exercise_tasks) if progress.exercise_tasks else [],
        "ai_suggestions": suggestions,
        "coach_advice": coach_advice,
        "medical_plan": plan_info,
        "risk_level": risk_level,
        "risk_description": risk_description,
        "bmi_value": user.bmi_value,
        "bmi_category": user.bmi_category,
        "date": progress.date.isoformat()
    }), 200



@api_bp.route('/reports/upload', methods=['POST'])
@jwt_required()
def upload_report():
    user_id = get_jwt_identity()
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        upload_folder = os.path.join(current_app.root_path, 'uploads')
        os.makedirs(upload_folder, exist_ok=True)
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)
        
        # Trigger OCR Processing
        from app.services.ocr_service import extract_text, process_report_for_summary
        ocr_text = extract_text(file_path)
        summary = process_report_for_summary(ocr_text)

        # Create/Update DB record
        report = MedicalReport(
            user_id=user_id,
            file_path=file_path,
            ocr_text=ocr_text,
            summary=summary
        )
        db.session.add(report)
        db.session.commit()
        
        # AI Analysis and Plan Generation
        from app.services.ai_service import analyze_report_and_generate_plan
        user = User.query.get(user_id)
        user_profile = {
            "age": user.age,
            "weight": user.weight,
            "height": user.height,
            "lifestyle_preferences": user.lifestyle_preferences,
            "medical_conditions": user.medical_conditions,
            "health_goals": user.health_goals
        }
        plan_data = analyze_report_and_generate_plan(ocr_text, user_profile)
        
        # Create Recovery Plan
        # Robustly handle dos/donts which might come as strings or lists from AI
        def normalize_to_string(val):
            if isinstance(val, list):
                return "\n".join([f"• {i.get('task', i) if isinstance(i, dict) else i}" for i in val])
            return str(val or "")

        new_plan = RecoveryPlan(
            user_id=user_id,
            veg_diet=json.dumps(plan_data.get('veg_diet', [])),
            non_veg_diet=json.dumps(plan_data.get('non_veg_diet', [])),
            exercise_plan=json.dumps(plan_data.get('exercise_plan', [])),
            dos=normalize_to_string(plan_data.get('dos')),
            donts=normalize_to_string(plan_data.get('donts')),
            natural_remedies=json.dumps(plan_data.get('natural_remedies', []))
        )
        db.session.add(new_plan)
        db.session.commit()
        
        # Save to Chat History for AI Context
        from app.models import ChatHistory
        chat_record = ChatHistory(
            user_id=user_id,
            user_message=f"[REPORT UPLOAD] Analyzed file: {filename}",
            bot_response=f"I've analyzed your medical report: {filename}. I've found some key areas to focus on for your recovery and have generated a personalized protocol. Summary: {summary[:300]}... You can find the full diet and exercise plan in the Recovery Plan section."
        )
        db.session.add(chat_record)

        # Update User Profile Context
        if summary:
            if not user.medical_conditions:
                user.medical_conditions = f"Clinical Discovery: {summary[:500]}"
            elif summary[:100] not in user.medical_conditions:
                user.medical_conditions += f"\nRecent clinical finding: {summary[:500]}"

        db.session.commit()
        
        return jsonify({
            "message": "File uploaded and processed successfully", 
            "report_id": report.id,
            "plan_id": new_plan.id,
            "briefing": plan_data # Return the full plan data for the "briefing" view
        }), 201
    
    return jsonify({"error": "File type not allowed"}), 400

@api_bp.route('/reports', methods=['GET'])
@jwt_required()
def get_reports():
    user_id = get_jwt_identity()
    reports = MedicalReport.query.filter_by(user_id=user_id).order_by(MedicalReport.upload_time.desc()).all()
    results = []
    for r in reports:
        results.append({
            "id": r.id,
            "upload_time": r.upload_time.isoformat(),
            "summary": r.summary
        })
    return jsonify(results), 200

@api_bp.route('/plan/analyze-paste', methods=['POST'])
@jwt_required()
def analyze_pasted_plan():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.json
    text = data.get('text')
    
    if not text:
        return jsonify({"error": "No text provided"}), 400
        
    from app.services.ai_service import extract_plan_from_text
    profile = {
        "medical_conditions": user.medical_conditions,
        "lifestyle_preferences": user.lifestyle_preferences
    }
    extracted = extract_plan_from_text(text, profile)
    
    # Save as new plan
    from app.models import RecoveryPlan
    # Robustly handle dos/donts which might come as strings or lists from AI
    def normalize_to_string(val):
        if isinstance(val, list):
            return "\n".join([f"• {i.get('task', i) if isinstance(i, dict) else i}" for i in val])
        return str(val or "")

    new_plan = RecoveryPlan(
        user_id=user_id,
        veg_diet=json.dumps(extracted.get('veg_diet', [])),
        non_veg_diet=json.dumps(extracted.get('non_veg_diet', [])),
        exercise_plan=json.dumps(extracted.get('exercise_plan', [])),
        dos=normalize_to_string(extracted.get('dos', '')),
        donts=normalize_to_string(extracted.get('donts', '')),
        natural_remedies=json.dumps(extracted.get('natural_remedies', []))
    )
    db.session.add(new_plan)
    db.session.commit()
    
    return jsonify({"message": "Plan successfully extracted and saved", "plan_id": new_plan.id}), 200

@api_bp.route('/plan', methods=['GET'])
@jwt_required()
def get_recovery_plan():
    user_id = get_jwt_identity()
    plan = RecoveryPlan.query.filter_by(user_id=user_id).order_by(RecoveryPlan.date_generated.desc()).first()
    
    if not plan:
        return jsonify({"error": "No active recovery plan found"}), 404
        
    return jsonify({
        "id": plan.id,
        "veg_diet": plan.veg_diet or "[]",
        "non_veg_diet": plan.non_veg_diet or "[]",
        "exercise_plan": plan.exercise_plan,
        "dos": plan.dos,
        "donts": plan.donts,
        "natural_remedies": plan.natural_remedies,
        "date_generated": plan.date_generated.isoformat()
    }), 200

from flask_cors import cross_origin

@api_bp.route('/plan/clear', methods=['POST'])
@cross_origin(supports_credentials=True)
@jwt_required()
def clear_recovery_plan():
    user_id = int(get_jwt_identity())
    
    # Use safer deletion method
    plans = RecoveryPlan.query.filter_by(user_id=user_id).all()
    for p in plans:
        db.session.delete(p)
    
    # Also reset progress tasks for today
    today = datetime.utcnow().date()
    entry = ProgressEntry.query.filter_by(user_id=user_id, date=today).first()
    if entry:
        entry.diet_tasks = '[]'
        entry.exercise_tasks = '[]'
        entry.recovery_score = 0
        entry.nutrition_score = 0
        
    db.session.commit()
    return jsonify({"message": "Recovery plan and daily tasks cleared successfully"}), 200

@api_bp.route('/diagnoses', methods=['GET'])
@jwt_required()
def get_diagnoses():
    user_id = get_jwt_identity()
    from app.models import Diagnosis, DiseaseDetection, MedicalReport
    
    # 1. Formal Diagnoses
    diagnoses = Diagnosis.query.filter_by(user_id=user_id).order_by(Diagnosis.diagnosed_date.desc()).all()
    results = []
    for d in diagnoses:
        results.append({
            "id": d.id,
            "name": d.name,
            "diagnosed_date": d.diagnosed_date.isoformat(),
            "doctor_name": d.doctor_name,
            "medication": d.medication,
            "status": d.status,
            "severity": d.severity,
            "notes": d.notes,
            "source": "Clinical"
        })
    
    # 2. AI Detections from Reports
    reports = MedicalReport.query.filter_by(user_id=user_id).all()
    for r in reports:
        detections = DiseaseDetection.query.filter_by(report_id=r.id).all()
        for det in detections:
            # Avoid duplicating if name matches a formal diagnosis? 
            # For simplicity, just add them as "AI Analytics" source
            results.append({
                "id": f"ai_{det.id}",
                "name": det.disease_name,
                "diagnosed_date": r.upload_time.isoformat(),
                "doctor_name": "WellBot AI Intelligence",
                "medication": "See Recovery Plan",
                "status": "Detected",
                "severity": det.severity or "Moderate",
                "notes": det.notes,
                "source": "AI Analysis"
            })
            
    # Sort by date
    results.sort(key=lambda x: x['diagnosed_date'], reverse=True)
    return jsonify(results), 200

@api_bp.route('/diagnoses', methods=['POST'])
@jwt_required()
def add_diagnosis():
    user_id = get_jwt_identity()
    data = request.json
    from app.models import Diagnosis
    
    new_diag = Diagnosis(
        user_id=user_id,
        name=data.get('name'),
        diagnosed_date=datetime.strptime(data.get('diagnosed_date'), '%Y-%m-%d').date() if data.get('diagnosed_date') else datetime.utcnow().date(),
        doctor_name=data.get('doctor_name'),
        medication=data.get('medication'),
        status=data.get('status', 'Active'),
        severity=data.get('severity', 'Moderate'),
        notes=data.get('notes')
    )
    db.session.add(new_diag)
    db.session.commit()
    return jsonify({"message": "Diagnosis added", "id": new_diag.id}), 201

@api_bp.route('/dashboard/history', methods=['GET'])
@jwt_required()
def get_health_history():
    user_id = get_jwt_identity()
    from datetime import timedelta
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=6)
    
    history = ProgressEntry.query.filter(
        ProgressEntry.user_id == user_id,
        ProgressEntry.date >= start_date,
        ProgressEntry.date <= end_date
    ).order_by(ProgressEntry.date.asc()).all()
    
    results = []
    for entry in history:
        results.append({
            "date": entry.date.strftime('%a'),
            "completion": entry.completion_percentage,
            "steps": entry.steps,
            "water": entry.water_intake
        })
    
    return jsonify(results), 200

@api_bp.route('/history/adherence', methods=['GET'])
@jwt_required()
def get_adherence_history():
    user_id = get_jwt_identity()
    month = request.args.get('month', type=int)
    year = request.args.get('year', type=int)
    
    if not month or not year:
        return jsonify({"error": "Month and year required"}), 400
        
    import calendar
    _, last_day = calendar.monthrange(year, month)
    start_date = datetime(year, month, 1).date()
    end_date = datetime(year, month, last_day).date()
    
    history = ProgressEntry.query.filter(
        ProgressEntry.user_id == user_id,
        ProgressEntry.date >= start_date,
        ProgressEntry.date <= end_date
    ).all()
    
    results = {}
    for entry in history:
        results[entry.date.day] = entry.completion_percentage
        
    return jsonify(results), 200

@api_bp.route('/progress', methods=['POST'])
@jwt_required()
def update_progress():
    user_id = int(get_jwt_identity())
    data = request.json
    today = datetime.utcnow().date()
    
    entry = ProgressEntry.query.filter_by(user_id=user_id, date=today).first()
    if not entry:
        return jsonify({"error": "No progress entry for today"}), 404
    
    old_score = entry.recovery_score
    
    if 'water' in data:
        entry.water_intake = max(0, data['water'])
    if 'sleep' in data:
        entry.sleep_hours = max(0, data['sleep'])
    if 'steps' in data:
        entry.steps = max(0, data['steps'])
    if 'mood' in data:
        entry.mood = data['mood']
    if 'mood_score' in data:
        entry.mood_score = data['mood_score']
    if 'diet_tasks' in data:
        entry.diet_tasks = json.dumps(data['diet_tasks'])
    if 'exercise_tasks' in data:
        entry.exercise_tasks = json.dumps(data['exercise_tasks'])
        
    db.session.commit()
    new_score = entry.recovery_score
    check_and_update_streak(user_id, old_score, new_score)
    user = User.query.get(user_id)

    return jsonify({
        "message": "Progress updated", 
        "recovery_score": new_score,
        "completion_percentage": entry.completion_percentage,
        "health_streak": user.health_streak if user else 0
    }), 200

@api_bp.route('/progress/metric', methods=['POST'])
@jwt_required()
def update_metric_value():
    user_id = int(get_jwt_identity())
    data = request.json
    field = data.get('field') # water, steps, sleep
    amount = data.get('amount', 0)
    is_increment = data.get('is_increment', True)
    
    today = datetime.utcnow().date()
    entry = ProgressEntry.query.filter_by(user_id=user_id, date=today).first()
    if not entry: return jsonify({"error": "No entry"}), 404
    
    old_score = entry.recovery_score

    if field == 'water':
        entry.water_intake = max(0, entry.water_intake + (amount if is_increment else -amount))
    elif field == 'steps':
        entry.steps = max(0, entry.steps + (amount if is_increment else -amount))
    elif field == 'sleep':
        entry.sleep_hours = max(0, entry.sleep_hours + (amount if is_increment else -amount))
    
    db.session.commit()
    
    # Check if this update pushed them to 100%
    new_score = entry.recovery_score
    check_and_update_streak(user_id, old_score, new_score)
    user = User.query.get(user_id)
    
    return jsonify({
        "message": "Metric updated",
        "recovery_score": new_score,
        "completion_percentage": entry.completion_percentage,
        "health_streak": user.health_streak if user else 0,
        "water": entry.water_intake,
        "steps": entry.steps,
        "sleep": entry.sleep_hours
    }), 200
            
    return jsonify({
        "status": "success",
        "value": getattr(entry, "water_intake" if field == "water" else "sleep_hours" if field == "sleep" else "steps"),
        "recovery_score": new_score,
        "just_completed": just_completed,
        "health_streak": User.query.get(user_id).health_streak
    }), 200

@api_bp.route('/ai/coach', methods=['GET'])
@jwt_required()
def get_coach_insights():
    user_id = get_jwt_identity()
    today = datetime.utcnow().date()
    entry = ProgressEntry.query.filter_by(user_id=user_id, date=today).first()
    
    if not entry:
        return jsonify({"insight": "Good morning! Let's start tracking your metrics today for personalized advice."}), 200
        
    from app.services.ai_service import generate_coach_insights
    progress_data = {
        "water_intake": entry.water_intake,
        "target_water": entry.target_water,
        "steps": entry.steps,
        "target_steps": entry.target_steps,
        "sleep_hours": entry.sleep_hours,
        "target_sleep": entry.target_sleep,
        "mood": entry.mood,
        "mood_score": entry.mood_score,
        "recovery_score": entry.recovery_score
    }
    
    insight = generate_coach_insights(progress_data)
    return jsonify({"insight": insight}), 200

@api_bp.route('/analytics/health', methods=['GET'])
@jwt_required()
def get_health_analytics():
    user_id = get_jwt_identity()
    from datetime import timedelta
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=13)
    
    records = ProgressEntry.query.filter(
        ProgressEntry.user_id == user_id,
        ProgressEntry.date >= start_date,
        ProgressEntry.date <= end_date
    ).order_by(ProgressEntry.date.asc()).all()
    
    # Fill in gaps if any days have no data
    history_map = {r.date: r for r in records}
    
    results = []
    for i in range(14):
        d = start_date + timedelta(days=i)
        r = history_map.get(d)
        results.append({
            "day": d.strftime('%b %d'),
            "water": r.water_intake if r else 0,
            "steps": r.steps if r else 0,
            "score": r.recovery_score if r else 0,
            "sleep": r.sleep_hours if r else 0,
            "nutrition": r.nutrition_score if r else 0,
            "mood": r.mood_score if r else 0
        })
        
    return jsonify(results), 200

@api_bp.route('/reminders', methods=['GET', 'POST'])
@jwt_required()
def handle_reminders():
    user_id = get_jwt_identity()
    if request.method == 'GET':
        reminders = Reminder.query.filter_by(user_id=user_id).all()
        return jsonify([{
            "id": r.id,
            "type": r.type,
            "message": r.message,
            "schedule": r.cron_schedule
        } for r in reminders]), 200
        
    if request.method == 'POST':
        data = request.json
        reminder = Reminder(
            user_id=user_id,
            type=data.get('type'),
            message=data.get('message'),
            cron_schedule=data.get('schedule')
        )
        db.session.add(reminder)
        db.session.commit()
        return jsonify({"message": "Reminder added", "id": reminder.id}), 201

@api_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    from app.models import User
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    return jsonify({
        "name": user.name,
        "email": user.email,
        "blood_group": user.blood_group,
        "weight": user.weight,
        "height": user.height,
        "bmi_value": user.bmi_value,
        "bmi_category": user.bmi_category,
        "age": user.age,
        "gender": user.gender,
        "medical_conditions": user.medical_conditions,
        "health_goals": user.health_goals,
        "lifestyle_preferences": user.lifestyle_preferences,
        "emergency_contact": user.emergency_contact
    }), 200

def calculate_bmi(weight, height_cm):
    if not weight or not height_cm:
        return None, None
    try:
        height_m = float(height_cm) / 100
        weight_kg = float(weight)
        if height_m <= 0: return None, None
        bmi = weight_kg / (height_m * height_m)
        category = "Normal"
        if bmi < 18.5:
            category = "Underweight"
        elif bmi < 25.0:
            category = "Normal"
        elif bmi < 30.0:
            category = "Overweight"
        else:
            category = "Obese"
        return round(bmi, 2), category
    except (ValueError, TypeError):
        return None, None

@api_bp.route('/profile', methods=['POST'])
@jwt_required()
def update_profile():
    from app.models import User
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    data = request.json
    if 'name' in data: user.name = data['name']
    if 'blood_group' in data: user.blood_group = data['blood_group']
    if 'weight' in data: user.weight = data.get('weight')
    if 'height' in data: user.height = data.get('height')
    if 'age' in data: user.age = data.get('age')
    if 'gender' in data: user.gender = data.get('gender')
    if 'medical_conditions' in data: user.medical_conditions = data.get('medical_conditions')
    if 'health_goals' in data: user.health_goals = data.get('health_goals')
    if 'lifestyle_preferences' in data: user.lifestyle_preferences = data.get('lifestyle_preferences')
    if 'emergency_contact' in data: user.emergency_contact = data.get('emergency_contact')
    
    # Recalculate BMI
    if user.weight and user.height:
        bmi_val, bmi_cat = calculate_bmi(user.weight, user.height)
        user.bmi_value = bmi_val
        user.bmi_category = bmi_cat
    
    db.session.commit()
    return jsonify({
        "message": "Profile updated", 
        "bmi_value": user.bmi_value,
        "bmi_category": user.bmi_category
    }), 200

# --- ADMIN ROUTES ---
# --- ADMIN ROUTES ---
@api_bp.route('/admin/stats', methods=['GET'])
@api_bp.route('/admin/dashboard', methods=['GET'])
@jwt_required()
def get_admin_dashboard_stats():
    from app.models import User, ChatHistory, RecoveryPlan, MedicalReport
    user_id = int(get_jwt_identity())
    admin = User.query.get(user_id)
    if not admin or not admin.is_admin:
        return jsonify({"error": "Admin access required"}), 403
        
    total_users = User.query.count()
    
    # Count unique users with activity today (Progress log OR Chat)
    from app.models import ProgressEntry, ChatHistory
    today = datetime.utcnow().date()
    start_of_day = datetime.combine(today, datetime.min.time())
    
    active_user_ids = set()
    # Users with health logs
    entries = db.session.query(ProgressEntry.user_id).filter(ProgressEntry.date == today).all()
    active_user_ids.update([e.user_id for e in entries])
    # Users with chats
    chats_today = db.session.query(ChatHistory.user_id).filter(ChatHistory.timestamp >= start_of_day).all()
    active_user_ids.update([c.user_id for c in chats_today])
    
    active_today = len(active_user_ids)
    
    total_chats = ChatHistory.query.count()
    total_plans = RecoveryPlan.query.count()
    total_reports = MedicalReport.query.count()
    
    # Simple daily active users for last 7 days
    from datetime import timedelta
    labels = []
    reg_values = []
    chat_values = []
    
    for i in range(6, -1, -1):
        d = datetime.utcnow().date() - timedelta(days=i)
        next_d = d + timedelta(days=1)
        
        # Registration Trend
        labels.append(d.strftime('%b %d'))
        reg_count = User.query.filter(User.created_at >= d, User.created_at < next_d).count()
        reg_values.append(reg_count)
        
        # Chat Trend
        chat_count = ChatHistory.query.filter(ChatHistory.timestamp >= d, ChatHistory.timestamp < next_d).count()
        chat_values.append(chat_count)
        
    return jsonify({
        "total_users": total_users,
        "active_today": active_today,
        "total_chats": total_chats,
        "total_plans": total_plans,
        "total_reports": total_reports,
        "trends": {
            "labels": labels,
            "registrations": reg_values,
            "chats": chat_values
        },
        "system_status": {
            "chatbot": "Online",
            "api": "Active",
            "database": "Healthy"
        }
    }), 200

@api_bp.route('/admin/users', methods=['GET'])
@jwt_required()
def get_admin_users():
    from app.models import User
    user_id = int(get_jwt_identity())
    admin = User.query.get(user_id)
    if not admin or not admin.is_admin: return jsonify({"error": "Unauthorized"}), 403
    
    users = User.query.all()
    return jsonify([{
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "age": u.age,
        "created_at": u.created_at.isoformat() if u.created_at else None,
        "is_admin": u.is_admin,
        "status": "Active" # Placeholder
    } for u in users]), 200

@api_bp.route('/admin/chats', methods=['GET'])
@jwt_required()
def get_admin_chats():
    from app.models import User, ChatHistory
    user_id = int(get_jwt_identity())
    admin = User.query.get(user_id)
    if not admin or not admin.is_admin: return jsonify({"error": "Unauthorized"}), 403
    
    # Optimized join to avoid N+1 queries
    chats = ChatHistory.query.options(db.joinedload(ChatHistory.user)).order_by(ChatHistory.timestamp.desc()).limit(100).all()
    return jsonify([{
        "id": c.id,
        "user_name": c.user.name if c.user else "Unknown User",
        "user_email": c.user.email if c.user else "N/A",
        "user_message": c.user_message,
        "bot_response": c.bot_response,
        "timestamp": c.timestamp.isoformat()
    } for c in chats]), 200

@api_bp.route('/admin/logs', methods=['GET'])
@jwt_required()
def get_admin_logs():
    from app.models import User, MedicalReport, ChatHistory
    user_id = int(get_jwt_identity())
    admin = User.query.get(user_id)
    if not admin or not admin.is_admin: return jsonify({"error": "Unauthorized"}), 403
    
    # Aggregated activity as "logs"
    logs = []
    # 1. New reports
    reports = MedicalReport.query.order_by(MedicalReport.upload_time.desc()).limit(20).all()
    for r in reports:
        logs.append({
            "id": f"rep_{r.id}",
            "level": "INFO",
            "message": f"Medical Report uploaded (ID: {r.id})",
            "time": r.upload_time.isoformat(),
            "user": r.user.name if r.user else "System"
        })
    
    # 2. Significant Chat events or just chats
    chats = ChatHistory.query.order_by(ChatHistory.timestamp.desc()).limit(20).all()
    for c in chats:
        logs.append({
            "id": f"chat_{c.id}",
            "level": "DEBUG",
            "message": f"User engaged with AI: {c.user_message[:30]}...",
            "time": c.timestamp.isoformat(),
            "user": c.user.name if c.user else "System"
        })
        
    logs.sort(key=lambda x: x['time'], reverse=True)
    return jsonify(logs[:50]), 200

@api_bp.route('/streak-calendar', methods=['GET'])
@jwt_required()
def get_streak_calendar():
    from app.models import ProgressEntry
    from datetime import datetime, timedelta
    user_id = get_jwt_identity()
    today = datetime.utcnow().date()
    calendar = []
    
    for i in range(27, -1, -1): # 4 weeks view
        d = today - timedelta(days=i)
        entry = ProgressEntry.query.filter_by(user_id=user_id, date=d).first()
        score = entry.recovery_score if entry else 0
        
        # State logic:
        # - completed: green
        # - missed: ash/gray (if date passed and score < 100)
        # - idle: default (future or current not yet 100)
        
        is_completed = score >= 100
        is_missed = not is_completed and d < today
        
        calendar.append({
            "date": d.isoformat(),
            "completed": is_completed,
            "missed": is_missed
        })
    return jsonify(calendar), 200

@api_bp.route('/admin/health-insights', methods=['GET'])
@jwt_required()
def get_admin_health_insights():
    from app.models import User, Diagnosis, DiseaseDetection
    from sqlalchemy import func
    
    # 1. Top Detected Conditions
    conditions = db.session.query(
        DiseaseDetection.disease_name, 
        func.count(DiseaseDetection.id).label('count')
    ).group_by(DiseaseDetection.disease_name).order_by(func.count(DiseaseDetection.id).desc()).limit(5).all()
    
    # 2. Top Health Goals
    goals_raw = db.session.query(User.health_goals).filter(User.health_goals.isnot(None)).all()
    goals_count = {}
    for g in goals_raw:
        if g[0]:
            parts = [p.strip() for p in g[0].split(',')]
            for p in parts: goals_count[p] = goals_count.get(p, 0) + 1
    
    top_goals = sorted([{"name": k, "count": v} for k, v in goals_count.items()], key=lambda x: x['count'], reverse=True)[:5]

    return jsonify({
        "conditions": [{"name": c[0], "count": c[1]} for c in conditions],
        "goals": top_goals,
        "total_reports": db.session.query(func.count(DiseaseDetection.id)).scalar() or 0
    }), 200

@api_bp.route('/admin/analytics/activity-heatmap', methods=['GET'])
@jwt_required()
def get_admin_activity_heatmap():
    from app.models import ProgressEntry
    from sqlalchemy import func
    from datetime import datetime, timedelta
    
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=30)
    
    # Get counts of activities (chats, reports, plans) per day?
    # Or just progress entries. Let's use ProgressEntries as "activity".
    activities = db.session.query(
        ProgressEntry.date,
        func.count(ProgressEntry.id).label('count')
    ).filter(ProgressEntry.date >= start_date).group_by(ProgressEntry.date).all()
    
    heatmap_data = []
    curr = start_date
    while curr <= end_date:
        match = next((a for a in activities if a[0] == curr), None)
        heatmap_data.append({
            "date": curr.isoformat(),
            "count": match[1] if match else 0
        })
        curr += timedelta(days=1)
        
    return jsonify(heatmap_data), 200

@api_bp.route('/admin/feedbacks', methods=['GET'])
@jwt_required()
def get_admin_feedbacks():
    from app.models import User, Feedback
    user_id = int(get_jwt_identity())
    admin = User.query.get(user_id)
    if not admin or not admin.is_admin: return jsonify({"error": "Admin access required"}), 403
    
    feedbacks = Feedback.query.order_by(Feedback.created_at.desc()).all()
    return jsonify([{
        "id": f.id,
        "user_name": f.user_rel.name,
        "message": f.message,
        "rating": f.rating,
        "date": f.created_at.isoformat()
    } for f in feedbacks]), 200

@api_bp.route('/admin/settings', methods=['GET', 'POST'])
@jwt_required()
def admin_settings():
    from app.models import User, SystemConfig
    user_id = int(get_jwt_identity())
    admin = User.query.get(user_id)
    if not admin or not admin.is_admin: return jsonify({"error": "Unauthorized"}), 403
    
    if request.method == 'GET':
        configs = SystemConfig.query.all()
        return jsonify({c.key: c.value for c in configs}), 200
    
    data = request.json
    for key, value in data.items():
        conf = SystemConfig.query.get(key)
        if conf:
            conf.value = value
        else:
            db.session.add(SystemConfig(key=key, value=value))
    
    db.session.commit()
    return jsonify({"message": "Settings updated"}), 200

@api_bp.route('/admin/danger-zone/clear-logs', methods=['POST'])
@jwt_required()
def clear_logs():
    user_id = int(get_jwt_identity())
    admin = User.query.get(user_id)
    if not admin or not admin.is_admin: return jsonify({"error": "Unauthorized"}), 403
    
    from app.models import ChatHistory
    ChatHistory.query.delete() # Clear internal chat history/logs
    db.session.commit()
    return jsonify({"message": "System logs cleared successfully"}), 200

@api_bp.route('/admin/danger-zone/reset-analytics', methods=['POST'])
@jwt_required()
def reset_analytics():
    user_id = int(get_jwt_identity())
    admin = User.query.get(user_id)
    if not admin or not admin.is_admin: return jsonify({"error": "Unauthorized"}), 403
    
    from app.models import ProgressEntry
    # Instead of deleting, we reset scores to 0 for a fresh start or reset targets
    ProgressEntry.query.update({ProgressEntry.water_intake: 0, ProgressEntry.steps: 0, ProgressEntry.sleep_hours: 0, ProgressEntry.nutrition_score: 0})
    db.session.commit()
    return jsonify({"message": "System analytics reset successfully"}), 200

@api_bp.route('/admin/danger-zone/remove-users', methods=['POST'])
@jwt_required()
def remove_inactive_users():
    user_id = int(get_jwt_identity())
    admin = User.query.get(user_id)
    if not admin or not admin.is_admin: return jsonify({"error": "Unauthorized"}), 403
    
    # Logic to remove users with 0 interactions (no reports, no logs)
    from app.models import User, MedicalReport, FoodLog
    users_to_check = User.query.filter_by(is_admin=False).all()
    removed_count = 0
    for u in users_to_check:
        has_reports = MedicalReport.query.filter_by(user_id=u.id).first()
        has_logs = FoodLog.query.filter_by(user_id=u.id).first()
        if not has_reports and not has_logs:
            db.session.delete(u)
            removed_count += 1
    
    db.session.commit()
    return jsonify({"message": f"Purged {removed_count} inactive dormant users."}), 200

@api_bp.route('/admin/danger-zone/reset-chat', methods=['POST'])
@jwt_required()
def reset_chat_memory():
    user_id = int(get_jwt_identity())
    admin = User.query.get(user_id)
    if not admin or not admin.is_admin: return jsonify({"error": "Unauthorized"}), 403
    
    from app.models import ChatHistory
    ChatHistory.query.delete() # Full memory wipe
    db.session.commit()
    return jsonify({"message": "Chatbot memory reset successfully"}), 200

@api_bp.route('/food/logs', methods=['GET'])
@jwt_required()
def get_food_logs():
    from app.models import FoodLog
    user_id = get_jwt_identity()
    logs = FoodLog.query.filter_by(user_id=user_id).order_by(FoodLog.timestamp.desc()).limit(20).all()
    return jsonify([{
        "id": l.id,
        "food_item": l.food_item,
        "category": l.category,
        "timestamp": l.timestamp.isoformat(),
        "is_healthy": l.is_healthy
    } for l in logs]), 200

@api_bp.route('/food/log', methods=['POST'])
@jwt_required()
def log_food_item():
    from app.models import FoodLog, ProgressEntry, User
    user_id = get_jwt_identity()
    data = request.json
    food_item = data.get('food_item')
    if not food_item:
        return jsonify({"error": "Food item required"}), 400
    
    new_log = FoodLog(
        user_id=user_id,
        food_item=food_item,
        category=data.get('category', 'Healthy Choice'),
        is_healthy=data.get('is_healthy', True),
        is_suggestion=data.get('is_suggestion', False)
    )
    db.session.add(new_log)
    
    # Update nutrition score
    today = datetime.utcnow().date()
    progress = ProgressEntry.query.filter_by(user_id=user_id, date=today).first()
    if progress:
        old_score = progress.recovery_score
        # Healthy items give substantial boosts to the nutrition factor
        bonus = 25 if data.get('is_suggestion') or data.get('is_healthy') else 10
        progress.nutrition_score = min(100, progress.nutrition_score + bonus)
        db.session.commit()
        
        # Streak increment & Status updates
        from app.routes.api import check_and_update_streak
        check_and_update_streak(user_id, old_score, progress.recovery_score)
            
    db.session.commit()
    return jsonify({"message": "Logged successfully", "id": new_log.id}), 201

# --- RECOVERY PLAN & TASK MANAGEMENT ---
@api_bp.route('/tasks/toggle', methods=['POST'])
@jwt_required()
def toggle_task():
    user_id = get_jwt_identity()
    data = request.json
    task_id = data.get('task_id')
    task_type = data.get('type') # 'diet' or 'exercise'
    
    today = datetime.utcnow().date()
    entry = ProgressEntry.query.filter_by(user_id=user_id, date=today).first()
    if not entry:
        return jsonify({"error": "No entry for today"}), 404
        
    import json
    tasks = json.loads(entry.diet_tasks if task_type == 'diet' else entry.exercise_tasks)
    
    for t in tasks:
        if t.get('id') == task_id or t.get('task') == task_id:
            t['completed'] = not t.get('completed', False)
            break
            
    if task_type == 'diet':
        entry.diet_tasks = json.dumps(tasks)
    else:
        entry.exercise_tasks = json.dumps(tasks)
    
    old_score = entry.recovery_score
    db.session.commit()
    new_score = entry.recovery_score
    
    # Streak Logic for tasks
    check_and_update_streak(user_id, old_score, new_score)
        
    return jsonify({
        "message": "Task toggled",
        "recovery_score": new_score,
        "tasks": tasks,
        "health_streak": User.query.get(user_id).health_streak if User.query.get(user_id) else 0
    }), 200

@api_bp.route('/plan/save', methods=['POST'])
@jwt_required()
def save_custom_plan():
    user_id = get_jwt_identity()
    data = request.json
    
    import json
    new_plan = RecoveryPlan(
        user_id=user_id,
        veg_diet=json.dumps(data.get('veg_diet', data.get('diet_plan', []))),
        non_veg_diet=json.dumps(data.get('non_veg_diet', data.get('diet_plan', []))),
        exercise_plan=json.dumps(data.get('exercise_plan', [])),
        dos=data.get('dos', ''),
        donts=data.get('donts', ''),
        natural_remedies=json.dumps(data.get('natural_remedies', []))
    )
    db.session.add(new_plan)
    db.session.commit()
    
    # Also update today's progress tasks
    today = datetime.utcnow().date()
    entry = ProgressEntry.query.filter_by(user_id=user_id, date=today).first()
    if entry:
        entry.plan_id = new_plan.id
        # Pick one for today's checklist
        user = User.query.get(user_id)
        if user.lifestyle_preferences == 'Non-Vegetarian':
            entry.diet_tasks = new_plan.non_veg_diet
        else:
            entry.diet_tasks = new_plan.veg_diet
        entry.exercise_tasks = new_plan.exercise_plan
        db.session.commit()
        
    return jsonify({"message": "Recovery plan saved", "id": new_plan.id}), 201

# --- WEEKLY SUMMARY ---
@api_bp.route('/weekly-summary', methods=['GET'])
@jwt_required()
def get_weekly_summary_report():
    from app.models import ProgressEntry, User
    from app.services.ai_service import generate_weekly_summary
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    from datetime import timedelta
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=6)
    
    history = ProgressEntry.query.filter(
        ProgressEntry.user_id == user_id,
        ProgressEntry.date >= start_date
    ).all()
    
    history_data = [{
        "date": r.date.isoformat(),
        "score": r.recovery_score,
        "steps": r.steps,
        "water": r.water_intake
    } for r in history]
    
    summary = generate_weekly_summary(history_data, {
        "medical_conditions": user.medical_conditions,
        "lifestyle_preferences": user.lifestyle_preferences
    })
    
    return jsonify({"summary": summary}), 200

# --- FEEDBACK SYSTEM ---
@api_bp.route('/feedback', methods=['POST'])
@jwt_required()
def submit_feedback():
    user_id = get_jwt_identity()
    data = request.json
    if not data or 'message' not in data:
        return jsonify({"error": "Message required"}), 400
        
    from app.models import Feedback
    fb = Feedback(
        user_id=user_id,
        message=data.get('message'),
        rating=data.get('rating', 5)
    )
    db.session.add(fb)
    db.session.commit()
    return jsonify({"message": "Thank you! Your feedback has been submitted."}), 201

@api_bp.route('/health-timeline', methods=['GET'])
@jwt_required()
def get_health_timeline():
    user_id = int(get_jwt_identity())
    from app.models import MedicalReport, Diagnosis
    timeline = []
    
    # Add Reports
    reports = MedicalReport.query.filter_by(user_id=user_id).all()
    for r in reports:
        timeline.append({
            "id": f"rep_{r.id}",
            "type": "report",
            "title": f"Medical Report #{r.id} Analyzed",
            "date": r.upload_time.isoformat(),
            "description": r.summary[:150] + "..." if r.summary and len(r.summary) > 150 else r.summary or "Medical report successfully decoded and analyzed by WellBot AI.",
            "icon": "report"
        })
        
    # Add Diagnoses
    diagnoses = Diagnosis.query.filter_by(user_id=user_id).all()
    for d in diagnoses:
        timeline.append({
            "id": f"diag_{d.id}",
            "type": "health",
            "title": f"New Diagnosis: {d.name}",
            "date": d.diagnosed_date.isoformat(),
            "description": f"Condition status is {d.status} with {d.severity} severity. Primary medication/care: {d.medication or 'None specified'}.",
            "icon": "health"
        })
        
    # Add Milestone: Streak
    user = User.query.get(user_id)
    if user.health_streak > 0:
        timeline.append({
            "id": "streak_milestone",
            "type": "star",
            "title": f"{user.health_streak} Day Health Streak!",
            "date": datetime.utcnow().date().isoformat(),
            "description": f"Unstoppable! You have maintained a consistent recovery protocol for {user.health_streak} days straight.",
            "icon": "star"
        })
        
    timeline.sort(key=lambda x: x['date'], reverse=True)
    # Add initial join if empty or as first event
    if user:
         timeline.append({
            "id": "join_event",
            "type": "joined",
            "title": "Welcome to WellBot",
            "date": user.created_at.date().isoformat(),
            "description": "Your AI-powered recovery and health optimization journey began here.",
            "icon": "star"
        })

    return jsonify(timeline), 200
