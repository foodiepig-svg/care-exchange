import sys, os, traceback
sys.path.insert(0, '/Users/WORK/projects/care-exchange/backend')

# Test imports the way Flask would
os.environ['FLASK_ENV'] = 'production'
os.environ['DATABASE_URL'] = 'postgresql://postgres:postgres@localhost:5432/careexchange'

try:
    from app import create_app
    app = create_app()
    print("App created OK")
    with app.app_context():
        from models import Notification
        print("Notification model OK")
        from services.email_service import EmailService
        print("EmailService OK")
        from services.notification_service import NotificationService
        print("NotificationService OK")
        from services.referral_service import ReferralService
        print("ReferralService OK")
        from routes import auth_bp
        print("auth_bp OK")
except Exception as e:
    traceback.print_exc()
    print(f"FAILED: {e}")