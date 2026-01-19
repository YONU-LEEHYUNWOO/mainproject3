"""
약 관리 모델
사용자의 약 정보를 관리합니다.
"""

from sqlalchemy import Column, String, Text, Time, Boolean, Integer, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel


class Medicine(BaseModel):
    """약 모델"""
    __tablename__ = "medicines"

    name: str = Column(String(200), nullable=False)  # 약 이름
    description: str = Column(Text, nullable=True)  # 약 설명
    dosage: str = Column(String(100), nullable=True)  # 복용량 (예: "1정", "2캡슐")
    frequency: str = Column(String(50), nullable=False, default="1일 1회")  # 복용 빈도
    instructions: str = Column(Text, nullable=True)  # 복용 지침

    # 외래 키
    owner_id: int = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # 관계 설정
    owner = relationship("User", back_populates="medicines")
    # MedicineAlarm은 독립적인 모델이므로 관계 제거

    def __repr__(self):
        return f"<Medicine(id={self.id}, name={self.name}, frequency={self.frequency})>"