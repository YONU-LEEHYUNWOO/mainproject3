"""
보호자 모델
사용자의 보호자 정보를 관리합니다.
"""

from sqlalchemy import Column, String, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class Guardian(BaseModel):
    """보호자 모델"""
    __tablename__ = "guardians"

    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    email = Column(String(100), nullable=True)
    relationship_type = Column(String(50), nullable=False)  # 가족관계 (자녀, 배우자, etc.)
    is_primary = Column(Boolean, default=False, nullable=False)  # 주보호자 여부
    emergency_contact = Column(Boolean, default=False, nullable=False)  # 긴급연락처 여부
    notification_enabled = Column(Boolean, default=True, nullable=False)  # 알림 수신 여부
    access_level = Column(String(20), default="view", nullable=False)  # view, edit, admin

    # 외래 키
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # 관계 설정
    user = relationship("User", back_populates="guardians")

    def __repr__(self):
        return f"<Guardian(id={self.id}, name={self.name}, relationship={self.relationship_type}, user_id={self.user_id})>"

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