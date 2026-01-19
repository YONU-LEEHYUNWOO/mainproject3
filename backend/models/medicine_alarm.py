"""
약 알림 모델
약 복용 알림을 관리합니다.
"""

from sqlalchemy import Column, Time, Boolean, Integer, String, ForeignKey, DateTime, Date, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime, date, time
from .base import BaseModel


class MedicineAlarm(BaseModel):
    """약 알림 모델"""
    __tablename__ = "medicine_alarms"

    # 약 정보
    medicine_name: str = Column(String(100), nullable=False)  # 약 이름
    dosage: str = Column(String(50), nullable=True)  # 복용량
    frequency: str = Column(String(50), nullable=True)  # 복용 빈도
    instructions: str = Column(Text, nullable=True)  # 복용 지침

    # 기간 설정
    start_date: date = Column(Date, nullable=False)  # 시작일
    end_date: date = Column(Date, nullable=True)  # 종료일

    # 알림 설정
    is_active: bool = Column(Boolean, default=True, nullable=False)  # 알림 활성화 여부
    reminder_enabled: bool = Column(Boolean, default=True, nullable=False)  # 리마인더 활성화
    reminder_minutes: int = Column(Integer, default=0, nullable=False)  # 리마인더 시간 (분)

    # 복용 시간 (하루 최대 4회)
    time_1: time = Column(Time, nullable=True)  # 첫 번째 복용 시간
    time_2: time = Column(Time, nullable=True)  # 두 번째 복용 시간
    time_3: time = Column(Time, nullable=True)  # 세 번째 복용 시간
    time_4: time = Column(Time, nullable=True)  # 네 번째 복용 시간

    # 복용 상태
    last_taken: datetime = Column(DateTime, nullable=True)  # 마지막 복용 시간
    next_reminder: datetime = Column(DateTime, nullable=True)  # 다음 알림 시간

    # 외래 키
    user_id: int = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # 관계 설정
    user = relationship("User", back_populates="medicine_alarms")

    def __repr__(self):
        return f"<MedicineAlarm(id={self.id}, medicine_name={self.medicine_name}, active={self.is_active})>"

    def get_times(self):
        """설정된 복용 시간 목록 반환"""
        times = []
        if self.time_1:
            times.append(self.time_1)
        if self.time_2:
            times.append(self.time_2)
        if self.time_3:
            times.append(self.time_3)
        if self.time_4:
            times.append(self.time_4)
        return sorted(times)

    def should_remind(self):
        """지금 알림을 보내야 하는지 확인"""
        if not self.is_active or not self.reminder_enabled:
            return False
        
        today = date.today()
        if self.start_date > today:
            return False
        if self.end_date and self.end_date < today:
            return False
        
        return True

    def calculate_next_reminder(self):
        """다음 알림 시간 계산"""
        if not self.is_active or not self.reminder_enabled:
            self.next_reminder = None
            return
        
        times = self.get_times()
        if not times:
            self.next_reminder = None
            return
        
        now = datetime.now()
        today = now.date()
        current_time = now.time()
        
        # 오늘 남은 시간 중 가장 가까운 시간 찾기
        for alarm_time in times:
            if alarm_time > current_time:
                self.next_reminder = datetime.combine(today, alarm_time)
                return
        
        # 오늘 시간이 모두 지났으면 내일 첫 번째 시간
        if times:
            from datetime import timedelta
            tomorrow = today + timedelta(days=1)
            self.next_reminder = datetime.combine(tomorrow, times[0])

    def is_expired(self):
        """약 알림이 만료되었는지 확인"""
        if self.end_date:
            return date.today() > self.end_date
        return False

    def mark_taken(self):
        """복용 완료 처리"""
        self.last_taken = datetime.now()
        self.calculate_next_reminder()