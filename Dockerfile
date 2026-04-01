# ─── Python backend + nginx reverse proxy ──────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

# Install system deps (nginx for proxy, gcc for psycopg2)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev nginx && rm -rf /var/lib/apt/lists/*

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

# Nginx proxies to gunicorn on 8000; gunicorn listens on 5000
CMD sh -c "gunicorn --bind 0.0.0.0:5000 --workers 1 --threads 4 --timeout 120 --access-logfile - --error-logfile - --log-level debug wsgi:app & nginx -c /etc/nginx/nginx.conf -g 'daemon off;' && wait -n"
