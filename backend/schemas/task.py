"""
일정 관련 Pydantic 스키마
일정 CRUD를 위한 요청/응답 모델입니다.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, Union
from datetime import date, time, datetime

class TaskBase(BaseModel):
    """일정 기본 스키마"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    date: date
    time: Optional[time] = None
    location: Optional[str] = Field(None, max_length=255)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    completed: bool = False
    priority: int = Field(1, ge=1, le=3)  # 1: 낮음, 2: 보통, 3: 높음
    reminder_minutes: int = Field(0, ge=0)  # 사전 알림 시간 (분)
    category: str = Field("일반", max_length=50)

class TaskCreate(BaseModel):
    """일정 생성 스키마"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    date: date
    time: Optional[Union[str, time]] = None  # 문자열 또는 time 객체 허용
    location: Optional[str] = Field(None, max_length=255)
    priority: int = Field(2, ge=1, le=3)
    category: str = Field("일반", max_length=50)
    completed: bool = False
    reminder_minutes: int = Field(0, ge=0)

    @field_validator('date', mode='before')
    @classmethod
    def parse_date(cls, v):
        if isinstance(v, str):
            return date.fromisoformat(v)
        return v

    @field_validator('time', mode='before')
    @classmethod
    def parse_time(cls, v):
        if v is None:
            return None
        if isinstance(v, str) and v.strip():
            # "HH:MM" 형식의 문자열을 time 객체로 변환
            try:
                hour, minute = map(int, v.strip().split(':'))
                return time(hour=hour, minute=minute)
            except ValueError:
                raise ValueError(f"Invalid time format: {v}")
        return None

class TaskUpdate(BaseModel):
    """일정 업데이트 스키마"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    date: Optional[date] = None
    time: Optional[time] = None
    location: Optional[str] = Field(None, max_length=255)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    completed: Optional[bool] = None
    priority: Optional[int] = Field(None, ge=1, le=3)
    reminder_minutes: Optional[int] = Field(None, ge=0)
    category: Optional[str] = Field(None, max_length=50)

class TaskResponse(TaskBase):
    """일정 응답 스키마"""
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TaskListResponse(BaseModel):
    """일정 목록 응답 스키마"""
    tasks: list[TaskResponse]
    total: int
    page: int
    per_page: int

class TaskFilter(BaseModel):
    """일정 필터링 파라미터"""
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    completed: Optional[bool] = None
    priority: Optional[int] = Field(None, ge=1, le=3)
    category: Optional[str] = None
    search: Optional[str] = None  # 제목 또는 설명 검색