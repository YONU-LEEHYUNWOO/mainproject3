"""
건강 기록 관련 Pydantic 스키마
"""

from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

class HealthRecordCreate(BaseModel):
    """건강 기록 생성 요청"""
    record_type: str = Field(..., description="blood_pressure, glucose, weight")
    systolic: Optional[int] = Field(None, ge=50, le=250, description="수축기 혈압")
    diastolic: Optional[int] = Field(None, ge=30, le=150, description="이완기 혈압")
    glucose: Optional[float] = Field(None, ge=0, le=600, description="혈당 (mg/dL)")
    weight: Optional[float] = Field(None, ge=0, le=300, description="체중 (kg)")
    measured_at: Optional[datetime] = None
    notes: Optional[str] = Field(None, max_length=500)

    @validator('record_type')
    def validate_record_type(cls, v):
        allowed = ['blood_pressure', 'glucose', 'weight']
        if v not in allowed:
            raise ValueError(f'record_type must be one of {allowed}')
        return v

    @validator('systolic', 'diastolic')
    def validate_blood_pressure(cls, v, values):
        if values.get('record_type') == 'blood_pressure' and v is None:
            raise ValueError('혈압 기록 시 수축기/이완기 혈압이 필요합니다')
        return v

    @validator('glucose')
    def validate_glucose(cls, v, values):
        if values.get('record_type') == 'glucose' and v is None:
            raise ValueError('혈당 기록 시 혈당 값이 필요합니다')
        return v

    @validator('weight')
    def validate_weight(cls, v, values):
        if values.get('record_type') == 'weight' and v is None:
            raise ValueError('체중 기록 시 체중 값이 필요합니다')
        return v

class HealthRecordResponse(BaseModel):
    """건강 기록 응답"""
    id: int
    user_id: int
    record_type: str
    systolic: Optional[int]
    diastolic: Optional[int]
    glucose: Optional[float]
    weight: Optional[float]
    measured_at: datetime
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class HealthRecordListResponse(BaseModel):
    """건강 기록 목록 응답"""
    records: list[HealthRecordResponse]
    total: int

class HealthStatsResponse(BaseModel):
    """건강 통계 응답"""
    record_type: str
    avg_systolic: Optional[float] = None
    avg_diastolic: Optional[float] = None
    avg_glucose: Optional[float] = None
    avg_weight: Optional[float] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    latest_record: Optional[HealthRecordResponse] = None
    total_count: int
