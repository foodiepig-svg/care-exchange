import sys
import os
import traceback

os.environ.setdefault('PYTHONUNBUFFERED', '1')

print("WSGI: starting...", flush=True)

try:
    from app import create_app
    print("WSGI: importing create_app OK", flush=True)
    app = create_app()
    print("WSGI: app created successfully", flush=True)
except Exception as e:
    print(f"WSGI: app creation FAILED: {e}", flush=True)
    traceback.print_exc()
    sys.stdout.flush()
    sys.stderr.flush()
    # Don't exit - let gunicorn handle it and log the error
    raise
