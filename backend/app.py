import os
from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()


def create_app():
    app = Flask(__name__)

    env = os.environ.get('FLASK_ENV', 'development')
    if env == 'production':
        from config import ProductionConfig
        app.config.from_object(ProductionConfig)
    else:
        from config import DevelopmentConfig
        app.config.from_object(DevelopmentConfig)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    CORS(app, origins=['http://localhost:5173', 'http://localhost:3000'], supports_credentials=True)

    # Ensure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Register blueprints
    from routes.auth import auth_bp
    from routes.participants import participants_bp
    from routes.referrals import referrals_bp
    from routes.updates import updates_bp
    from routes.messages import messages_bp

    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    app.register_blueprint(participants_bp, url_prefix='/api/v1/participants')
    app.register_blueprint(referrals_bp, url_prefix='/api/v1/referrals')
    app.register_blueprint(updates_bp, url_prefix='/api/v1/updates')
    app.register_blueprint(messages_bp, url_prefix='/api/v1/messages')

    # Health check - must be before Whitenoise wraps wsgi_app
    @app.route('/api/health')
    def health():
        return {'status': 'healthy'}

    @app.route('/api/debug/db')
    def debug_db():
        try:
            result = db.session.execute(db.text('SELECT 1')).fetchone()
            return {'db': 'ok', 'result': result[0]}
        except Exception as e:
            return {'db': 'error', 'message': str(e)}, 500

    # Render health check hits /health (not /api/health)
    @app.route('/health')
    def render_health():
        return {'status': 'healthy'}

    # Serve index.html for SPA fallback - catch-all for React Router routes
    # All static serving uses STATIC_ROOT env var (set to /app/workspace/dist in Dockerfile)
    _static_dir = os.environ.get('STATIC_ROOT', '/app/workspace/dist')

    @app.route('/')
    def serve_index():
        try:
            with open(os.path.join(_static_dir, 'index.html'), 'r') as f:
                return f.read(), 200, {'Content-Type': 'text/html'}
        except Exception as e:
            print(f"ERROR reading index.html: {e}", flush=True)
            return f"Error: {e}", 500

    @app.route('/<path:path>')
    def serve_spa(path):
        # Don't intercept API routes — let them 404 so the API handlers work
        if path.startswith('api/'):
            return {'error': 'Not found'}, 404
        print(f"CATCH-ALL HIT: {path}", flush=True)
        # Read and return index.html directly instead of using send_from_directory
        try:
            with open(os.path.join(_static_dir, 'index.html'), 'r') as f:
                return f.read(), 200, {'Content-Type': 'text/html'}
        except Exception as e:
            print(f"ERROR reading index.html: {e}", flush=True)
            return f"Error: {e}", 500

    # Serve static assets via Flask directly
    @app.route('/assets/<path:filename>')
    def serve_assets(filename):
        import mimetypes
        try:
            filepath = os.path.join(_static_dir, 'assets', filename)
            mime_type, _ = mimetypes.guess_type(filepath)
            if not mime_type:
                mime_type = 'application/octet-stream'
            with open(filepath, 'r') as f:
                return f.read(), 200, {'Content-Type': mime_type}
        except Exception as e:
            print(f"ERROR reading asset {filename}: {e}", flush=True)
            return f"Error: {e}", 500

    return app
