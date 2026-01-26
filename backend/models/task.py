"""
일정 모델
사용자의 일정 정보를 관리합니다.
"""

from sqlalchemy import Column, String, Text, Date, Time, Boolean, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class Task(BaseModel):
    """일정 모델"""
    __tablename__ = "tasks"

    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    date = Column(Date, nullable=False, index=True)
    time = Column(Time, nullable=True)
    location = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=True)  # GPS 좌표
    longitude = Column(Float, nullable=True)
    completed = Column(Boolean, default=False, nullable=False)
    priority = Column(Integer, default=1, nullable=False)  # 1: 낮음, 2: 보통, 3: 높음
    reminder_minutes = Column(Integer, default=0, nullable=False)  # 알림 시간 (분)
    category = Column(String(50), default="일반", nullable=False)  # 일정 카테고리

    # 외래 키
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    medicine_alarm_id = Column(Integer, ForeignKey("medicine_alarms.id"), nullable=True)

    # 관계 설정
    owner = relationship("User", back_populates="tasks")
    medicine_alarm = relationship("MedicineAlarm", back_populates="tasks")
    notification_logs = relationship("NotificationLog", back_populates="task")

    def __repr__(self):
        return f"<Task(id={self.id}, title={self.title}, date={self.date}, completed={self.completed})>"

    def is_overdue(self):
        """일정이 기한이 지났는지 확인"""
        from datetime import datetime, date, time
        now = datetime.now()

        if self.date < now.date():
            return True
        elif self.date == now.date() and self.time and self.time < now.time():
            return True
        return False

    def get_priority_display(self):
        """우선순위 텍스트 반환"""
        priorities = {1: "낮음", 2: "보통", 3: "높음"}
        return priorities.get(self.priority, "보통")

    def get_category_display(self):
        """카테고리 텍스트 반환"""
        categories = {
            "일반": "일반",
            "의료": "의료",
            "약": "약",
            "운동": "운동",
            "식사": "식사",
            "외출": "외출"
        }
        return categories.get(self.category, self.category)