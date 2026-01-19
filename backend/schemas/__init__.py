"""
Pydantic 스키마 패키지
API 요청/응답 데이터 검증을 위한 Pydantic 모델들을 포함합니다.
"""

from .user import *
from .task import *
from .chat_message import *
from .ai_conversation import *
from .guardian import *
from .medicine_alarm import *
from .auth import *

# 모든 스키마를 __all__에 명시
__all__ = [
    # User schemas
    "UserBase", "UserCreate", "UserUpdate", "UserResponse", "UserInDB",

    # Auth schemas
    "Token", "TokenData", "LoginRequest",

    # Task schemas
    "TaskBase", "TaskCreate", "TaskUpdate", "TaskResponse",

    # Chat schemas
    "ChatMessageBase", "ChatMessageCreate", "ChatMessageResponse",

    # AI schemas
    "AIConversationBase", "AIConversationCreate", "AIConversationResponse",
    "AIAnalysisRequest", "AIAnalysisResponse",

    # Guardian schemas
    "GuardianBase", "GuardianCreate", "GuardianUpdate", "GuardianResponse",

    # Medicine schemas
    "MedicineAlarmBase", "MedicineAlarmCreate", "MedicineAlarmUpdate", "MedicineAlarmResponse"
]