"""
AI 대화 모델
AI 분석 결과 및 대화 내용을 저장합니다.
"""

from sqlalchemy import Column, Text, String, DateTime, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class AIConversation(BaseModel):
    """AI 대화 모델"""
    __tablename__ = "ai_conversations"

    user_input = Column(Text, nullable=False)
    ai_response = Column(Text, nullable=False)
    conversation_type = Column(String(50), default="general", nullable=False)  # general, schedule, health, etc.
    intent = Column(String(100), nullable=True)  # 분석된 사용자 의도
    entities = Column(Text, nullable=True)  # 추출된 개체 (JSON 형식)
    sentiment = Column(String(20), nullable=True)  # positive, negative, neutral
    confidence = Column(Float, nullable=True)  # 분석 신뢰도 (0.0-1.0)
    tokens_used = Column(Integer, nullable=True)  # API 토큰 사용량
    processing_time = Column(Float, nullable=True)  # 처리 시간 (초)
    model_version = Column(String(50), nullable=True)  # 사용된 AI 모델 버전

    # 외래 키
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # 관계 설정
    user = relationship("User", back_populates="ai_conversations")

    def __repr__(self):
        return f"<AIConversation(id={self.id}, type={self.conversation_type}, user_id={self.user_id})>"

    def get_conversation_type_display(self):
        """대화 타입 텍스트 반환"""
        types = {
            "general": "일반대화",
            "schedule": "일정관리",
            "health": "건강관리",
            "medicine": "약관리",
            "emergency": "긴급상황",
            "location": "위치정보"
        }
        return types.get(self.conversation_type, self.conversation_type)

    def get_sentiment_display(self):
        """감정 텍스트 반환"""
        sentiments = {
            "positive": "긍정",
            "negative": "부정",
            "neutral": "중립"
        }
        return sentiments.get(self.sentiment, self.sentiment)

    def to_analysis_dict(self):
        """분석 결과를 위한 딕셔너리 변환"""
        return {
            "id": self.id,
            "user_input": self.user_input,
            "ai_response": self.ai_response,
            "conversation_type": self.conversation_type,
            "intent": self.intent,
            "entities": self.entities,
            "sentiment": self.sentiment,
            "confidence": self.confidence,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }