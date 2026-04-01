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
    import sys
    print("create_app: starting", flush=True)
    app = Flask(__name__)

    env = os.environ.get('FLASK_ENV', 'development')
    if env == 'production':
        from config import ProductionConfig
        app.config.from_object(ProductionConfig)
    else:
        from config import DevelopmentConfig
        app.config.from_object(DevelopmentConfig)

    print("create_app: config loaded", flush=True)

    # Initialize extensions
    db.init_app(app)
    print("create_app: db inited", flush=True)
    jwt.init_app(app)
    print("create_app: jwt inited", flush=True)
    migrate.init_app(app, db)
    print("create_app: migrate inited", flush=True)
    CORS(app, origins=['http://localhost:5173', 'http://localhost:3000'], supports_credentials=True)
    print("create_app: cors inited", flush=True)

    # Ensure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    print("create_app: upload folder ready", flush=True)

    # Register blueprints
    from routes.auth import auth_bp
    print("create_app: auth_bp imported", flush=True)
    from routes.participants import participants_bp
    from routes.referrals import referrals_bp
    from routes.updates import updates_bp
    from routes.messages import messages_bp

    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    print("create_app: auth_bp registered", flush=True)
    app.register_blueprint(participants_bp, url_prefix='/api/v1/participants')
    print("create_app: participants_bp registered", flush=True)
    app.register_blueprint(referrals_bp, url_prefix='/api/v1/referrals')
    app.register_blueprint(updates_bp, url_prefix='/api/v1/updates')
    app.register_blueprint(messages_bp, url_prefix='/api/v1/messages')
    print("create_app: all blueprints registered", flush=True)

    # Health check
    @app.route('/api/health')
    def health():
        return {'status': 'healthy'}

    @app.route('/')
    def serve_index():
        # __file__ = /app/app.py, so ../workspace/dist = /app/workspace/dist
        static_path = os.path.join(os.path.dirname(__file__), 'workspace', 'dist')
        if os.path.exists(static_path):
            return send_from_directory(static_path, 'index.html')
        return "Static files not found", 503

    @app.route('/static/<path:filename>')
    def serve_static_files(filename):
        static_path = os.path.join(os.path.dirname(__file__), 'workspace', 'dist')
        return send_from_directory(static_path, filename)

    return app
