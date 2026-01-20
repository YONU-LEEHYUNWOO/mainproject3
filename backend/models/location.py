"""
위치 모델
사용자의 위치 정보를 관리합니다.
"""

from sqlalchemy import Column, Integer, Float, DateTime, String, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class Location(BaseModel):
    """위치 모델"""
    __tablename__ = "locations"

    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    accuracy = Column(Float, nullable=True)  # GPS 정확도 (미터)
    address = Column(String(255), nullable=True)  # 주소 정보
    location_type = Column(String(20), default="current", nullable=False)  # current, home, work, etc.

    # 외래 키
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # 관계 설정
    user = relationship("User", back_populates="locations")

    def __repr__(self):
        return f"<Location(id={self.id}, user_id={self.user_id}, lat={self.latitude}, lng={self.longitude})>"