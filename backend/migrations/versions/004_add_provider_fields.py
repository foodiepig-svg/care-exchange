"""add provider location and contact_email"""
from alembic import op
import sqlalchemy as sa

revision = '004_add_provider_fields'
down_revision = '003_add_goals_careplans_documents'

def upgrade():
    op.add_column('providers', sa.Column('contact_email', sa.String(255), nullable=True))
    op.add_column('providers', sa.Column('location', sa.String(255), nullable=True))

def downgrade():
    op.drop_column('providers', 'location')
    op.drop_column('providers', 'contact_email')
