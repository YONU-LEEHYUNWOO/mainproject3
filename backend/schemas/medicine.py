"""
약 관련 Pydantic 스키마
약 및 약 알림 CRUD를 위한 요청/응답 모델입니다.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import time, datetime


# 약 스키마
class MedicineBase(BaseModel):
    """약 기본 스키마"""
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    dosage: Optional[str] = Field(None, max_length=100)
    frequency: str = Field("1일 1회", max_length=50)
    instructions: Optional[str] = None


class MedicineCreate(MedicineBase):
    """약 생성 스키마"""
    pass


class MedicineUpdate(BaseModel):
    """약 업데이트 스키마"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    dosage: Optional[str] = Field(None, max_length=100)
    frequency: Optional[str] = Field(None, max_length=50)
    instructions: Optional[str] = None


class MedicineResponse(MedicineBase):
    """약 응답 스키마"""
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MedicineListResponse(BaseModel):
    """약 목록 응답 스키마"""
    medicines: List[MedicineResponse]
    total: int
    page: int
    per_page: int


# 약 알림 스키마
class MedicineAlarmBase(BaseModel):
    """약 알림 기본 스키마"""
    alarm_time: time
    days_of_week: str = Field("0123456", max_length=20)  # 0=일, 1=월, ..., 6=토
    is_active: bool = True


class MedicineAlarmCreate(MedicineAlarmBase):
    """약 알림 생성 스키마"""
    medicine_id: int


class MedicineAlarmUpdate(BaseModel):
    """약 알림 업데이트 스키마"""
    alarm_time: Optional[time] = None
    days_of_week: Optional[str] = Field(None, max_length=20)
    is_active: Optional[bool] = None


class MedicineAlarmResponse(MedicineAlarmBase):
    """약 알림 응답 스키마"""
    id: int
    medicine_id: int
    user_id: int
    taken_at: Optional[datetime] = None
    skipped_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MedicineAlarmListResponse(BaseModel):
    """약 알림 목록 응답 스키마"""
    alarms: List[MedicineAlarmResponse]
    total: int
    page: int
    per_page: int


# 복용 기록 스키마
class MedicineTakenRecord(BaseModel):
    """약 복용 기록 스키마"""
    alarm_id: int
    taken: bool = True  # True=복용함, False=건너뜀