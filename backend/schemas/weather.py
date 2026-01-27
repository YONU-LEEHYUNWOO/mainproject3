from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class WeatherBase(BaseModel):
    temp: Optional[float] = None
    humidity: Optional[int] = None
    sky_status: Optional[str] = None
    rain_type: Optional[str] = None
    rain_amount: Optional[str] = None
    base_date: Optional[str] = None
    base_time: Optional[str] = None
    nx: Optional[int] = None
    ny: Optional[int] = None

class WeatherCreate(WeatherBase):
    pass

class WeatherFetchRequest(BaseModel):
    nx: int
    ny: int
    base_date: str
    base_time: str

class WeatherResponse(WeatherBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
