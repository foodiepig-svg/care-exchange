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

# Apply all schema changes via raw SQL as failsafe (flask db upgrade fails at build time)
CMD ["sh", "-c", "find /app -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null; find /app -name '*.pyc' -delete 2>/dev/null; FLASK_APP=app.py flask db upgrade 2>/dev/null || true; python3 << 'PYEOF'\nimport os, sys\nsys.path.insert(0, '/app')\nfrom app import db\nfrom flask import Flask\napp = Flask(__name__)\napp.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')\napp.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False\ndb.init_app(app)\nwith app.app_context():\n    from sqlalchemy import text, inspect\n    inspector = inspect(db.engine)\n    existing = {c['name'] for c in inspector.get_columns('users')}\n    conn = db.engine.connect()\n    # 005: email verification\n    if 'email_verified' not in existing:\n        conn.execute(text('ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE'))\n        conn.execute(text('ALTER TABLE users ADD COLUMN verification_token VARCHAR(64)'))\n        conn.execute(text('ALTER TABLE users ADD COLUMN verification_token_expires TIMESTAMP'))\n        print('005: email verification columns added')\n    # 006: group threads\n    thread_cols = {c['name'] for c in inspector.get_columns('threads')}\n    if 'thread_type' not in thread_cols:\n        conn.execute(text(\"ALTER TABLE threads ADD COLUMN thread_type VARCHAR(20) DEFAULT 'direct'\"))\n        print('006: thread_type column added')\n    tables = inspector.get_table_names()\n    if 'thread_participants' not in tables:\n        conn.execute(text('CREATE TABLE thread_participants (thread_id INTEGER REFERENCES threads(id) ON DELETE CASCADE, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, PRIMARY KEY (thread_id, user_id))'))\n        print('006: thread_participants table created')\n    # 007: message attachments\n    msg_cols = {c['name'] for c in inspector.get_columns('messages')}\n    if 'attachments' not in msg_cols:\n        conn.execute(text(\"ALTER TABLE messages ADD COLUMN attachments JSON DEFAULT '[]'\"))\n        print('007: attachments column added')\n    # 008: tickets\n    tables = inspector.get_table_names()\n    if 'tickets' not in tables:\n        conn.execute(text('''\n            CREATE TABLE tickets (\n                id SERIAL PRIMARY KEY,\n                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,\n                title VARCHAR(200) NOT NULL,\n                description TEXT,\n                type VARCHAR(20) DEFAULT 'issue',\n                status VARCHAR(20) DEFAULT 'open',\n                priority VARCHAR(20) DEFAULT 'medium',\n                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n                resolved_at TIMESTAMP\n            )\n        '''))\n        print('008: tickets table created')\n    if 'ticket_comments' not in tables:\n        conn.execute(text('''\n            CREATE TABLE ticket_comments (\n                id SERIAL PRIMARY KEY,\n                ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,\n                author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,\n                author_role VARCHAR(20),\n                comment TEXT NOT NULL,\n                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n            )\n        '''))\n        print('008: ticket_comments table created')\n    conn.commit()\n    print('All migrations applied via raw SQL')\nPYEOF\ngunicorn --bind 0.0.0.0:${PORT:-8000} --workers 1 --timeout 300 --log-level info --access-logfile - --error-logfile - wsgi:app"]
