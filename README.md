# 🧠 WellBot – Global Wellness Assistant Chatbot

##  Overview

WellBot is an AI-powered wellness assistant designed to help users manage their health effectively. It integrates chatbot interaction, health analytics, and smart recommendations in one platform.

---

##  Features

* 🤖 AI Chatbot for health-related queries
* 📸 Prescription image analysis
* 🩺 Symptom checker
* 🍎 Nutrition guidance
* 📊 Health dashboard for tracking data
* 🔐 User authentication system
* 🧑‍💻 Admin dashboard for monitoring

---

## System Architecture

Frontend (HTML, CSS, JavaScript)
⬇
Flask Backend API
⬇
AI Model Integration (Groq | Gemini | OpenAI)
⬇
Database (MongoDB / MySQL)

---

## Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript
* Chart.js

### Backend

* Python
* Flask
* Flask-CORS
* Authlib

### Database

* MySQL / MongoDB

### AI Integration

* Groq (Llama)
* Google Gemini
* OpenAI

---
## 🔐 Environment Configuration

Create a `.env` file in `backend/`:

```env
DATABASE_URL=sqlite:///site.db
SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret
OPENAI_API_KEY=your_api_key
GEMINI_API_KEY=your_api_key
OPENROUTER_API_KEY=your_api_key
```



##  Project Structure

```
## 📁 Repository Structure

```text
wellbot/
│
├── backend/
│   ├── app/
│   │   ├── routes/        # API endpoints (auth, chat, analytics)
│   │   ├── services/      # AI, OCR, scheduler logic
│   │   └── models.py      # Database schema
│   │
│   ├── migrations/        # Database versioning (Alembic)
│   ├── config.py          # Configuration management
│   └── run.py             # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Application pages
│   │   ├── services/      # API integration
│   │   └── i18n.js        # Localization setup
│
└── documents/             # Reports & supporting materials
```

---

## Installation & Setup

### 1. Clone Repository

```
git clone https://github.com/sricharantejb/Sri-Charan-tej_WellBot_Team-C.git
cd wellbot
```

---

### 2. Backend Setup

```
cd backend
python -m venv venv
source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
python app.py
```

---

### 3. Frontend Setup

```
cd frontend
npm install
npm run dev
```

---

##  Usage

* Open browser and go to: `http://localhost:3000`
* Register/Login
* Interact with chatbot
* Track health data

---

---

##  Environment Variables

Create a `.env` file in backend:

```
OPENAI_API_KEY=your_api_key_here
GEMINI_API_KEY=your_api_key_here
```

---

##  Future Improvements

* Mobile app integration
* Advanced AI recommendations
* Real-time health monitoring
* Multi-language support

---

##  Author

**Sri Charan Tej**
GitHub: https://github.com/sricharantejb

---

## 📜 License

This project is for educational and internship purposes.
