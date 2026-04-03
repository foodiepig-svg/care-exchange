import os
from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()

# Optional: Resend email API key (used by EmailService)
# Set RESEND_API_KEY in environment to enable real email delivery
_resend_api_key = os.environ.get('RESEND_API_KEY', '')


def create_app():
    app = Flask(__name__)

    env = os.environ.get('FLASK_ENV', 'development')
    if env == 'production':
        from config import ProductionConfig
        app.config.from_object(ProductionConfig)
    else:
        from config import DevelopmentConfig
        app.config.from_object(DevelopmentConfig)

    # Verify key modules can be imported
    try:
        import resend
        print(f"[STARTUP] resend module loaded, api_key set: {bool(os.environ.get('RESEND_API_KEY'))}")
    except ImportError:
        print("[STARTUP] resend not installed (pip install resend)")

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    CORS(app, origins=['http://localhost:5173', 'http://localhost:3000', 'https://care-exchange.onrender.com'], supports_credentials=True)

    # Ensure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Register blueprints
    from routes.auth import auth_bp
    from routes.participants import participants_bp
    from routes.referrals import referrals_bp
    from routes.updates import updates_bp
    from routes.messages import messages_bp
    from routes.goals import goals_bp
    from routes.care_plans import care_plans_bp
    from routes.notifications import notifications_bp
    from routes.documents import documents_bp
    from routes.consents import consents_bp
    from routes.content import content_bp
    from routes.providers import providers_bp
    from routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    app.register_blueprint(participants_bp, url_prefix='/api/v1/participants')
    app.register_blueprint(referrals_bp, url_prefix='/api/v1/referrals')
    app.register_blueprint(updates_bp, url_prefix='/api/v1/updates')
    app.register_blueprint(messages_bp, url_prefix='/api/v1/messages')
    app.register_blueprint(goals_bp, url_prefix='/api/v1/goals')
    app.register_blueprint(care_plans_bp, url_prefix='/api/v1/care-plans')
    app.register_blueprint(notifications_bp, url_prefix='/api/v1/notifications')
    app.register_blueprint(documents_bp, url_prefix='/api/v1/documents')
    app.register_blueprint(consents_bp, url_prefix='/api/v1/consents')
    app.register_blueprint(content_bp, url_prefix='/api/v1/content')
    app.register_blueprint(providers_bp, url_prefix='/api/v1/providers')
    app.register_blueprint(admin_bp, url_prefix='/api/v1/admin')

    # Auto-migrate: add any columns that exist in model but not in DB (failsafe)
    with app.app_context():
        try:
            db.session.execute(db.text("""
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='contact_email') THEN
                        ALTER TABLE providers ADD COLUMN contact_email VARCHAR(255);
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='providers' AND column_name='location') THEN
                        ALTER TABLE providers ADD COLUMN location VARCHAR(255);
                    END IF;
                END
                $$;
            """))
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"[WARN] Could not add missing columns: {e}", flush=True)

    # Debug endpoints
    @app.route('/api/debug/test_email', methods=['POST'])
    def debug_test_email():
        """Test email sending."""
        import traceback
        try:
            from services.email_service import EmailService
            result = EmailService.send_email(
                "test@test.com",
                "Test email from Care Exchange",
                "<h2>Test</h2><p>This is a test email.</p>"
            )
            return {'ok': True, 'result': result}
        except Exception as e:
            return {'error': str(e), 'trace': traceback.format_exc()}, 500

    @app.route('/api/debug/migrate', methods=['POST'])
    def debug_migrate():
        from flask_migrate import upgrade
        try:
            upgrade()
            return {'migrated': True}
        except Exception as e:
            return {'migrated': False, 'error': str(e)}, 500

    @app.route('/api/debug/add_email_cols', methods=['POST'])
    def debug_add_email_cols():
        """Add email_verified and related columns to users table."""
        from sqlalchemy import text
        try:
            conn = db.engine.connect()
            # Check which columns exist
            inspector = db.inspect(db.engine)
            user_cols = {c['name'] for c in inspector.get_columns('users')}
            added = []
            if 'email_verified' not in user_cols:
                conn.execute(text('ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE'))
                added.append('email_verified')
            if 'verification_token' not in user_cols:
                conn.execute(text('ALTER TABLE users ADD COLUMN verification_token VARCHAR(64)'))
                added.append('verification_token')
            if 'verification_token_expires' not in user_cols:
                conn.execute(text('ALTER TABLE users ADD COLUMN verification_token_expires TIMESTAMP'))
                added.append('verification_token_expires')
            conn.commit()
            return {'ok': True, 'added': added}
        except Exception as e:
            import traceback
            return {'error': str(e), 'trace': traceback.format_exc()}, 500

    @app.route('/api/debug/login', methods=['POST'])
    def debug_login():
        """Simulate login to find the exact error."""
        from flask import request
        from models.user import User
        from flask_jwt_extended import create_access_token, create_refresh_token
        import traceback
        try:
            data = request.get_json() or {}
            email = data.get('email', '').strip().lower()
            password = data.get('password', '')
            user = User.query.filter_by(email=email).first()
            if not user:
                return {'error': 'User not found'}
            if not user.check_password(password):
                return {'error': 'Invalid password'}
            # Try creating tokens
            access_token = create_access_token(identity=user.id)
            refresh_token = create_refresh_token(identity=user.id)
            # Try user.to_dict()
            try:
                user_dict = user.to_dict()
            except Exception as dict_err:
                return {'step': 'to_dict_failed', 'error': str(dict_err), 'trace': traceback.format_exc()}
            return {
                'step': 'all_ok',
                'access_token': access_token[:20] + '...',
                'user': user_dict,
            }
        except Exception as e:
            return {'error': str(e), 'step': 'unknown', 'trace': traceback.format_exc()}, 500

    @app.route('/api/debug/seed', methods=['POST'])
    def debug_seed():
        """Create demo accounts for all user roles. Remove after use."""
        from flask import request
        from seed_demo_data import create_demo_data
        try:
            created, errors = create_demo_data(app, db)
            return {'created': len(created), 'errors': errors}
        except Exception as e:
            import traceback
            return {'error': str(e), 'trace': traceback.format_exc()}, 500

    @app.route('/api/debug/email', methods=['POST'])
    def debug_email():
        """Test Elastic Email send and return diagnostics."""
        from flask import request
        from services.email_service import _get_elasticemail_api_key, EmailService
        import urllib.request
        import urllib.parse
        email = (request.get_json() or {}).get('email', 'sunjay.soma@gmail.com')
        api_key = _get_elasticemail_api_key()
        key_set = bool(api_key)

        # Direct Elastic Email API test
        direct_result = None
        direct_error = None
        if api_key:
            test_html = f"<p>Test email at {__import__('datetime').datetime.utcnow()}</p>"
            data = urllib.parse.urlencode({
                "apikey": api_key,
                "from": "noreply@careexchange.com.au",
                "fromName": "Care Exchange",
                "to": email,
                "subject": "Elastic Email Direct Test",
                "bodyhtml": test_html,
                "isTransactional": "true",
            }).encode("utf-8")
            req = urllib.request.Request(
                "https://api.elasticemail.com/v2/email/send",
                data=data,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            try:
                with urllib.request.urlopen(req, timeout=15) as resp:
                    direct_result = resp.read().decode("utf-8")
            except urllib.error.HTTPError as e:
                direct_error = f"HTTP {e.code}: {e.read().decode('utf-8')}"
            except Exception as e:
                direct_error = str(e)

        return {
            'elasticemail_key_set': key_set,
            'from_email': 'noreply@careexchange.com.au',
            'direct_result': direct_result,
            'direct_error': direct_error,
            'test_email': email,
        }

    @app.route('/api/debug/provider_create', methods=['POST'])
    def debug_create_provider():
        from models import User, Provider
        try:
            data = request.get_json() or {}
            email = data.get('email', 'test@test.com')
            org = data.get('organisation_name', 'Test Org')
            u = User(email=email, full_name='Test', role='provider')
            u.set_password('Test@123')
            db.session.add(u)
            db.session.flush()
            p = Provider(user_id=u.id, organisation_name=org)
            db.session.add(p)
            db.session.flush()
            db.session.commit()
            return {'ok': True, 'user_id': u.id, 'provider_id': p.id}
        except Exception as e:
            db.session.rollback()
            import traceback
            return {'error': str(e), 'type': type(e).__name__, 'tb': traceback.format_exc()}, 500

    @app.route('/api/debug/test_provider', methods=['POST'])
    def debug_test_provider():
        from models import User, Provider
        try:
            data = request.get_json() or {}
            email = data.get('email', 'test@test.com')
            org = data.get('organisation_name', 'Test Org')
            u = User(email=email, full_name='Test', role='provider')
            u.set_password('Test@123')
            db.session.add(u)
            db.session.flush()
            p = Provider(user_id=u.id, organisation_name=org)
            db.session.add(p)
            db.session.flush()
            db.session.commit()
            return {'ok': True, 'user_id': u.id, 'provider_id': p.id}
        except Exception as e:
            db.session.rollback()
            import traceback
            return {'error': str(e), 'type': type(e).__name__, 'tb': traceback.format_exc()}, 500

    # Health check
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

    @app.route('/api/debug/fix_email_columns', methods=['POST'])
    def debug_fix_email_columns():
        """One-time fix: add email_verification columns to users table if missing."""
        try:
            from flask_migrate import upgrade
            upgrade()
            return {'ok': True, 'msg': 'migration attempted'}
        except Exception as me:
            pass
        # Fallback: raw SQL
        try:
            from alembic import op
            op.add_column('users', op.Column('email_verified', sa.Boolean(), nullable=True))
            return {'ok': True, 'msg': 'alembic op attempted'}
        except Exception as e:
            pass
        try:
            db.session.execute(db.text("ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE"))
            db.session.execute(db.text("ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(64)"))
            db.session.execute(db.text("ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP"))
            db.session.commit()
            return {'ok': True}
        except Exception as e:
            db.session.rollback()
            return {'ok': False, 'error': str(e)}, 500

    @app.route('/api/debug/users_columns')
    def debug_users_columns():
        try:
            result = db.session.execute(db.text("""
                SELECT column_name FROM information_schema.columns
                WHERE table_name='users' AND table_schema='public'
                ORDER BY ordinal_position
            """)).fetchall()
            return {'columns': [r[0] for r in result]}
        except Exception as e:
            return {'error': str(e)}, 500

    @app.route('/api/debug/make-admin', methods=['POST'])
    def debug_make_admin():
        """Promote a user to admin role by email. Remove after use."""
        import traceback
        try:
            from models.user import User
            data = request.get_json() or {}
            email = data.get('email', '').strip().lower()
            if not email:
                return {'error': 'email required'}, 400
            user = User.query.filter_by(email=email).first()
            if not user:
                return {'error': 'User not found'}, 404
            user.role = 'admin'
            db.session.commit()
            return {'success': True, 'user': user.to_dict()}
        except Exception as e:
            return {'error': str(e), 'trace': traceback.format_exc()}, 500

    @app.route('/api/debug/tables')
    def debug_tables():
        try:
            result = db.session.execute(db.text("SELECT tablename FROM pg_tables WHERE schemaname='public'")).fetchall()
            return {'tables': [r[0] for r in result]}
        except Exception as e:
            return {'tables': 'error', 'message': str(e)}, 500

    # Render health check hits /health (not /api/health)
    @app.route('/health')
    def render_health():
        return {'status': 'healthy'}

    # Serve SPA and static assets
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
        if path.startswith('api/') or path.startswith('debug'):
            return {'error': 'Not found'}, 404
        try:
            with open(os.path.join(_static_dir, 'index.html'), 'r') as f:
                return f.read(), 200, {'Content-Type': 'text/html'}
        except Exception as e:
            print(f"ERROR reading index.html: {e}", flush=True)
            return f"Error: {e}", 500

    @app.route('/assets/<path:filename>')
    def serve_assets(filename):
        import mimetypes
        filepath = os.path.join(_static_dir, 'assets', filename)
        if not os.path.isfile(filepath):
            return {'error': 'Not found'}, 404
        mime_type, _ = mimetypes.guess_type(filepath)
        if not mime_type:
            mime_type = 'application/octet-stream'
        with open(filepath, 'r') as f:
            return f.read(), 200, {'Content-Type': mime_type}

    return app
