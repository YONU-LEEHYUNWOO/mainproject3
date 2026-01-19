"""
약 알림 모델
약 복용 알림을 관리합니다.
"""

from sqlalchemy import Column, Time, Boolean, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base


class MedicineAlarm(Base):
    """약 알림 모델"""
    __tablename__ = "medicine_alarms"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # 알림 설정
    alarm_time: Time = Column(Time, nullable=False)  # 알림 시간
    days_of_week: str = Column(String(20), nullable=False, default="0123456")  # 요일 (0=일요일, 1=월요일...)
    is_active: bool = Column(Boolean, default=True, nullable=False)  # 알림 활성화 여부

    # 복용 상태
    taken_at: DateTime = Column(DateTime(timezone=True), nullable=True)  # 복용 완료 시간
    skipped_at: DateTime = Column(DateTime(timezone=True), nullable=True)  # 건너뛰기 시간

    # 외래 키
    medicine_id: int = Column(Integer, ForeignKey("medicines.id"), nullable=False, index=True)
    user_id: int = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # 관계 설정
    medicine = relationship("Medicine", back_populates="alarms")
    user = relationship("User", back_populates="medicine_alarms")

    def __repr__(self):
        return f"<MedicineAlarm(id={self.id}, medicine_id={self.medicine_id}, time={self.alarm_time}, active={self.is_active})>"

    def get_days_list(self):
        """요일 문자열을 리스트로 변환"""
        return [int(day) for day in self.days_of_week]

    def set_days_list(self, days):
        """요일 리스트를 문자열로 변환"""
        self.days_of_week = ''.join(str(day) for day in sorted(days))