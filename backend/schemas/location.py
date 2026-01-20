"""
위치 관련 Pydantic 스키마
위치 CRUD를 위한 요청/응답 모델입니다.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class LocationBase(BaseModel):
    """위치 기본 스키마"""
    latitude: float = Field(..., ge=-90, le=90, description="위도")
    longitude: float = Field(..., ge=-180, le=180, description="경도")
    accuracy: Optional[float] = Field(None, ge=0, description="GPS 정확도 (미터)")
    address: Optional[str] = Field(None, max_length=255, description="주소 정보")
    location_type: str = Field("current", max_length=20, description="위치 타입")

class LocationCreate(BaseModel):
    """위치 생성 스키마"""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    accuracy: Optional[float] = Field(None, ge=0)
    address: Optional[str] = Field(None, max_length=255)
    location_type: str = Field("current", max_length=20)

class LocationUpdate(BaseModel):
    """위치 업데이트 스키마"""
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    accuracy: Optional[float] = Field(None, ge=0)
    address: Optional[str] = Field(None, max_length=255)
    location_type: Optional[str] = Field(None, max_length=20)

class LocationResponse(BaseModel):
    """위치 응답 스키마"""
    id: int
    latitude: float
    longitude: float
    accuracy: Optional[float]
    address: Optional[str]
    location_type: str
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class LocationListResponse(BaseModel):
    """위치 목록 응답 스키마"""
    locations: list[LocationResponse]
    total: int