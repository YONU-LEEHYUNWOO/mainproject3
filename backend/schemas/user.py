"""
사용자 관련 Pydantic 스키마
사용자 생성, 업데이트, 응답 데이터 검증을 위한 모델입니다.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    """사용자 기본 스키마"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    is_active: bool = True

class UserCreate(UserBase):
    """사용자 생성 스키마"""
    password: str = Field(..., min_length=6, max_length=100)

class UserUpdate(BaseModel):
    """사용자 업데이트 스키마"""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    is_active: Optional[bool] = None

class UserInDB(UserBase):
    """데이터베이스 내 사용자 스키마"""
    id: int
    hashed_password: str
    is_superuser: bool = False
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

class UserResponse(UserBase):
    """API 응답용 사용자 스키마"""
    id: int
    is_superuser: bool = False
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True