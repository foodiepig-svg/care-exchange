"""Add consent_history and goal_history tables.

Revision ID: 009_add_consent_history_and_goal_history
Revises: tickets_v1
Create Date: 2026-04-04
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '009_add_consent_history_and_goal_history'
down_revision: Union[str, None] = 'tickets_v1'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'consent_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('consent_id', sa.Integer(), nullable=True),
        sa.Column('participant_id', sa.Integer(), nullable=False),
        sa.Column('granted_to_id', sa.Integer(), nullable=False),
        sa.Column('data_categories', sa.Text(), nullable=True),
        sa.Column('action', sa.String(length=20), nullable=False),
        sa.Column('actor_id', sa.Integer(), nullable=False),
        sa.Column('note', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['consent_id'], ['consents.id'], ),
        sa.ForeignKeyConstraint(['participant_id'], ['participants.id'], ),
        sa.ForeignKeyConstraint(['granted_to_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['actor_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_consent_history_participant_id', 'consent_history', ['participant_id'], unique=False)
    op.create_index('ix_consent_history_consent_id', 'consent_history', ['consent_id'], unique=False)

    op.create_table(
        'goal_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('goal_id', sa.Integer(), nullable=False),
        sa.Column('participant_id', sa.Integer(), nullable=False),
        sa.Column('actor_id', sa.Integer(), nullable=True),
        sa.Column('action', sa.String(length=50), nullable=False),
        sa.Column('field_changed', sa.String(length=50), nullable=True),
        sa.Column('old_value', sa.Text(), nullable=True),
        sa.Column('new_value', sa.Text(), nullable=True),
        sa.Column('note', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['goal_id'], ['goals.id'], ),
        sa.ForeignKeyConstraint(['participant_id'], ['participants.id'], ),
        sa.ForeignKeyConstraint(['actor_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_goal_history_goal_id', 'goal_history', ['goal_id'], unique=False)
    op.create_index('ix_goal_history_participant_id', 'goal_history', ['participant_id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_goal_history_participant_id', table_name='goal_history')
    op.drop_index('ix_goal_history_goal_id', table_name='goal_history')
    op.drop_table('goal_history')
    op.drop_index('ix_consent_history_consent_id', table_name='consent_history')
    op.drop_index('ix_consent_history_participant_id', table_name='consent_history')
    op.drop_table('consent_history')
