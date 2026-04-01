# ─── Python backend serving React SPA (Whitenoise) ───────────────────────────
FROM python:3.11-slim

WORKDIR /app

# Install system deps (gcc for psycopg2)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy backend source
COPY backend/ .

# Copy pre-built React SPA
COPY workspace/dist /app/workspace/dist

# Content files for the content API
COPY workspace/public/content/ /app/content/

ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=production
ENV DATABASE_URL=postgresql://vendue_db_user:xSC9skfpDz7KrNOlfOFfp632eLrfOJ5j@dpg-d74fnrp4tr6s73coe66g-a.oregon-postgres.render.com/vendue_db?sslmode=require

EXPOSE 8000

# Gunicorn on port 8000 (matches Render LB routing)
CMD gunicorn --bind 0.0.0.0:8000 --workers 1 --threads 4 --timeout 120 wsgi:app
