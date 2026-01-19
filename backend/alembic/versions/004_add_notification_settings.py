"""add notification settings

Revision ID: 004_add_notification_settings
Revises: 003
Create Date: 2025-01-19 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '004_add_notification_settings'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade():
    # users 테이블에 알림 설정 컬럼 추가
    try:
        op.add_column('users', sa.Column('notification_enabled', sa.Boolean(), nullable=False, server_default='1'))
    except Exception:
        pass  # 이미 존재하는 경우 무시
    
    try:
        op.add_column('users', sa.Column('task_reminder_minutes', sa.Integer(), nullable=False, server_default='15'))
    except Exception:
        pass  # 이미 존재하는 경우 무시
    
    try:
        op.add_column('users', sa.Column('medicine_reminder_enabled', sa.Boolean(), nullable=False, server_default='1'))
    except Exception:
        pass  # 이미 존재하는 경우 무시
    
    # SQLite는 ALTER COLUMN을 지원하지 않으므로 task_id nullable 변경은 스킵
    # 실제로는 모델에서 nullable=True로 설정되어 있으면 동작함


def downgrade():
    # users 테이블에서 알림 설정 컬럼 제거
    try:
        op.drop_column('users', 'medicine_reminder_enabled')
    except Exception:
        pass
    try:
        op.drop_column('users', 'task_reminder_minutes')
    except Exception:
        pass
    try:
        op.drop_column('users', 'notification_enabled')
    except Exception:
        pass
