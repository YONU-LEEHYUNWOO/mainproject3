"""
약 알림 관련 Pydantic 스키마
약 관리 기능을 위한 요청/응답 모델입니다.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, time, datetime

class MedicineAlarmBase(BaseModel):
    """약 알림 기본 스키마"""
    medicine_name: str = Field(..., min_length=1, max_length=100)
    dosage: Optional[str] = Field(None, max_length=50)
    frequency: Optional[str] = Field(None, max_length=50)
    instructions: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    is_active: bool = True
    reminder_enabled: bool = True
    reminder_minutes: int = Field(0, ge=0)
    time_1: Optional[time] = None
    time_2: Optional[time] = None
    time_3: Optional[time] = None
    time_4: Optional[time] = None

class MedicineAlarmCreate(MedicineAlarmBase):
    """약 알림 생성 스키마"""
    pass

class MedicineAlarmUpdate(BaseModel):
    """약 알림 업데이트 스키마"""
    medicine_name: Optional[str] = Field(None, min_length=1, max_length=100)
    dosage: Optional[str] = Field(None, max_length=50)
    frequency: Optional[str] = Field(None, max_length=50)
    instructions: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None
    reminder_enabled: Optional[bool] = None
    reminder_minutes: Optional[int] = Field(None, ge=0)
    time_1: Optional[time] = None
    time_2: Optional[time] = None
    time_3: Optional[time] = None
    time_4: Optional[time] = None

class MedicineAlarmResponse(MedicineAlarmBase):
    """약 알림 응답 스키마"""
    id: int
    user_id: int
    last_taken: Optional[datetime] = None
    next_reminder: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MedicineAlarmListResponse(BaseModel):
    """약 알림 목록 응답 스키마"""
    alarms: List[MedicineAlarmResponse]
    total: int

class MedicineTakenRequest(BaseModel):
    """약 복용 완료 요청 스키마"""
    alarm_id: int

class MedicineTakenResponse(BaseModel):
    """약 복용 완료 응답 스키마"""
    success: bool
    message: str
    next_reminder: Optional[datetime] = None