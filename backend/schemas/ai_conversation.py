"""
AI 대화 관련 Pydantic 스키마
AI 분석 기능을 위한 요청/응답 모델입니다.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class AIConversationBase(BaseModel):
    """AI 대화 기본 스키마"""
    user_input: str = Field(..., min_length=1)
    ai_response: str = Field(..., min_length=1)
    conversation_type: str = Field("general", max_length=50)

class AIConversationCreate(AIConversationBase):
    """AI 대화 생성 스키마"""
    intent: Optional[str] = Field(None, max_length=100)
    entities: Optional[str] = None  # JSON string
    sentiment: Optional[str] = Field(None, max_length=20)
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    tokens_used: Optional[int] = Field(None, gt=0)
    processing_time: Optional[float] = Field(None, gt=0.0)
    model_version: Optional[str] = Field(None, max_length=50)

class AIConversationResponse(AIConversationBase):
    """AI 대화 응답 스키마"""
    id: int
    user_id: int
    intent: Optional[str] = None
    entities: Optional[str] = None
    sentiment: Optional[str] = None
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    tokens_used: Optional[int] = None
    processing_time: Optional[float] = None
    model_version: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AIAnalysisRequest(BaseModel):
    """AI 분석 요청 스키마"""
    text: str = Field(..., min_length=1, max_length=5000)
    analysis_type: str = Field("general", max_length=50)  # general, schedule, health, etc.
    context: Optional[dict] = None  # 추가 분석 컨텍스트

class AIAnalysisResponse(BaseModel):
    """AI 분석 응답 스키마"""
    analysis: str
    conversation_type: str
    intent: Optional[str] = None
    entities: Optional[dict] = None
    sentiment: Optional[str] = None
    confidence: float = Field(..., ge=0.0, le=1.0)
    tokens_used: Optional[int] = None
    processing_time: float
    model_version: str

class ScheduleExtractRequest(BaseModel):
    """일정 추출 요청 스키마"""
    text: str = Field(..., min_length=1, max_length=2000)
    context: Optional[dict] = None

class ScheduleExtractResponse(BaseModel):
    """일정 추출 응답 스키마"""
    extracted_tasks: list[dict]  # 추출된 일정 목록
    confidence: float = Field(..., ge=0.0, le=1.0)
    analysis: str  # 분석 결과 설명