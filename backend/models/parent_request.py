from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class ParentRequest(BaseModel):
    __tablename__ = "parent_requests"
    content = Column(String(500), nullable=False)
    is_completed = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    user = relationship("User")
