import sys
sys.path.insert(0, '/Users/WORK/projects/care-exchange/backend')
try:
    import services.email_service
    print("email_service: OK")
except Exception as e:
    print(f"email_service: ERROR - {e}")

try:
    import services.notification_service
    print("notification_service: OK")
except Exception as e:
    print(f"notification_service: ERROR - {e}")

try:
    import services.referral_service
    print("referral_service: OK")
except Exception as e:
    print(f"referral_service: ERROR - {e}")

try:
    import routes.auth
    print("auth: OK")
except Exception as e:
    print(f"auth: ERROR - {e}")