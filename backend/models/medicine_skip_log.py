"""
약 건너뛰기 로그 모델
약 복용을 건너뛴 이력을 관리합니다.
"""

from sqlalchemy import Column, Integer, String, ForeignKey, Date, Time, Text
from sqlalchemy.orm import relationship
from .base import BaseModel

class MedicineSkipLog(BaseModel):
    """약 건너뛰기 로그 모델"""
    __tablename__ = "medicine_skip_logs"

    medicine_alarm_id = Column(Integer, ForeignKey("medicine_alarms.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    skip_date = Column(Date, nullable=False)  # 건너뛴 날짜
    skip_time = Column(Time, nullable=False)  # 건너뛴 시간 (08:00)
    reason = Column(String(100), nullable=False)  # 사유
    reason_detail = Column(Text, nullable=True)  # 상세 내용

    # 관계 설정
    medicine_alarm = relationship("MedicineAlarm")
    user = relationship("User")

    def __repr__(self):
        return f"<MedicineSkipLog(id={self.id}, user_id={self.user_id}, reason={self.reason})>"
    
    def get_reason_display(self):
        """사유 한글 표시"""
        reasons = {
            "side_effect": "부작용",
            "not_feeling_well": "속이 좋지 않음",
            "poor_condition": "컨디션 불량",
            "out_of_stock": "약이 없음",
            "forgot": "깜빡함",
            "other": "기타"
        }
        return reasons.get(self.reason, self.reason)
