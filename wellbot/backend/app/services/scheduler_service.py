from apscheduler.schedulers.background import BackgroundScheduler
from twilio.rest import Client
import os
from app import db
from app.models import Reminder
from datetime import datetime

scheduler = BackgroundScheduler()

def send_whatsapp_message(to, body):
    account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
    auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
    from_number = os.environ.get('TWILIO_PHONE_NUMBER') or 'whatsapp:+14155238886' # Twilio Sandbox
    
    if not account_sid or not auth_token:
        print("Twilio credentials missing.")
        return

    try:
        client = Client(account_sid, auth_token)
        message = client.messages.create(
            from_=from_number,
            body=body,
            to=f'whatsapp:{to}'
        )
        print(f"Sent message: {message.sid}")
    except Exception as e:
        print(f"Twilio Error: {e}")

def check_reminders(app):
    """
    Job to check DB for due reminders and send them.
    """
    with app.app_context():
        # Mock logic: retrieve all due reminders
        # In real app, check cron schedule against current time
        # For demo, we might just print active reminders
        print(f"Checking reminders at {datetime.now()}")
        pass

def start_scheduler(app):
    # Add job to check reminders every minute
    scheduler.add_job(lambda: check_reminders(app), 'interval', minutes=1)
    scheduler.start()
