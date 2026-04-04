import os
from datetime import timedelta

class Config:
    SECRET_KEY=os.environ.get('SECRET_KEY', 'dev-secret-change-in-production')
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'postgresql://postgres:***@localhost:5432/careexchange'
    )
    # Add connection timeout so gunicorn doesn't hang at startup
    SQLALCHEMY_ENGINE_OPTIONS = {
        'connect_args': {'options': '-c statement_timeout=10000'},
        'pool_pre_ping': True,
        'pool_recycle': 300,
    }
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY=os.environ.get('JWT_SECRET_KEY', SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES=timedelta(minutes=15)
    JWT_REFRESH_TOKEN_EXPIRES=timedelta(days=30)
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', '/tmp/careexchange/uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    # Resend email API key (optional - emails print to console if not set)
    RESEND_API_KEY=os.environ.get('RESEND_API_KEY')

    # S3 / R2 presigned URL storage
    # Use AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY + S3_BUCKET for S3
    # Or CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_R2_ACCESS_KEY_ID + CLOUDFLARE_R2_SECRET_ACCESS_KEY + R2_BUCKET for R2
    AWS_ACCESS_KEY_ID=os.environ.get('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY=os.environ.get('AWS_SECRET_ACCESS_KEY')
    AWS_REGION=os.environ.get('AWS_REGION', 'us-east-1')
    S3_BUCKET=os.environ.get('S3_BUCKET')
    CLOUDFLARE_ACCOUNT_ID=os.environ.get('CLOUDFLARE_ACCOUNT_ID')
    CLOUDFLARE_R2_ACCESS_KEY_ID=os.environ.get('CLOUDFLARE_R2_ACCESS_KEY_ID')
    CLOUDFLARE_R2_SECRET_ACCESS_KEY=os.environ.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY')
    R2_BUCKET=os.environ.get('R2_BUCKET')
    # CDN base URL for serving files (e.g. https://cdn.careexchange.com or R2 public URL)
    CDN_BASE_URL=os.environ.get('CDN_BASE_URL')


class DevelopmentConfig(Config):
    DEBUG = True
    # Don't use Postgres-specific connect_args when running with SQLite
    SQLALCHEMY_ENGINE_OPTIONS = {}


class ProductionConfig(Config):
    DEBUG = False
