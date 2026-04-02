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
ENV STATIC_ROOT=/app/dist
ENV DATABASE_URL=postgresql://vendue_db_user:***@dpg-d74fnrp4tr6s73coe66g-a.oregon-postgres.render.com/vendeu_db?sslmode=require

EXPOSE 8000

# Build React frontend in the same container
COPY workspace/package.json workspace/package-lock.json* ./
RUN npm ci --silent 2>/dev/null || npm install --silent 2>/dev/null

COPY workspace/ ./
RUN npm run build

# Copy content files for the content API
COPY workspace/public/content/ /app/content/

# Single-process gunicorn: serves Flask API + static files via WhiteNoise
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-8000} --workers 1 --timeout 300 --log-level info --access-logfile - --error-logfile - wsgi:app"]
