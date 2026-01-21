from pydantic import BaseModel, Field, EmailStr, AliasChoices
from typing import Optional, Union
from datetime import datetime

class GuardianBase(BaseModel):
    """보호자 기본 스키마"""
    name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    relationship: Optional[str] = Field(None, max_length=50, validation_alias=AliasChoices("relationship", "relationship_type"), serialization_alias="relationship")  # 가족관계
    guardian_user_id: Optional[int] = None  # 보호자 User ID
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
    guardian_user_id: Optional[int] = None
    is_primary: Optional[bool] = None
    emergency_contact: Optional[bool] = None
    notification_enabled: Optional[bool] = None
    access_level: Optional[str] = Field(None, max_length=20)

class GuardianResponse(GuardianBase):
    """보호자 응답 스키마"""
    id: int
    user_id: int
    guardian_user_id: Optional[int] = None
    created_at: Union[datetime, str]
    updated_at: Union[datetime, str]

    class Config:
        from_attributes = True

class GuardianListResponse(BaseModel):
    """보호자 목록 응답 스키마"""
    guardians: list[GuardianResponse]
    total: int