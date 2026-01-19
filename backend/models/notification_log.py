"""
알림 로그 모델
알림 실행 이력을 저장합니다.
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .base import Base


class NotificationLog(Base):
    """
    알림 로그 모델
    """
    __tablename__ = "notification_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # 외래키
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 알림 정보
    notification_type = Column(String(50), nullable=False)  # 'task_reminder', 'medicine_reminder' 등
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=True)

    # 알림 상태
    sent_at = Column(DateTime(timezone=True), nullable=True)
    is_success = Column(Boolean, default=False)
    error_message = Column(Text, nullable=True)

    # 관계
    task = relationship("Task", back_populates="notification_logs")
    user = relationship("User", back_populates="notification_logs")

    def __repr__(self):
        return f"<NotificationLog(id={self.id}, task_id={self.task_id}, type={self.notification_type}, success={self.is_success})>"