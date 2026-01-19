"""
채팅 메시지 관련 Pydantic 스키마
AI 채팅 기능을 위한 요청/응답 모델입니다.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ChatMessageBase(BaseModel):
    """채팅 메시지 기본 스키마"""
    content: str = Field(..., min_length=1)
    message_type: str = Field("text", max_length=50)  # text, image, audio 등

class ChatMessageCreate(ChatMessageBase):
    """채팅 메시지 생성 스키마"""
    pass

class ChatMessageResponse(ChatMessageBase):
    """채팅 메시지 응답 스키마"""
    id: int
    is_user: bool
    timestamp: datetime
    user_id: int
    tokens_used: Optional[int] = None
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0)

    class Config:
        from_attributes = True

class ChatHistoryResponse(BaseModel):
    """채팅 기록 응답 스키마"""
    messages: list[ChatMessageResponse]
    total: int
    page: int
    per_page: int

class ChatRequest(BaseModel):
    """채팅 요청 스키마"""
    message: str = Field(..., min_length=1, max_length=2000)
    message_type: str = Field("text", max_length=50)
    context: Optional[dict] = None  # 추가 컨텍스트 정보

class ChatResponse(BaseModel):
    """채팅 응답 스키마"""
    message: ChatMessageResponse
    ai_response: str
    conversation_type: str = "general"
    intent: Optional[str] = None
    entities: Optional[dict] = None
    sentiment: Optional[str] = None
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0)