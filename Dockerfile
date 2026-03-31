# ─── Stage 1: Build React frontend ─────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app

COPY workspace/package*.json ./
RUN npm install

COPY workspace/ ./
RUN npm run build

# ─── Stage 2: Python backend + nginx serving everything ──────────────────────
FROM python:3.11-slim AS backend

WORKDIR /app

# Install system deps (nginx for serving SPA + proxy, gcc for psycopg2)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev nginx && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy backend source
COPY backend/ .

# Copy nginx config
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built React SPA
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Content files for the content API
COPY workspace/public/content/ /app/content/

ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=production

EXPOSE 8000

# Start gunicorn (Flask API) in background, then nginx in foreground.
# wait -n exits when any background process exits (gunicorn crash = container stops).
CMD sh -c "gunicorn --bind 0.0.0.0:5000 --workers 2 --timeout 120 wsgi:app & nginx -g 'daemon off;' && wait -n"
