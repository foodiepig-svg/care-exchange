import sys, os
sys.path.insert(0, os.path.dirname(__file__))

# Must set env BEFORE importing app to prevent Postgres driver from loading
os.environ['FLASK_ENV'] = 'testing'
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
os.environ['JWT_SECRET_KEY'] = 'test-secret'
os.environ['SECRET_KEY'] = 'test-secret'
os.environ['UPLOAD_FOLDER'] = '/tmp/test-uploads'

import pytest

# Patch Config.SQLALCHEMY_ENGINE_OPTIONS BEFORE create_app to avoid Postgres-specific connect_args
import config
config.Config.SQLALCHEMY_ENGINE_OPTIONS = {}
config.DevelopmentConfig.SQLALCHEMY_ENGINE_OPTIONS = {}
config.ProductionConfig.SQLALCHEMY_ENGINE_OPTIONS = {}

from app import create_app, db


@pytest.fixture
def app():
    application = create_app()
    # Override engine options that are Postgres-specific
    application.config['SQLALCHEMY_ENGINE_OPTIONS'] = {}
    with application.app_context():
        db.create_all()
        yield application
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def auth_headers(app, client):
    """Create a verified test participant directly in DB, return headers dict with Bearer token."""
    with app.app_context():
        from models import User, Participant
        from flask_jwt_extended import create_access_token
        user = User(email='testuser@example.com', full_name='Test User', role='participant')
        user.set_password('password123')
        user.email_verified = True  # Mark as verified for testing
        user.verified_at = db.func.now()
        db.session.add(user)
        db.session.flush()
        p = Participant(user_id=user.id)
        db.session.add(p)
        db.session.commit()
        token = create_access_token(identity=str(user.id))
        return {'Authorization': f'Bearer {token}', '_cv_app': app}


@pytest.fixture
def auth_headers_provider(app, client):
    """Create a verified test provider directly in DB, return headers dict with Bearer token."""
    with app.app_context():
        from models import User, Provider
        from flask_jwt_extended import create_access_token
        user = User(email='provider@example.com', full_name='Test Provider', role='provider')
        user.set_password('password123')
        user.email_verified = True  # Mark as verified for testing
        user.verified_at = db.func.now()
        db.session.add(user)
        db.session.flush()
        p = Provider(user_id=user.id, organisation_name='Test Org', abn='12345678901')
        db.session.add(p)
        db.session.commit()
        token = create_access_token(identity=str(user.id))
        return {'Authorization': f'Bearer {token}', '_cv_app': app}
