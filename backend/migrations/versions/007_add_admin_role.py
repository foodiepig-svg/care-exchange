"""Add admin role to check constraint + update referential integrity"""
from alembic import op
import sqlalchemy as sa

revision = '007_add_admin_role'
down_revision = '006_add_group_threads'
branch_labels = None
depends_on = None


def upgrade():
    # Drop the old constraint (if it exists with the old definition)
    op.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS check_user_role")
    # Re-add with admin role included
    op.execute(
        "ALTER TABLE users ADD CONSTRAINT check_user_role "
        "CHECK (role IN ('participant','family','provider','coordinator','admin'))"
    )


def downgrade():
    op.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS check_user_role")
    op.execute(
        "ALTER TABLE users ADD CONSTRAINT check_user_role "
        "CHECK (role IN ('participant','family','provider','coordinator'))"
    )
