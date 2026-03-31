#!/bin/bash
set -e

PROJECT_DIR="$HOME/projects/care-exchange"
cd "$PROJECT_DIR"

echo "=== Care Exchange Deployment ==="

# Check Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "ERROR: Docker is not running. Start Docker Desktop and try again."
    exit 1
fi

# Stop existing containers
echo "[1/4] Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Build images
echo "[2/4] Building images (no cache)..."
docker-compose build --no-cache

# Start services
echo "[3/4] Starting services..."
docker-compose up -d

# Wait for backend to be healthy
echo "[4/4] Waiting for backend to be ready..."
MAX_WAIT=30
COUNTER=0
while [ $COUNTER -lt $MAX_WAIT ]; do
    if curl -sf http://localhost:5000/api/health > /dev/null 2>&1; then
        echo ""
        echo "=== Deployed Successfully ==="
        echo "Frontend: http://localhost:3000"
        echo "API:      http://localhost:5000/api/v1"
        echo "Health:   http://localhost:5000/api/health"
        exit 0
    fi
    COUNTER=$((COUNTER + 1))
    echo -n "."
    sleep 1
done

echo ""
echo "WARNING: Backend did not respond within ${MAX_WAIT}s. Check logs with:"
echo "  docker-compose logs backend"
exit 1
