"""
건강 기록 모델
사용자의 혈압, 혈당, 체중 등 건강 정보를 관리합니다.
"""

from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import BaseModel

class HealthRecord(BaseModel):
    """건강 기록 모델"""
    __tablename__ = "health_records"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    record_type = Column(String(50), nullable=False, index=True)  # blood_pressure, glucose, weight
    
    # 혈압 (blood_pressure일 때만 사용)
    systolic = Column(Integer, nullable=True)  # 수축기 혈압
    diastolic = Column(Integer, nullable=True)  # 이완기 혈압
    
    # 혈당 (glucose일 때만 사용)
    glucose = Column(Float, nullable=True)  # mg/dL
    
    # 체중 (weight일 때만 사용)
    weight = Column(Float, nullable=True)  # kg
    
    # 측정 시간
    measured_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # 메모
    notes = Column(Text, nullable=True)

    # 관계 설정
    user = relationship("User")

    def __repr__(self):
        return f"<HealthRecord(id={self.id}, user_id={self.user_id}, type={self.record_type})>"
    
    def to_dict(self):
        """딕셔너리 변환"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "record_type": self.record_type,
            "systolic": self.systolic,
            "diastolic": self.diastolic,
            "glucose": self.glucose,
            "weight": self.weight,
            "measured_at": self.measured_at.isoformat() if self.measured_at else None,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
