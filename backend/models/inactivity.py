"""
무활동 감지 모델
사용자의 활동 패턴 및 감지 설정을 관리합니다.
"""

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import BaseModel

class InactivitySettings(BaseModel):
    """무활동 감지 설정 모델"""
    __tablename__ = "inactivity_settings"

    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # 설정 기능 활성화 여부
    is_enabled = Column(Boolean, default=True, nullable=False)
    
    # 무활동 판단 기준 시간 (시간 단위)
    threshold_hours = Column(Integer, default=4, nullable=False)
    
    # 취침 시간 (이 시간에는 감지 제외)
    sleep_start = Column(String(5), default="22:00", nullable=False)  # HH:MM
    sleep_end = Column(String(5), default="07:00", nullable=False)    # HH:MM
    
    # 부모님께 확인 알림(핑) 보낼 횟수
    max_reminders = Column(Integer, default=3, nullable=False)
    
    # 보호자에게 연동 알림 보낼지 여부
    guardian_alert_enabled = Column(Boolean, default=True, nullable=False)

    # 관계
    user = relationship("User", backref="inactivity_settings_ref")

class InactivityLog(BaseModel):
    """무활동 감지 및 대응 로그"""
    __tablename__ = "inactivity_logs"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # 감지 시각
    detected_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # 현재 상태: 'detected' (감지됨), 'confirmed' (부모님 확인), 'alerted' (보호자 통보), 'resolved' (해결됨)
    status = Column(String(20), default="detected", nullable=False)
    
    # 보낸 핑(알림) 횟수
    reminder_count = Column(Integer, default=0, nullable=False)
    
    # 최종 해결 시각
    resolved_at = Column(DateTime, nullable=True)

    # 관계
    user = relationship("User", backref="inactivity_logs")
