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
    time_1: time = Column(Time, nullable=True)
    time_2: time = Column(Time, nullable=True)
    time_3: time = Column(Time, nullable=True)
    time_4: time = Column(Time, nullable=True)

    # 복용 시간 타입 (아침/점심/저녁)
    morning: bool = Column(Boolean, default=False)
    lunch: bool = Column(Boolean, default=False)
    evening: bool = Column(Boolean, default=False)

    # 복용 상태
    last_taken: datetime = Column(DateTime, nullable=True)
    next_reminder: datetime = Column(DateTime, nullable=True)
    # 오늘 복용한 시간 목록 (콤마로 구분, 예: "08:00,12:00")
    # 매일 자정 또는 첫 조회 시 리셋 필요
    daily_taken_times: str = Column(String(500), default="", nullable=True)

    # 재고 및 처방전 정보
    current_stock: int = Column(Integer, default=0)
    reorder_threshold: int = Column(Integer, default=5)
    prescription_info: str = Column(Text, nullable=True)
    favorite_pharmacy_id: int = Column(Integer, nullable=True)

    # 외래 키
    user_id: int = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # 관계 설정
    user = relationship("User", back_populates="medicine_alarms")
    tasks = relationship("Task", back_populates="medicine_alarm", cascade="all, delete-orphan")

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

    def mark_taken(self, time_str=None):
        """복용 완료 처리 및 기록"""
        now = datetime.now()
        today_date = now.date()
        
        # 마지막 복용 날짜가 오늘이 아니면 기록 초기화
        if self.last_taken and self.last_taken.date() != today_date:
            self.daily_taken_times = ""
        
        self.last_taken = now
        
        if time_str:
            # 이미 기록된 시간이 아니면 추가
            current_taken = self.daily_taken_times.split(",") if self.daily_taken_times else []
            if time_str not in current_taken:
                current_taken.append(time_str)
                self.daily_taken_times = ",".join(current_taken)
        
        self.calculate_next_reminder()
