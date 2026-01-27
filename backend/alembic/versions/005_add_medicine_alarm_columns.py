"""add medicine alarm columns

Revision ID: 005_add_medicine_alarm_columns
Revises: 004_add_notification_settings
Create Date: 2025-01-27 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '005_add_medicine_alarm_columns'
down_revision = '004_add_notification_settings'
branch_labels = None
depends_on = None


def upgrade():
    """medicine_alarms 테이블에 누락된 컬럼들 추가"""
    
    # morning 컬럼 추가
    try:
        op.add_column('medicine_alarms', sa.Column('morning', sa.Boolean(), nullable=False, server_default='0'))
    except Exception:
        pass  # 이미 존재하는 경우 무시
    
    # lunch 컬럼 추가
    try:
        op.add_column('medicine_alarms', sa.Column('lunch', sa.Boolean(), nullable=False, server_default='0'))
    except Exception:
        pass  # 이미 존재하는 경우 무시
    
    # evening 컬럼 추가
    try:
        op.add_column('medicine_alarms', sa.Column('evening', sa.Boolean(), nullable=False, server_default='0'))
    except Exception:
        pass  # 이미 존재하는 경우 무시
    
    # postponed_until 컬럼 추가
    try:
        op.add_column('medicine_alarms', sa.Column('postponed_until', sa.DateTime(), nullable=True))
    except Exception:
        pass  # 이미 존재하는 경우 무시
    
    # daily_taken_times 컬럼 추가
    try:
        op.add_column('medicine_alarms', sa.Column('daily_taken_times', sa.String(500), nullable=True, server_default=''))
    except Exception:
        pass  # 이미 존재하는 경우 무시
    
    # current_stock 컬럼 추가
    try:
        op.add_column('medicine_alarms', sa.Column('current_stock', sa.Integer(), nullable=False, server_default='0'))
    except Exception:
        pass  # 이미 존재하는 경우 무시
    
    # reorder_threshold 컬럼 추가
    try:
        op.add_column('medicine_alarms', sa.Column('reorder_threshold', sa.Integer(), nullable=False, server_default='5'))
    except Exception:
        pass  # 이미 존재하는 경우 무시
    
    # prescription_info 컬럼 추가
    try:
        op.add_column('medicine_alarms', sa.Column('prescription_info', sa.Text(), nullable=True))
    except Exception:
        pass  # 이미 존재하는 경우 무시
    
    # favorite_pharmacy_id 컬럼 추가
    try:
        op.add_column('medicine_alarms', sa.Column('favorite_pharmacy_id', sa.Integer(), nullable=True))
    except Exception:
        pass  # 이미 존재하는 경우 무시


def downgrade():
    """추가된 컬럼들 제거"""
    try:
        op.drop_column('medicine_alarms', 'favorite_pharmacy_id')
    except Exception:
        pass
    try:
        op.drop_column('medicine_alarms', 'prescription_info')
    except Exception:
        pass
    try:
        op.drop_column('medicine_alarms', 'reorder_threshold')
    except Exception:
        pass
    try:
        op.drop_column('medicine_alarms', 'current_stock')
    except Exception:
        pass
    try:
        op.drop_column('medicine_alarms', 'daily_taken_times')
    except Exception:
        pass
    try:
        op.drop_column('medicine_alarms', 'postponed_until')
    except Exception:
        pass
    try:
        op.drop_column('medicine_alarms', 'evening')
    except Exception:
        pass
    try:
        op.drop_column('medicine_alarms', 'lunch')
    except Exception:
        pass
    try:
        op.drop_column('medicine_alarms', 'morning')
    except Exception:
        pass
