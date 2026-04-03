"""
Add message attachments

Revision ID: 007_add_message_attachments
Revises: 006_add_group_threads
Create Date: 2026-04-03

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '007_add_message_attachments'
down_revision = '006_add_group_threads'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('messages', sa.Column('attachments', sa.JSON(), nullable=True))


def downgrade():
    op.drop_column('messages', 'attachments')
