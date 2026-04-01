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

    # Serve index.html for SPA fallback (before Whitenoise)
    @app.route('/')
    def serve_index():
        return send_from_directory(
            os.path.join(os.path.dirname(__file__), 'workspace', 'dist'),
            'index.html'
        )

    # Static files - Whitenoise serves from /app/workspace/dist at root level
    static_path = os.path.join(os.path.dirname(__file__), 'workspace', 'dist')
    if os.path.exists(static_path):
        app.wsgi_app = WhiteNoise(app.wsgi_app, root=static_path)

    return app
