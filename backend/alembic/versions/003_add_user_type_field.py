"""add user_type field to users table

Revision ID: 003
Revises: 002
Create Date: 2024-01-19 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade():
    # user_type 필드 추가
    op.add_column('users', sa.Column('user_type', sa.String(20), nullable=False, default='parent'))


def downgrade():
    # user_type 필드 제거
    op.drop_column('users', 'user_type')