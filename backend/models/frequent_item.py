from sqlalchemy import Column, Integer, String, ForeignKey
from .base import BaseModel

class FrequentItem(BaseModel):
    __tablename__ = "frequent_items"
    name = Column(String(100), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
