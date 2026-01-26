from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ParentRequestBase(BaseModel):
    content: str
    is_completed: bool = False

class ParentRequestCreate(ParentRequestBase):
    pass

class ParentRequestResponse(ParentRequestBase):
    id: int
    user_id: int
    created_at: datetime
    class Config:
        from_attributes = True
