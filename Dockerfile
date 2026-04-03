# ─── Python backend serving React SPA ───────────────────────────────────────
FROM python:3.11-slim AS base

WORKDIR /app

# Install system deps (gcc for psycopg2, nodejs for frontend build)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev curl \
    && rm -rf /var/lib/apt/lists/* \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy backend source
COPY backend/ .

ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=production
ENV STATIC_ROOT=/app/workspace/dist
ENV FLASK_APP=app.py

EXPOSE 10000

# Build React frontend
COPY workspace/package.json workspace/package-lock.json ./workspace/
WORKDIR /app/workspace
RUN npm ci

WORKDIR /app
COPY workspace/ ./workspace/
WORKDIR /app/workspace
RUN npm run build

WORKDIR /app

# Copy content files for the content API
COPY workspace/public/content/ /app/content/

# Clean pycache, run migrations, then start gunicorn
# Also apply email_verification columns via raw SQL as failsafe (migrations may fail silently)
CMD ["sh", "-c", "find /app -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null; find /app -name '*.pyc' -delete 2>/dev/null; FLASK_APP=app.py flask db upgrade 2>/dev/null || true; python3 -c \"\nimport os, sys\nsys.path.insert(0, '/app')\nfrom app import db\nfrom flask import Flask\napp = Flask(__name__)\napp.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')\napp.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False\ndb.init_app(app)\nwith app.app_context():\n    from sqlalchemy import text\n    conn = db.engine.connect()\n    conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE'))\n    conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(64)'))\n    conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP'))\n    conn.commit()\n    print('Email verification columns added OK')\n\" 2>/dev/null || true; gunicorn --bind 0.0.0.0:${PORT:-8000} --workers 1 --timeout 300 --log-level info --access-logfile - --error-logfile - wsgi:app"]
