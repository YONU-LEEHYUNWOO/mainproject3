"""
보호자 관련 Pydantic 스키마
보호자 관리를 위한 요청/응답 모델입니다.
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class GuardianBase(BaseModel):
    """보호자 기본 스키마"""
    name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    relationship: str = Field(..., max_length=50)  # 가족관계
    is_primary: bool = False
    emergency_contact: bool = False
    notification_enabled: bool = True
    access_level: str = Field("view", max_length=20)  # view, edit, admin

class GuardianCreate(GuardianBase):
    """보호자 생성 스키마"""
    pass

class GuardianUpdate(BaseModel):
    """보호자 업데이트 스키마"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    relationship: Optional[str] = Field(None, max_length=50)
    is_primary: Optional[bool] = None
    emergency_contact: Optional[bool] = None
    notification_enabled: Optional[bool] = None
    access_level: Optional[str] = Field(None, max_length=20)

class GuardianResponse(GuardianBase):
    """보호자 응답 스키마"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class GuardianListResponse(BaseModel):
    """보호자 목록 응답 스키마"""
    guardians: list[GuardianResponse]
    total: int