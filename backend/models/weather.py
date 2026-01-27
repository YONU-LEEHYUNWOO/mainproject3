from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class WeatherRecord(Base):
    __tablename__ = "weather_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    temp = Column(Float)  # 기온
    humidity = Column(Integer)  # 습도
    sky_status = Column(String(20))  # 하늘상태 (맑음, 구름많음, 흐림)
    rain_type = Column(String(20))  # 강수형태
    rain_amount = Column(String(20))  # 강수량
    
    base_date = Column(String(8))  # 발표일자 (YYYYMMDD)
    base_time = Column(String(4))  # 발표시각 (HHMM)
    
    nx = Column(Integer)  # 격자 X
    ny = Column(Integer)  # 격자 Y
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="weather_records")
