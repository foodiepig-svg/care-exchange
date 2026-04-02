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
    """Register and login a test participant, return headers dict with Bearer token."""
    res = client.post('/api/v1/auth/register', json={
        'email': 'testuser@example.com',
        'password': 'password123',
        'full_name': 'Test User',
        'role': 'participant'
    })
    data = res.get_json()
    token = data.get('access_token', '')
    return {'Authorization': f'Bearer {token}', '_cv_app': app}


@pytest.fixture
def auth_headers_provider(app, client):
    """Register and login a test provider, return headers dict with Bearer token."""
    res = client.post('/api/v1/auth/register', json={
        'email': 'provider@example.com',
        'password': 'password123',
        'full_name': 'Test Provider',
        'role': 'provider',
        'organisation_name': 'Test Org',
        'abn': '12345678901'
    })
    data = res.get_json()
    token = data.get('access_token', '')
    return {'Authorization': f'Bearer {token}'}
