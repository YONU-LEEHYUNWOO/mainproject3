"""
보호자 모델
사용자의 보호자 정보를 관리합니다.
"""

from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship as sa_relationship
from .base import BaseModel

from datetime import datetime

class Guardian(BaseModel):
    """보호자 모델"""
    __tablename__ = "guardians"
    
    # 중복 방지: 같은 (user_id, guardian_user_id) 조합은 1개만 허용
    __table_args__ = (
        UniqueConstraint('user_id', 'guardian_user_id', name='unique_guardian_relationship'),
    )

    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    email = Column(String(100), nullable=True)
    relationship_type = Column(String(50), nullable=False)  # 가족관계 (자녀, 배우자, etc.)
    is_primary = Column(Boolean, default=False, nullable=False)  # 주보호자 여부
    emergency_contact = Column(Boolean, default=False, nullable=False)  # 긴급연락처 여부
    notification_enabled = Column(Boolean, default=True, nullable=False)  # 알림 수신 여부
    access_level = Column(String(20), default="view", nullable=False)  # view, edit, admin

    # SQLite Datetime 파싱 오류 방지를 위해 String으로 재정의
    created_at = Column(String, default=lambda: datetime.now().isoformat(), nullable=False)
    updated_at = Column(String, default=lambda: datetime.now().isoformat(), onupdate=lambda: datetime.now().isoformat(), nullable=False)

    # Pydantic 호환성을 위한 프로퍼티
    @property
    def relationship(self):
        return self.relationship_type
    
    @relationship.setter
    def relationship(self, value):
        self.relationship_type = value

    # 외래 키
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)  # 보호받는 사람 (자식)
    guardian_user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)  # 보호자 User ID (부모)

    # 관계 설정
    user = sa_relationship("User", foreign_keys=[user_id], backref="guardians")
    guardian_user = sa_relationship("User", foreign_keys=[guardian_user_id])

    def __repr__(self):
        return f"<Guardian(id={self.id}, name={self.name}, relationship={self.relationship_type}, user_id={self.user_id}, guardian_user_id={self.guardian_user_id})>"

    def get_relationship_display(self):
        """관계 텍스트 반환"""
        relationships = {
            "child": "자녀",
            "spouse": "배우자",
            "sibling": "형제자매",
            "parent": "부모",
            "relative": "친척",
            "friend": "친구",
            "caregiver": "요양보호사",
            "other": "기타"
        }
        return relationships.get(self.relationship_type, self.relationship_type)

    def get_access_level_display(self):
        """접근 권한 텍스트 반환"""
        levels = {
            "view": "조회만",
            "edit": "편집가능",
            "admin": "관리자"
        }
        return levels.get(self.access_level, self.access_level)

    def can_edit(self):
        """편집 권한 확인"""
        return self.access_level in ["edit", "admin"]

    def can_admin(self):
        """관리자 권한 확인"""
        return self.access_level == "admin"