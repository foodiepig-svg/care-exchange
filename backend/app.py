import os
from flask import Flask, send_from_directory
from whitenoise import WhiteNoise
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

    # Render health check hits /health (not /api/health)
    @app.route('/health')
    def render_health():
        return {'status': 'healthy'}

    # Serve index.html for SPA fallback - catch-all for React Router routes
    # All static serving uses STATIC_ROOT env var (set to /app/workspace/dist in Dockerfile)
    _static_dir = os.environ.get('STATIC_ROOT', '/app/workspace/dist')

    @app.route('/')
    def serve_index():
        return send_from_directory(_static_dir, 'index.html')

    @app.route('/<path:path>')
    def serve_spa(path):
        # API paths go to Flask blueprints (registered earlier) - this won't match them
        # But just in case, redirect api/* to proper handling
        if path.startswith('api/'):
            return send_from_directory(_static_dir, path)
        # assets/* and content/* served by Whitenoise - pass through
        # All other routes (React Router: /login, /register, /dashboard, etc.) -> index.html
        return send_from_directory(_static_dir, 'index.html')

    # Static files - Whitenoise serves from /app/workspace/dist at root level
    # Disabled for debugging - assets should be served via Flask route below
    # if os.path.exists(_static_dir):
    #     app.wsgi_app = WhiteNoise(app.wsgi_app, root=_static_dir)
    
    # Serve static assets via Flask directly (avoids Whitenoise wrapping issues)
    @app.route('/assets/<path:filename>')
    def serve_assets(filename):
        return send_from_directory(_static_dir, os.path.join('assets', filename))

    return app
