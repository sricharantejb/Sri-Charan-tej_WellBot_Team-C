import os
import re
import requests
import json
from flask import current_app

# ---------------------------------------------------------------------------
# Health Topic Restriction — v2 (smarter, multi-language aware)
# ---------------------------------------------------------------------------

# ── Core health keywords (English) ──────────────────────────────────────────
HEALTH_KEYWORDS = {
    # Symptoms & body
    "pain", "ache", "fever", "cough", "cold", "flu", "headache", "migraine",
    "nausea", "vomit", "diarrhea", "diarrhoea", "fatigue", "weakness",
    "dizzy", "dizziness", "rash", "swelling", "bleed", "bleeding", "bruise",
    "wound", "injury", "fracture", "sprain", "strain",
    "breath", "breathless", "chest pain", "palpitation", "pulse",
    "blood pressure", "bp", "hypertension", "hypotension",
    "diabetes", "insulin", "thyroid", "anemia", "anaemia", "infection",
    "allergy", "allergic", "asthma", "cancer", "tumour", "tumor",
    "stroke", "seizure", "epilepsy", "paralysis",
    "anxiety", "depression", "mental health", "stress", "insomnia", "sleep",
    "back pain", "spine", "joint", "arthritis", "bone", "muscle", "cramp",
    "stomach", "abdomen", "digestion", "constipation", "bloating",
    "kidney", "liver", "lungs", "pancreas", "gallbladder", "appendix",
    "skin", "eye", "ear", "nose", "throat", "dental", "tooth", "teeth", "gum",
    "pregnancy", "prenatal", "postnatal", "period", "menstrual", "menopause",
    "fertility", "reproductive", "sti", "std", "hiv", "aids",
    "weight", "obesity", "bmi", "overweight", "underweight",
    "nutrition", "diet", "calorie", "protein", "carb", "fat", "fibre", "fiber",
    "vitamin", "mineral", "supplement", "hydration", "dehydration",
    "heart", "cardiac", "artery", "vein", "clot",

    # Medical / clinical
    "symptom", "symptoms", "diagnosis", "diagnose", "treatment", "therapy",
    "medicine", "medication", "drug", "tablet", "capsule", "prescription",
    "dose", "dosage", "side effect", "overdose",
    "doctor", "physician", "specialist", "nurse", "hospital", "clinic",
    "emergency", "ambulance", "icu", "ot", "surgery", "operation",
    "vaccine", "vaccination", "immunization",
    "blood test", "x-ray", "mri", "ct scan", "ultrasound", "ecg", "eeg",
    "echocardiogram", "endoscopy", "biopsy", "pathology",
    "cholesterol", "triglycerides", "hemoglobin", "haemoglobin",
    "platelet", "wbc", "rbc", "glucose", "urine", "urine test",
    "medical report", "lab report", "health report",

    # Wellness & lifestyle
    "exercise", "workout", "fitness", "walk", "run", "jog", "yoga",
    "meditation", "mindfulness", "breathing exercise",
    "recovery", "rehabilitation", "physiotherapy", "physio",
    "posture", "stretching", "flexibility",
    "health", "healthy", "wellness", "wellbeing", "immune", "immunity",
    "first aid", "cpr", "prevention", "hygiene", "sanitize", "sanitiser",

    # WellBot specific
    "wellbot", "reminder", "recovery plan", "health plan",
}


# ---------------------------------------------------------------------------
# Dietary Database — Curated nutrition for BMI-based recovery
# ---------------------------------------------------------------------------

DIETARY_DATABASE = {
    "WEIGHT_LOSS": {
        "veg": [
            "Oats with fruits – high fiber, keeps you full",
            "Vegetable salads – cucumber, carrot, cabbage, tomato",
            "Moong dal / lentil soup – high protein, low fat",
            "Greek yogurt / curd – protein + probiotics",
            "Paneer (low-fat) – good protein for muscle maintenance",
            "Sprouts (moong, chana) – nutrient dense and light",
            "Millets (ragi, jowar, bajra) – slow digestion, steady energy",
            "Green smoothies – spinach + apple + chia seeds"
        ],
        "non_veg": [
            "Boiled eggs – high protein, low calories",
            "Grilled chicken breast – lean protein",
            "Fish (steamed or grilled) – healthy fats + protein",
            "Chicken soup – light and filling",
            "Tuna salad – high protein, low carb"
        ],
        "rule": "High protein + high fiber + low calorie foods"
    },
    "WEIGHT_GAIN": {
        "veg": [
            "Peanut butter + whole wheat bread – calorie dense",
            "Banana milkshake – carbs + calories",
            "Paneer curry – high protein and fats",
            "Rice with dal and ghee – energy rich",
            "Dry fruits (almonds, cashews, raisins) – healthy fats",
            "Avocado toast – healthy fat calories",
            "Potatoes / sweet potatoes – carb rich",
            "Protein smoothies – milk + oats + banana + nuts"
        ],
        "non_veg": [
            "Egg omelette with cheese – protein + fats",
            "Chicken curry with rice – calorie dense",
            "Salmon or fatty fish – omega-3 + calories",
            "Beef or mutton dishes – high protein and fat",
            "Chicken sandwiches with mayo – higher calorie meals"
        ],
        "rule": "Calorie dense + protein rich foods"
    }
}


# ── Hindi health keywords (Devanagari) ──────────────────────────────────────
HINDI_HEALTH_KEYWORDS = {
    "दर्द", "बुखार", "खांसी", "सर्दी", "सिरदर्द", "मतली", "उल्टी",
    "थकान", "कमजोरी", "चक्कर", "सूजन", "रक्त", "घाव", "चोट",
    "सांस", "छाती", "दिल", "दिल का दौरा", "हृदय", "रक्तचाप",
    "मधुमेह", "शुगर", "इंसुलिन", "थायरॉयड", "एनीमिया", "संक्रमण",
    "एलर्जी", "अस्थमा", "कैंसर", "दौरा",
    "चिंता", "अवसाद", "मानसिक", "तनाव", "नींद",
    "पेट", "पाचन", "कब्ज", "किडनी", "लीवर", "फेफड़े",
    "त्वचा", "आंख", "कान", "नाक", "गला", "दांत",
    "गर्भावस्था", "मासिक धर्म", "वजन", "मोटापा",
    "पोषण", "आहार", "कैलोरी", "प्रोटीन", "विटामिन",
    "लक्षण", "इलाज", "दवा", "गोली", "डॉक्टर", "अस्पताल",
    "टीका", "ब्लड टेस्ट", "एक्स-रे", "कोलेस्ट्रॉल",
    "व्यायाम", "योग", "ध्यान", "स्वास्थ्य", "स्वस्थ",
}

# ── Telugu health keywords ────────────────────────────────────────────────────
TELUGU_HEALTH_KEYWORDS = {
    "నొప్పి", "జ్వరం", "దగ్గు", "జలుబు", "తలనొప్పి", "వాంతి",
    "అలసట", "బలహీనత", "తిరుగుళ్ళు", "వాపు", "రక్తం", "గాయం",
    "శ్వాస", "ఛాతీ", "హృదయం", "రక్తపోటు",
    "మధుమేహం", "చక్కెర", "ఇన్సులిన్", "థైరాయిడ్", "రక్తహీనత", "ఇన్ఫెక్షన్",
    "అలర్జీ", "ఆస్తమా", "క్యాన్సర్",
    "ఆందోళన", "నిరాశ", "మానసిక", "ఒత్తిడి", "నిద్ర",
    "కడుపు", "జీర్ణం", "మలబద్ధం", "మూత్రపిండాలు", "కాలేయం", "ఊపిరితిత్తులు",
    "చర్మం", "కళ్ళు", "చెవి", "ముక్కు", "గొంతు", "దంతాలు",
    "గర్భం", "ఋతుచక్రం", "బరువు", "స్థూలకాయం",
    "పోషణ", "ఆహారం", "కేలరీలు", "ప్రోటీన్", "విటమిన్",
    "లక్షణాలు", "చికిత్స", "మందు", "మాత్ర", "డాక్టర్", "ఆసుపత్రి",
    "టీకా", "రక్త పరీక్ష", "కొలెస్ట్రాల్",
    "వ్యాయామం", "యోగా", "ధ్యానం", "ఆరోగ్యం",
}

# ── Patterns for clearly off-topic content ──────────────────────────────────
# NOTE: We use negative-lookahead to avoid blocking health contexts.
# E.g. "blood sugar LEVEL" is health, "sugar cake recipe" is food.
OFF_TOPIC_STRICT_PATTERNS = [
    # Coding / tech (only block pure programming questions)
    r"\b(write\s+(a\s+)?(code|program|script|function|class)|coding\s+interview|software\s+engineer(ing)?|algorithm\s+problem|debug\s+(the\s+)?code|pull\s+request|git\s+commit|stack\s+overflow|api\s+endpoint)\b",
    # Pure politics
    r"\b(election\s+result|vote\s+for|political\s+party|government\s+policy|parliament\s+session|president\s+speech|prime\s+minister\s+statement)\b",
    # Pure finance
    r"\b(stock\s+price|share\s+market|crypto\s+currency|bitcoin\s+price|nft\s+mint|mutual\s+fund\s+return|tax\s+filing|loan\s+interest)\b",
    # Entertainment
    r"\b(hollywood|bollywood|box\s+office|movie\s+review|film\s+trailer|actor\s+net\s+worth|celebrity\s+gossip|music\s+album|song\s+lyrics|gaming\s+tips?|esport)\b",
    # Sports scores (not health)
    r"\b(match\s+score|cricket\s+score|football\s+score|ipl\s+score|world\s+cup\s+score|sports?\s+news)\b",
    # Pure travel/food (recipe and cooking, not nutrition advice)
    r"\b(hotel\s+booking|flight\s+ticket|visa\s+application|travel\s+itinerary|recipe\s+for|how\s+to\s+(bake|cook)\s+\w+|restaurant\s+review)\b",
    # Geography / general knowledge
    r"\b(capital\s+of|population\s+of|history\s+of|geography|longest\s+river|tallest\s+mountain|world\s+war|ancient\s+civilization)\b",
    # Math / pure science (not medical science)
    r"\b(solve\s+(this\s+)?equation|calculus|algebra|trigonometry|physics\s+formula|chemistry\s+formula|periodic\s+table)\b",
]

# ── Greetings / short messages — always allowed ──────────────────────────────
GREETING_WORDS = {
    "hi", "hello", "hey", "thanks", "thank you", "ok", "okay", "bye",
    "yes", "no", "please", "help", "good morning", "good evening",
    "namaste", "నమస్కారం", "నమస్కారం", "నమస్తే", "నమస్కారమ్",
    "నమస్కారం", "ధన్యవాదాలు", "అవును", "కాదు",
    "नमस्ते", "धन्यवाद", "हाँ", "नहीं", "ठीक है",
}

# ── Off-topic response message ───────────────────────────────────────────────
OFF_TOPIC_RESPONSE = (
    "🏥 I'm WellBot — a dedicated AI Health Assistant.\n\n"
    "I specialize **only** in health-related topics such as:\n"
    "• 🤒 Symptoms & illnesses\n"
    "• 💊 Medications & treatments\n"
    "• 🥗 Diet, nutrition & fitness\n"
    "• 🧠 Mental health & wellness\n"
    "• 📋 Medical reports & recovery plans\n"
    "• 🩺 First aid & emergency guidance\n\n"
    "I'm unable to assist with non-health topics.\n"
    "Please ask me a health-related question and I'll be happy to help! 😊"
)


def is_health_related(message: str) -> bool:
    """
    Returns True if the message is health-related or benign.
    Returns False only if clearly off-topic (non-health).

    Logic:
    1. Always allow greetings / very short messages.
    2. Check Hindi & Telugu health keywords → ALLOW immediately.
    3. Check English health keywords → ALLOW if present.
    4. Check strict off-topic patterns → BLOCK if matched.
    5. Default → ALLOW (Gemini system prompt acts as the final gate).
    """
    text = message.strip()
    text_lower = text.lower()
    words = text_lower.split()

    # ── Rule 1: Short / greeting messages ───────────────────────────────────
    if len(words) <= 3:
        return True
    if any(g in text_lower for g in GREETING_WORDS):
        return True

    # ── Rule 2: Telugu health keywords ─────────────────────────────────────
    for kw in TELUGU_HEALTH_KEYWORDS:
        if kw in text:
            return True

    # ── Rule 3: Hindi health keywords ─────────────────────────────────────
    for kw in HINDI_HEALTH_KEYWORDS:
        if kw in text:
            return True

    # ── Rule 4: English health keywords ───────────────────────────────────
    for kw in HEALTH_KEYWORDS:
        if kw in text_lower:
            return True

    # ── Rule 5: Strict off-topic pattern check ─────────────────────────────
    for pattern in OFF_TOPIC_STRICT_PATTERNS:
        if re.search(pattern, text_lower, re.IGNORECASE):
            return False

    # ── Rule 6: Default allow (Gemini guardrails will protect further) ──────
    return True


# ---------------------------------------------------------------------------
# Gemini API
# ---------------------------------------------------------------------------

def get_ai_response(prompt, is_json=False):
    """Unified AI handler using direct HTTP for all tiers to avoid library bugs."""
    from app.models import SystemConfig
    
    # Tier 1: OpenRouter (User prioritized)
    try:
        or_key = os.environ.get('OPENROUTER_API_KEY')
        if or_key and "sk-or-" in or_key:
            import requests
            url = "https://openrouter.ai/api/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {or_key}",
                "Content-Type": "application/json",
                "X-Title": "WellBot Health Assistant"
            }
            payload = {
                "model": "deepseek/deepseek-chat",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 1500 if is_json else 800
            }
            if is_json:
                payload["response_format"] = {"type": "json_object"}

            resp = requests.post(url, headers=headers, json=payload, timeout=25)
            if resp.status_code == 200:
                data = resp.json()
                if 'choices' in data and data['choices']:
                    return data['choices'][0]['message']['content']
            else:
                print(f"OpenRouter Error {resp.status_code}: {resp.text}")
    except Exception as e:
        print(f"OpenRouter Exception: {e}")

    # Tier 2: OpenAI (Direct REST)
    try:
        openai_cfg = SystemConfig.query.get('openai_key') or SystemConfig.query.get('open_api_key')
        openai_key = openai_cfg.value if openai_cfg and openai_cfg.value else os.environ.get('OPENAI_API_KEY')
        
        if openai_key and len(openai_key) > 20:
            import requests
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {openai_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "gpt-4o-mini" if is_json else "gpt-4o",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 1000
            }
            if is_json:
                payload["response_format"] = {"type": "json_object"}

            resp = requests.post(url, headers=headers, json=payload, timeout=20)
            if resp.status_code == 200:
                data = resp.json()
                if 'choices' in data and data['choices']:
                    return data['choices'][0]['message']['content']
            else:
                print(f"OpenAI REST Error {resp.status_code}: {resp.text}")
    except Exception as e:
        print(f"OpenAI Exception: {e}")

    # Tier 3: Gemini Fallback
    return get_gemini_response(prompt)

def get_gemini_response(prompt):
    # Try getting from DB first (Admin settings)
    from app.models import SystemConfig
    api_key = None
    try:
        config = SystemConfig.query.filter((SystemConfig.key == "google_key") | (SystemConfig.key == "gemini_api_key")).first()
        api_key = config.value if config and config.value else os.environ.get('GEMINI_API_KEY')
    except:
        api_key = os.environ.get('GEMINI_API_KEY')

    if not api_key or "AIzaSy" not in api_key:
        return (
            "I am WellBot, your health assistant. "
            "Please configure your GEMINI_API_KEY in the backend .env file to enable AI responses."
        )

    # Core models list - we try Pro first for accuracy if health related, 
    # then fallback to Flash for speed or if Pro is restricted.
    # Core models list - we try Flash first for responsive habits, then fallback to Pro
    # Adding '-latest' aliases to ensure model discovery on all tiers
    models = [
        "gemini-2.0-flash", 
        "gemini-1.5-flash", 
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro",
        "gemini-1.5-pro-latest",
        "gemini-pro"
    ]
    
    headers = {"Content-Type": "application/json"}
    data = {"contents": [{"parts": [{"text": prompt}]}]}

    last_error = ""
    for model in models:
        # Try v1 first as it's more stable for GA models, then fallback to v1beta
        for api_version in ["v1", "v1beta"]:
            url = f"https://generativelanguage.googleapis.com/{api_version}/models/{model}:generateContent?key={api_key}"
            try:
                response = requests.post(url, headers=headers, json=data, timeout=20)
                if response.status_code == 200:
                    response_data = response.json()
                    if 'candidates' in response_data and response_data['candidates']:
                        return response_data['candidates'][0]['content']['parts'][0]['text']
                
                # Log issues but continue to fallbacks
                if response.status_code == 429:
                    print(f"Gemini API Quota Exceeded ({model}/{api_version})")
                    last_error = "Quota Exhausted"
                elif response.status_code == 404:
                    # Silently skip 404s for fallback models
                    pass
                else:
                    print(f"Gemini API Error ({model}/{api_version}): {response.status_code}")
                    last_error = f"API Error {response.status_code}"
                    
            except Exception as e:
                print(f"Gemini Request Exception ({model}): {e}")
                last_error = "Connection Error"

    return f"I'm sorry, my AI core is experiencing high traffic ({last_error}). Please try again in 30 seconds."


# ---------------------------------------------------------------------------
# Chat Response
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """
You are WellBot — a professional AI Health Assistant.

════════════════════════════════════════
ABSOLUTE RULE — TOPIC RESTRICTION
════════════════════════════════════════
You ONLY respond to questions about:
  • Human health, symptoms, and illnesses
  • Medications, treatments, and medical procedures
  • Diet, nutrition, hydration, and fitness
  • Mental health, stress, and wellness
  • Medical reports, lab results, and recovery plans
  • First aid, emergency guidance, and prevention

If the user's message is about ANYTHING else (coding, politics, movies,
finance, sports, geography, math, travel, entertainment, etc.), you MUST
respond EXACTLY with this message and NOTHING else:
"🚫 I can only assist with health-related topics. Please ask me a health question!"

However, you MAY and SHOULD respond in a friendly way to general greetings (Hi, Hello, How are you?) and introductory messages, then pivot smoothly to asking how you can help with their health.

════════════════════════════════════════
DIETARY INTELLIGENCE (Strict Priority)
════════════════════════════════════════
When providing nutritional advice, prioritize these WellBot standard lists:

[Weight Loss Foods - for Overweight/Obese]
- Veg: Oats with fruits, Veg salads, Moong dal soup, Greek yogurt, Low-fat Paneer, Sprouts, Millets, Green smoothies.
- Non-Veg: Boiled eggs, Grilled chicken, Steamed fish, Chicken soup, Tuna salad.
Rule: High protein + high fiber + low calorie.

[Weight Gain Foods - for Underweight]
- Veg: Peanut butter toast, Banana milkshake, Paneer curry, Rice with ghee, Dry fruits, Avocado, Potatoes, Protein smoothies.
- Non-Veg: Egg omelette with cheese, Chicken curry, Salmon, Beef/Mutton, Chicken sandwiches with mayo.
Rule: Calorie dense + protein rich.

════════════════════════════════════════
RESPONSE FORMAT (≤ 150 words)
════════════════════════════════════════
Follow WHO guidelines. Be empathetic, concise, and professional.

🩺 **General Context:**
(1-2 sentences about the health concern.)

✅ **Key Actions:**
1. (Step 1)
2. (Step 2)
3. (Step 3)

⚠️ **Medical Caution:**
(1-2 warning signs or when to see a doctor.)

📌 *This guidance is informational only. Please consult a healthcare professional.*
"""


def generate_chat_response(history, user_message, user_profile=None):
    """
    Generates a health-focused response.
    Layer 1: Fast pre-flight keyword/pattern check.
    Layer 2: Gemini with a hardened system prompt.
    """
    # ── Layer 1: Pre-flight check ────────────────────────────────────────────
    if not is_health_related(user_message):
        return OFF_TOPIC_RESPONSE

    # ── Layer 2: Build prompt with history and profile context ───────────────
    profile_context = ""
    if user_profile:
        profile_context = (
            f"\n[USER PROFILE]\n"
            f"Health Index: {user_profile.get('health_score', 'N/A')}%\n"
            f"BMI: {user_profile.get('bmi_value', 'N/A')} ({user_profile.get('bmi_category', 'N/A')})\n"
            f"Conditions: {user_profile.get('medical_conditions', 'None')}\n"
            f"Goals: {user_profile.get('health_goals', 'General')}\n"
        )

    history_context = ""
    for entry in history[-5:]:
        role = "User" if entry['role'] == 'user' else "WellBot"
        history_context += f"{role}: {entry['content']}\n"

    full_prompt = (
        f"{SYSTEM_PROMPT}\n"
        f"User Context: {profile_context}\n"
        f"Recent conversation:\n{history_context}\n"
        f"User: {user_message}\n"
        "WellBot:"
    )

    return get_ai_response(full_prompt)


# ---------------------------------------------------------------------------
# Report Analysis
# ---------------------------------------------------------------------------

def analyze_report_and_generate_plan(ocr_text, user_profile=None):
    """
    Analyzes medical report text and generates a recovery plan via Gemini.
    Incorporates user profile (lifestyle, health goals) for personalization.
    """
    profile_context = ""
    if user_profile:
        profile_context = (
            f"User Profile: Age {user_profile.get('age')}, "
            f"Weight {user_profile.get('weight')}kg, Height {user_profile.get('height')}cm, "
            f"BMI: {user_profile.get('bmi_value')} ({user_profile.get('bmi_category')}), "
            f"Diet: {user_profile.get('lifestyle_preferences')}, "
            f"Current Conditions: {user_profile.get('medical_conditions')}, "
            f"Health Goals: {user_profile.get('health_goals')}."
        )

    # Determine nutrition focus based on BMI
    bmi_category = (user_profile.get('bmi_category') or "Normal").upper()
    nutrition_focus = ""
    diet_suggestions = ""
    
    if "OBESE" in bmi_category or "OVERWEIGHT" in bmi_category:
        nutrition_focus = "WEIGHT_LOSS"
    elif "UNDERWEIGHT" in bmi_category:
        nutrition_focus = "WEIGHT_GAIN"
    
    if nutrition_focus:
        db_ref = DIETARY_DATABASE[nutrition_focus]
        diet_suggestions = (
            f"\nPRIORITIZE THESE FOODS FOR {nutrition_focus}:\n"
            f"VEG: {', '.join(db_ref['veg'])}\n"
            f"NON-VEG: {', '.join(db_ref['non_veg'])}\n"
            f"STRATEGY: {db_ref['rule']}\n"
        )

    prompt = (
        f"{profile_context}\n\n"
        f"Analyze the following medical report text:\n\n{ocr_text}\n\n"
        "Provide a structured, detailed recovery plan in JSON format with keys: "
        "'summary', 'veg_diet', 'non_veg_diet', 'exercise_plan', 'dos', 'donts', 'natural_remedies'.\n"
        "CRITICAL REQUIREMENT: The plan MUST be tailored to the user's BMI category:\n"
        f"{diet_suggestions}"
        "\nREQUIREMENTS:\n"
        "1. Veg Diet: Provide 4 specific vegetarian recommendations from the prioritized list if applicable.\n"
        "2. Non-Veg Diet: Provide 4 specific non-vegetarian recommendations from the prioritized list if applicable.\n"
        "3. Exercise Plan: Recommend 3-4 activities with specific durations. (e.g., 'Light morning walk – 20 minutes').\n"
        "4. natural_remedies: Suggest 4 wellness remedies. (e.g., 'Drink warm lemon water', 'Herbal ginger tea').\n"
        "5. Formatting: 'veg_diet', 'non_veg_diet', 'exercise_plan', and 'natural_remedies' MUST be JSON arrays of objects with 'id' (int) and 'task' (string).\n"
        "6. Return ONLY the raw JSON object, no markdown."
    )

    response_text = get_ai_response(prompt, is_json=True)

    try:
        # Robust JSON extraction
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            response_text = json_match.group(0)
        return json.loads(response_text)
    except Exception as e:
        print(f"AI Analysis Error: {e}")
        return {
            "summary": "Error analyzing the report. Please ensure the upload was clear.",
            "veg_diet": [{"id": 1, "task": "5 soaked almonds + 2 walnuts"}, {"id": 2, "task": "Green leafy vegetables (spinach / broccoli)"}, {"id": 3, "task": "Oatmeal with fruits"}],
            "non_veg_diet": [{"id": 1, "task": "Boiled eggs"}, {"id": 2, "task": "Grilled chicken soup"}, {"id": 3, "task": "Fish rich in Omega-3"}],
            "exercise_plan": [{"id": 1, "task": "Light morning walk – 20 minutes"}, {"id": 2, "task": "Gentle stretching – 10 minutes"}, {"id": 3, "task": "Deep breathing – 5 minutes"}],
            "dos": "Get adequate rest. Stay hydrated. Eat nutritious food.",
            "donts": "Avoid junk food. Avoid excessive screen exposure. Do not skip meals.",
            "natural_remedies": [{"id": 1, "task": "Drink warm lemon water"}, {"id": 2, "task": "Herbal ginger tea"}, {"id": 3, "task": "Adequate hydration (2–3 liters)"}]
        }


def process_report_for_summary(ocr_text):
    prompt = f"Summarize the following medical report text in 2-3 concise sentences: {ocr_text}"
    return get_ai_response(prompt)


def generate_coach_insights(progress_data):
    """
    Generates dynamic lifestyle coaching insights based on current health metrics.
    """
    prompt = (
        f"Context: Today's health metrics for a user of Recovery OS:\n"
        f"- Water Intake: {progress_data.get('water_intake')}ml (Target: {progress_data.get('target_water')}ml)\n"
        f"- Steps: {progress_data.get('steps')} (Target: {progress_data.get('target_steps')})\n"
        f"- Sleep: {progress_data.get('sleep_hours')} hrs (Target: {progress_data.get('target_sleep')} hrs)\n"
        f"- Mood: {progress_data.get('mood')} (Score: {progress_data.get('mood_score')}/100)\n"
        f"- Recovery Score: {progress_data.get('recovery_score')}%\n\n"
        "Requirement: Provide 2-3 sentences of highly personalized, motivating, and actionable advice. "
        "If hydration is low, suggest drinking specifically. If steps are low, suggest a light walk. "
        "If mood is poor, suggest mindfulness. Be concise and encouraging. "
        "Return ONLY the plain text advice WITHOUT any markdown formatting like ** or ##."
    )
    
    response = get_ai_response(prompt)
    return response.replace('*', '').replace('#', '').strip()

def generate_smart_suggestions(progress_data, user_profile):
    """
    Provide real-time AI recommendations like "drink water", "take rest", etc.
    """
    prompt = (
        f"User Profile: {user_profile.get('medical_conditions', 'None')}, Goal: {user_profile.get('health_goals', 'General health')}.\n"
        f"Today's stats: Water {progress_data.get('water')}ml, Steps {progress_data.get('steps')}, Sleep {progress_data.get('sleep')}h.\n"
        "Requirement: Provide 3 short, actionable 'Smart Suggestions' (max 6 words each). "
        "Format: Return a JSON array of strings without markdown formatting. Example: [\"Drink 200ml water now\", \"Take a 5-min stretch\", \"Eat a handful of almonds\"]"
    )
    
    response = get_ai_response(prompt)
    try:
        json_match = re.search(r'\[.*\]', response, re.DOTALL)
        if json_match:
            items = json.loads(json_match.group(0))
            return [str(i).replace('*', '').replace('#', '').strip() for i in items]
        return ["Stay hydrated", "Keep moving", "Maintain healthy diet"]
    except:
        return ["Stay hydrated", "Keep moving", "Maintain healthy diet"]

def generate_weekly_summary(history_data, user_profile):
    """
    Generates a weekly report summarizing progress and activities.
    """
    prompt = (
        f"User Profile: {user_profile.get('medical_conditions')}, Diet: {user_profile.get('lifestyle_preferences')}.\n"
        f"Weekly Progress: {json.dumps(history_data)}\n"
        "Requirement: Summarize the week's health journey in 2 paragraphs. "
        "Highlight improvements, areas for focus next week, and provide specific nutrition/exercise tweaks. "
        "Include mentions of natural snacks like Badam or Kismis if appropriate. "
        "Return the summary text."
    )
    return get_ai_response(prompt)

def extract_symptoms(message):
    """
    Extracts medical symptoms from user message using Gemini.
    """
    prompt = (
        f"Analyze the following message and extract any medical symptoms mentioned: '{message}'.\n"
        "Return ONLY a JSON array of strings (e.g., ['fatigue', 'headache']). "
        "If no symptoms are found, return []."
    )
    
    response = get_ai_response(prompt)
    try:
        json_match = re.search(r'\[.*\]', response, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(0))
        return []
    except:
        return []

def extract_plan_from_text(pasted_text, user_profile=None):
    """
    Extracts a structured medical recovery plan from general pasted text.
    Categorizes tasks into Diet, Exercise, and Wellness components.
    """
    profile_context = ""
    if user_profile:
        profile_context = f"User Profile: {user_profile.get('medical_conditions', 'General')}, {user_profile.get('lifestyle_preferences', 'No dietary restriction')}."

    prompt = (
        f"{profile_context}\n\n"
        f"Extract all possible medical recovery tasks from this text and categorize them:\n\n{pasted_text}\n\n"
        "Return result in JSON format with exactly these keys: "
        "'veg_diet', 'non_veg_diet', 'exercise_plan', 'dos', 'donts', 'natural_remedies'.\n"
        "Formatting Rules:\n"
        "1. All tracks MUST be JSON arrays of objects with 'id' (integer) and 'task' (string descriptions).\n"
        "2. Split dietary tasks into Veg and Non-Veg categories. (Example Veg: '5 soaked almonds', 'Spinach'. Non-Veg: 'Boiled eggs', 'Chicken soup').\n"
        "3. Exercise Plan must include duration (e.g., 'Walk - 20 mins').\n"
        "4. 'dos' and 'donts' should be single strings with clean bullet points or sentences.\n"
        "Return ONLY the raw JSON object."
    )

    response_text = get_ai_response(prompt, is_json=True)
    
    # Pre-defined high-quality fallback protocol if all AI tiers fail (Quota/Balance)
    fallback_plan = {
        "veg_diet": [{"id": 1, "task": "5 soaked almonds + 2 walnuts"}, {"id": 2, "task": "Green leafy vegetables (spinach / broccoli)"}, {"id": 3, "task": "Oatmeal with fruits - high fiber"}],
        "non_veg_diet": [{"id": 1, "task": "2 Boiled eggs (morning)"}, {"id": 2, "task": "Grilled chicken soup (light)"}, {"id": 3, "task": "Steamed fish rich in Omega-3"}],
        "exercise_plan": [{"id": 1, "task": "Light morning walk – 20 minutes"}, {"id": 2, "task": "Gentle stretching – 10 minutes"}, {"id": 3, "task": "Deep breathing – 5 minutes"}],
        "dos": "Stay hydrated (2-3L water). Get 8 hours of sleep. Follow a consistent routine.",
        "donts": "Avoid junk food. Avoid excessive caffeine. Do not skip meals or workouts.",
        "natural_remedies": [{"id": 1, "task": "Drink warm lemon water"}, {"id": 2, "task": "Herbal ginger tea"}, {"id": 3, "task": "Soaked fenugreek seeds (methi)"}]
    }

    try:
        if not response_text or "I'm sorry" in response_text or "Quota" in response_text:
             return fallback_plan

        # Extraction logic
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(0))
        
        return fallback_plan
    except Exception as e:
        print(f"Extraction parsing error: {e}")
        return fallback_plan
