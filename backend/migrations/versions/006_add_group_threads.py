"""
Add group messaging threads

Revision ID: 006_add_group_threads
Revises: 005_add_email_verification
Create Date: 2026-04-03

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '006_add_group_threads'
down_revision = '005_add_email_verification'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('threads', sa.Column('thread_type', sa.String(length=20), nullable=True, server_default='direct'))
    op.create_table('thread_participants',
        sa.Column('thread_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['thread_id'], ['threads.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('thread_id', 'user_id')
    )


def downgrade():
    op.drop_table('thread_participants')
    op.drop_column('threads', 'thread_type')
