"""Add goals, care_plans, documents tables

Revision ID: 003_add_goals_careplans_documents
Revises: 002_add_reset_token
Create Date: 2026-04-03

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision: str = '003_add_goals_careplans_documents'
down_revision: Union[str, None] = '002_add_reset_token'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'goals',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('participant_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=50), nullable=True),
        sa.Column('target_date', sa.Date(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='active'),
        sa.Column('progress', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('created_by_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['participant_id'], ['participants.id'], ),
        sa.ForeignKeyConstraint(['created_by_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'care_plans',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('participant_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='active'),
        sa.Column('supports', sa.Text(), nullable=True),
        sa.Column('review_notes', sa.Text(), nullable=True),
        sa.Column('created_by_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['participant_id'], ['participants.id'], ),
        sa.ForeignKeyConstraint(['created_by_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'documents',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('participant_id', sa.Integer(), nullable=False),
        sa.Column('uploaded_by_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('filename', sa.String(length=255), nullable=False),
        sa.Column('original_filename', sa.String(length=255), nullable=False),
        sa.Column('file_type', sa.String(length=50), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=True),
        sa.Column('category', sa.String(length=50), nullable=True, server_default='general'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['participant_id'], ['participants.id'], ),
        sa.ForeignKeyConstraint(['uploaded_by_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_documents_participant_id'), 'documents', ['participant_id'], unique=False)

    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('body', sa.Text(), nullable=True),
        sa.Column('read', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('link', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_notifications_user_id'), 'notifications', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_notifications_user_id'), table_name='notifications')
    op.drop_index(op.f('ix_documents_participant_id'), table_name='documents')
    op.drop_table('documents')
    op.drop_table('care_plans')
    op.drop_table('goals')
