from flask import Blueprint, request, jsonify
from app import db
from app.models import ChatHistory, User
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.ai_service import generate_chat_response

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('', methods=['POST'])
@jwt_required()
def chat():
    user_id = get_jwt_identity()
    data = request.json
    user_message = data.get('message')
    
    if not user_message:
        return jsonify({"error": "Message required"}), 400
        
    # Get history
    history_records = ChatHistory.query.filter_by(user_id=user_id).order_by(ChatHistory.timestamp.asc()).limit(10).all()
    history = []
    for r in history_records:
        history.append({"role": "user", "content": r.user_message})
        history.append({"role": "assistant", "content": r.bot_response})
        
    # Call AI Symptom Analyzer
    from app.services.ai_service import extract_symptoms, generate_chat_response, analyze_report_and_generate_plan
    symptoms = extract_symptoms(user_message)
    user_info = User.query.get(user_id)
    
    user_profile = {
        "age": user_info.age, 
        "weight": user_info.weight, 
        "height": user_info.height,
        "bmi_value": user_info.bmi_value,
        "bmi_category": user_info.bmi_category,
        "lifestyle_preferences": user_info.lifestyle_preferences,
        "medical_conditions": user_info.medical_conditions, 
        "health_goals": user_info.health_goals
    }

    context_prefix = ""
    suggested_plan = None
    
    if symptoms:
        context_prefix = f"[SYMPTOM ANALYZER: User reported symptoms: {symptoms}. Provide possible causes and WHO guideline recommendations first, then answer.] "
        
        # If symptoms are significant, generate a potential recovery plan
        suggested_plan = analyze_report_and_generate_plan(f"User symptoms: {symptoms}. Message: {user_message}", user_profile)
        
    bot_response = generate_chat_response(history, context_prefix + user_message, user_profile)
    
    # Save to DB
    record = ChatHistory(
        user_id=user_id,
        user_message=user_message,
        bot_response=bot_response
    )
    db.session.add(record)
    db.session.commit()
    
    return jsonify({
        "response": bot_response,
        "suggested_plan": suggested_plan
    }), 200

@chat_bp.route('/upload', methods=['POST'])
@jwt_required()
def chat_with_upload():
    user_id = get_jwt_identity()
    
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    user_message = request.form.get('message', 'Analyze this report')
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    from werkzeug.utils import secure_filename
    import os
    from flask import current_app
    
    filename = secure_filename(file.filename)
    upload_folder = os.path.join(current_app.root_path, 'uploads')
    os.makedirs(upload_folder, exist_ok=True)
    file_path = os.path.join(upload_folder, filename)
    file.save(file_path)
    
    # Process file
    from app.services.ocr_service import extract_text
    from app.services.ai_service import generate_chat_response, analyze_report_and_generate_plan
    from app.models import RecoveryPlan, User
    import json
    
    ocr_text = extract_text(file_path)
    user = User.query.get(user_id)
    user_profile = {
        "age": user.age, "weight": user.weight, "height": user.height,
        "bmi_value": user.bmi_value,
        "bmi_category": user.bmi_category,
        "lifestyle_preferences": user.lifestyle_preferences,
        "medical_conditions": user.medical_conditions, "health_goals": user.health_goals
    }
    
    # Contextual message
    context_message = f"User uploaded a medical report. Content: {ocr_text[:2000]}... User says: {user_message}"
    
    # Get history
    history_records = ChatHistory.query.filter_by(user_id=user_id).order_by(ChatHistory.timestamp.asc()).limit(5).all()
    history = []
    for r in history_records:
        history.append({"role": "user", "content": r.user_message})
        history.append({"role": "assistant", "content": r.bot_response})
        
    bot_response = generate_chat_response(history, context_message, user_profile)
    
    # Save to Chat History
    record = ChatHistory(
        user_id=user_id,
        user_message=f"[Report: {filename}] {user_message}",
        bot_response=bot_response
    )
    db.session.add(record)
    
    # Generate Recovery Plan
    plan_data = analyze_report_and_generate_plan(ocr_text, user_profile)
    
    # Update User Profile Context so Dashboard can see it too
    analysis_summary = plan_data.get('summary', '')
    if analysis_summary:
        # Keep it clean, append the new summary to existing conditions
        if not user.medical_conditions:
            user.medical_conditions = f"Clinical Discovery: {analysis_summary}"
        elif analysis_summary not in user.medical_conditions:
            user.medical_conditions += f"\nRecent Clinical Note: {analysis_summary}"

    new_plan = RecoveryPlan(
        user_id=user_id,
        veg_diet=json.dumps(plan_data.get('veg_diet', [])),
        non_veg_diet=json.dumps(plan_data.get('non_veg_diet', [])),
        exercise_plan=json.dumps(plan_data.get('exercise_plan', [])),
        dos=plan_data.get('dos', ''),
        donts=plan_data.get('donts', ''),
        natural_remedies=json.dumps(plan_data.get('natural_remedies', []))
    )
    db.session.add(new_plan)
    db.session.commit()
    
    return jsonify({"response": bot_response}), 200

@chat_bp.route('/history', methods=['GET'])
@jwt_required()
def get_chat_history():
    user_id = get_jwt_identity()
    records = ChatHistory.query.filter_by(user_id=user_id).order_by(ChatHistory.timestamp.asc()).all()
    history = []
    for r in records:
        history.append({
            "id": r.id,
            "timestamp": r.timestamp.isoformat(),
            "user": r.user_message,
            "bot": r.bot_response
        })
    return jsonify(history), 200


@chat_bp.route('/analytics', methods=['GET'])
@jwt_required()
def get_chat_analytics():
    """
    Returns dashboard analytics:
    1. interaction_frequency – messages per day (last 14 days)
    2. sentiment_breakdown   – Positive / Neutral / Negative counts
    """
    user_id = get_jwt_identity()
    from datetime import timedelta, date as dt_date

    records = ChatHistory.query.filter_by(user_id=user_id).order_by(ChatHistory.timestamp.asc()).all()

    # ── 1. Daily interaction frequency ────────────────────────────────────
    today = dt_date.today()
    freq_map = {}
    for i in range(13, -1, -1):
        d = today - timedelta(days=i)
        freq_map[d.strftime('%b %d')] = 0

    for r in records:
        day_key = r.timestamp.strftime('%b %d')
        if day_key in freq_map:
            freq_map[day_key] += 1

    interaction_frequency = [{"day": k, "messages": v} for k, v in freq_map.items()]

    # ── 2. Sentiment (lightweight keyword approach) ────────────────────────
    POSITIVE_WORDS = {
        "better","good","great","well","improved","healthy","relieved","fine",
        "excellent","recovered","comfortable","normal","okay","ok","thank",
        "thanks","helpful","nice","perfect","strong","energetic","happy"
    }
    NEGATIVE_WORDS = {
        "pain","hurt","worse","bad","severe","terrible","awful","sick","ill",
        "dizzy","fever","ache","vomit","nausea","weak","tired","exhausted",
        "anxious","depressed","scared","worried","chronic","unbearable",
        "bleeding","emergency"
    }

    positive = neutral = negative = 0
    for r in records:
        text = r.user_message.lower()
        pos = any(w in text for w in POSITIVE_WORDS)
        neg = any(w in text for w in NEGATIVE_WORDS)
        if pos and not neg:
            positive += 1
        elif neg and not pos:
            negative += 1
        else:
            neutral += 1

    # Demo data when no real history exists
    if not records:
        interaction_frequency = [
            {"day": (today - timedelta(days=13-i)).strftime('%b %d'), "messages": v}
            for i, v in enumerate([3,0,5,2,4,1,7,0,3,6,2,4,1,5])
        ]
        positive, neutral, negative = 12, 8, 4

    return jsonify({
        "interaction_frequency": interaction_frequency,
        "sentiment_breakdown": [
            {"name": "Positive", "value": positive, "color": "#10b981"},
            {"name": "Neutral",  "value": neutral,  "color": "#6366f1"},
            {"name": "Negative", "value": negative, "color": "#ef4444"},
        ],
        "total_messages": len(records)
    }), 200
