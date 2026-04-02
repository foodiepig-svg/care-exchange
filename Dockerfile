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

# Build React frontend in the same container
COPY workspace/package.json workspace/package-lock.json* ./
RUN npm ci --silent 2>/dev/null || npm install --silent 2>/dev/null

COPY workspace/ ./
RUN npm run build

# Copy content files for the content API
COPY workspace/public/content/ /app/content/

# Clean pycache, run migrations, then start gunicorn
CMD ["sh", "-c", "find /app -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null; find /app -name '*.pyc' -delete 2>/dev/null; FLASK_APP=app.py flask db upgrade && gunicorn --bind 0.0.0.0:${PORT:-8000} --workers 1 --timeout 300 --log-level info --access-logfile - --error-logfile - wsgi:app"]
