"""
일정 관련 Pydantic 스키마
일정 CRUD를 위한 요청/응답 모델입니다.
"""

from pydantic import BaseModel, Field, field_validator, field_serializer, model_validator
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
    """일정 생성 스키마 - 모든 날짜/시간 필드를 문자열 타입으로 정의"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    date: str  # date 객체 대신 문자열로 받음 (예: "2026-01-19")
    time: Optional[str] = None  # time 객체 대신 문자열로 받음 (예: "19:27")
    location: Optional[str] = Field(None, max_length=255)
    priority: int = Field(2, ge=1, le=3)
    category: str = Field("일반", max_length=50)
    completed: bool = False
    reminder_minutes: int = Field(0, ge=0)

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

class TaskResponse(BaseModel):
    """일정 응답 스키마 - 모든 날짜/시간 필드를 문자열 타입으로 정의"""
    id: int
    title: str
    description: Optional[str] = None
    date: str  # date 객체를 문자열로 변환
    time: Optional[str] = None  # time 객체를 문자열로 변환 (HH:MM 형식)
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    completed: bool = False
    priority: int = Field(1, ge=1, le=3)  # 1: 낮음, 2: 보통, 3: 높음
    reminder_minutes: int = Field(0, ge=0)  # 사전 알림 시간 (분)
    category: str = Field("일반", max_length=50)
    owner_id: int
    created_at: str  # datetime 객체를 문자열로 변환
    updated_at: str  # datetime 객체를 문자열로 변환

    @field_validator('date', mode='before')
    @classmethod
    def convert_date(cls, v):
        """date 객체를 문자열로 변환"""
        if isinstance(v, date):
            return str(v)
        return v

    @field_validator('time', mode='before')
    @classmethod
    def convert_time(cls, v):
        """time 객체를 HH:MM 형식 문자열로 변환"""
        if v is None:
            return None
        if isinstance(v, time):
            return v.strftime("%H:%M")
        return v

    @field_validator('created_at', mode='before')
    @classmethod
    def convert_created_at(cls, v):
        """datetime 객체를 ISO 형식 문자열로 변환"""
        if isinstance(v, datetime):
            return v.isoformat()
        return v

    @field_validator('updated_at', mode='before')
    @classmethod
    def convert_updated_at(cls, v):
        """datetime 객체를 ISO 형식 문자열로 변환"""
        if isinstance(v, datetime):
            return v.isoformat()
        return v

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