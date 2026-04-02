"""
Add reset_token columns to users

Revision ID: add_reset_token
Revises: 001_initial
Create Date: 2026-04-03

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'add_reset_token'
down_revision = '001_initial'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('users', sa.Column('reset_token', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('reset_token_expires_at', sa.DateTime(), nullable=True))

def downgrade():
    op.drop_column('users', 'reset_token_expires_at')
    op.drop_column('users', 'reset_token')
