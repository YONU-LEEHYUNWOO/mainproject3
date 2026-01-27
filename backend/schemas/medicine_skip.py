"""
약 건너뛰기 관련 Pydantic 스키마
"""

from pydantic import BaseModel
from typing import Optional
from datetime import date, time, datetime

class MedicinePostponeRequest(BaseModel):
    """약 미루기 요청"""
    minutes: int  # 10, 30, 60

class MedicineSkipRequest(BaseModel):
    """약 건너뛰기 요청"""
    time: str  # "08:00"
    reason: str  # "side_effect", "poor_condition", etc.
    reason_detail: Optional[str] = None

class MedicineSkipLogResponse(BaseModel):
    """약 건너뛰기 로그 응답"""
    id: int
    medicine_alarm_id: int
    user_id: int
    skip_date: date
    skip_time: time
    reason: str
    reason_detail: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
