"""
알림 로그 스키마
알림 실행 이력을 위한 Pydantic 스키마
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class NotificationLogBase(BaseModel):
    """알림 로그 기본 스키마"""
    task_id: Optional[int] = None
    notification_type: str
    title: str
    message: Optional[str] = None


class NotificationLogCreate(NotificationLogBase):
    """알림 로그 생성 스키마"""
    pass


class NotificationLogUpdate(BaseModel):
    """알림 로그 업데이트 스키마"""
    sent_at: Optional[datetime] = None
    is_success: Optional[bool] = None
    error_message: Optional[str] = None


class NotificationLogResponse(NotificationLogBase):
    """알림 로그 응답 스키마"""
    id: int
    user_id: int
    sent_at: Optional[datetime] = None
    is_success: bool
    is_read: bool = False
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NotificationLogListResponse(BaseModel):
    """알림 로그 목록 응답 스키마"""
    notification_logs: list[NotificationLogResponse]
    total: int
    page: int
    per_page: int