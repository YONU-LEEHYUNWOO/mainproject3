"""
사용자 모델
사용자 정보 및 인증 관련 데이터를 관리합니다.
"""

from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import BaseModel
from .location import Location

class User(BaseModel):
    """사용자 모델"""
    __tablename__ = "users"

    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    user_type = Column(String(20), nullable=False, default='parent')  # 'parent' or 'child'
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    last_login = Column(DateTime, nullable=True)
    location_sharing_enabled = Column(Boolean, default=False, nullable=False)
    last_activity_at = Column(DateTime, default=datetime.utcnow, nullable=True)


    # 관계 설정 (lazy loading으로 성능 최적화)
    # 로그인 시 관계 로드 문제를 방지하기 위해 lazy="select" 사용
    tasks = relationship("Task", back_populates="owner", lazy="select")
    chat_messages = relationship("ChatMessage", back_populates="user", lazy="select")
    ai_conversations = relationship("AIConversation", back_populates="user", lazy="select")
    # guardians 관계는 Guardian 모델에서 backref로 설정됨
    # guardians = relationship("Guardian", back_populates="user", lazy="select")
    locations = relationship("Location", back_populates="user", lazy="select")
    favorite_places = relationship("FavoritePlace", back_populates="user", lazy="select")
    medicines = relationship("Medicine", back_populates="owner", lazy="select")
    medicine_alarms = relationship("MedicineAlarm", back_populates="user", lazy="select")
    notification_logs = relationship("NotificationLog", back_populates="user", lazy="select")

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, email={self.email})>"

    def is_authenticated(self):
        """사용자가 인증되었는지 확인"""
        return self.is_active

    def is_admin(self):
        """관리자 권한 확인"""
        return self.is_superuser