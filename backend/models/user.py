"""
사용자 모델
사용자 정보 및 인증 관련 데이터를 관리합니다.
"""

from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import BaseModel

class User(BaseModel):
    """사용자 모델"""
    __tablename__ = "users"

    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    last_login = Column(DateTime, nullable=True)

    # 관계 설정 (lazy loading으로 성능 최적화)
    tasks = relationship("Task", back_populates="owner", lazy="dynamic")
    chat_messages = relationship("ChatMessage", back_populates="user", lazy="dynamic")
    ai_conversations = relationship("AIConversation", back_populates="user", lazy="dynamic")
    guardians = relationship("Guardian", back_populates="user", lazy="dynamic")
    medicines = relationship("Medicine", back_populates="owner", lazy="dynamic")
    medicine_alarms = relationship("MedicineAlarm", back_populates="user", lazy="dynamic")
    notification_logs = relationship("NotificationLog", back_populates="user", lazy="dynamic")

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, email={self.email})>"

    def is_authenticated(self):
        """사용자가 인증되었는지 확인"""
        return self.is_active

    def is_admin(self):
        """관리자 권한 확인"""
        return self.is_superuser