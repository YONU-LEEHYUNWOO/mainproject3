"""
채팅 메시지 모델
AI 채팅 대화 내용을 저장합니다.
"""

from sqlalchemy import Column, String, Text, Boolean, DateTime, Integer, Float, ForeignKey, func
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import BaseModel

class ChatMessage(BaseModel):
    """채팅 메시지 모델"""
    __tablename__ = "chat_messages"

    content = Column(Text, nullable=False)
    is_user = Column(Boolean, default=True, nullable=False)  # True: 사용자 메시지, False: AI 응답
    message_type = Column(String(50), default="text", nullable=False)  # text, image, audio 등
    timestamp = Column(DateTime, server_default=func.now(), nullable=False, index=True)
    tokens_used = Column(Integer, nullable=True)  # AI API 토큰 사용량
    confidence = Column(Float, nullable=True)  # AI 응답 신뢰도 (0.0-1.0)

    # 외래 키
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # 관계 설정
    user = relationship("User", back_populates="chat_messages")

    def __repr__(self):
        return f"<ChatMessage(id={self.id}, is_user={self.is_user}, timestamp={self.timestamp})>"

    def get_message_type_display(self):
        """메시지 타입 텍스트 반환"""
        types = {
            "text": "텍스트",
            "image": "이미지",
            "audio": "음성",
            "location": "위치",
            "schedule": "일정"
        }
        return types.get(self.message_type, self.message_type)

    def is_recent(self, minutes=5):
        """최근 메시지인지 확인"""
        from datetime import timedelta
        return datetime.utcnow() - self.timestamp < timedelta(minutes=minutes)