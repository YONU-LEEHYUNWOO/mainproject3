from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class FavoritePlace(BaseModel):
    __tablename__ = "favorite_places"

    name = Column(String(100), nullable=False)  # 장소 이름 (예: 우리집, 서울대병원)
    category = Column(String(50))  # 카테고리 (home, hospital, pharmacy, restaurant, mart, other)
    address = Column(String(255))  # 주소
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    is_primary = Column(Boolean, default=False, nullable=False)  # 카테고리별 기본 장소 여부
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # User와의 관계
    user = relationship("User", back_populates="favorite_places")
