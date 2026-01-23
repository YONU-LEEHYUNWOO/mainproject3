"""
무활동 감지 관련 스키마
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class InactivitySettingsBase(BaseModel):
    is_enabled: bool = True
    threshold_hours: int = Field(4, ge=1, le=24)
    sleep_start: str = Field("22:00", pattern=r"^\d{2}:\d{2}$") # HH:MM
    sleep_end: str = Field("07:00", pattern=r"^\d{2}:\d{2}$")   # HH:MM
    max_reminders: int = Field(3, ge=1, le=10)
    guardian_alert_enabled: bool = True

class InactivitySettingsUpdate(InactivitySettingsBase):
    pass

class InactivitySettingsResponse(InactivitySettingsBase):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True

class ActivityUpdate(BaseModel):
    activity_type: str = "heartbeat" # 'heartbeat', 'app_open', 'task_complete', 'banner_click' 등

class InactivityStatusResponse(BaseModel):
    user_id: int
    status: str # 'Active', 'Inactive', 'Sleep', 'Danger'
    last_activity_at: Optional[datetime] = None
    minutes_since_last_activity: int
    is_sleep_time: bool
    message: str
