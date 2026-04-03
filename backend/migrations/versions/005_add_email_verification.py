"""
Add email verification fields to users

Revision ID: add_email_verification
Revises: 004_add_provider_fields
Create Date: 2026-04-03

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'add_email_verification'
down_revision = '004_add_provider_fields'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('email_verified', sa.Boolean(), nullable=True))
    op.add_column('users', sa.Column('verification_token', sa.String(length=64), nullable=True))
    op.add_column('users', sa.Column('verification_token_expires', sa.DateTime(), nullable=True))


def downgrade():
    op.drop_column('users', 'verification_token_expires')
    op.drop_column('users', 'verification_token')
    op.drop_column('users', 'email_verified')
