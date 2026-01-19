"""
AI 분석 API 라우터
Google Gemini AI를 활용한 텍스트 분석, 일정 추출, 채팅 기능을 제공합니다.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..auth import get_current_user
from ..models.user import User
from ..models.ai_conversation import AIConversation
from ..services.ai_service import AIService
from ..schemas.ai_conversation import (
    AIAnalysisRequest, AIAnalysisResponse,
    ScheduleExtractRequest, ScheduleExtractResponse
)
from ..schemas.chat_message import ChatRequest, ChatResponse

router = APIRouter()

# AI 서비스 인스턴스
ai_service = AIService()

@router.post("/analyze", response_model=AIAnalysisResponse)
async def analyze_text(
    request: AIAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    텍스트 분석
    입력 텍스트를 AI로 분석하여 의도, 감정, 개체 정보를 추출합니다.
    """
    try:
        # AI 분석 수행
        analysis_result = ai_service.analyze_text(
            text=request.text,
            analysis_type=request.analysis_type
        )

        # 분석 결과 저장
        ai_conversation = AIConversation(
            user_input=request.text,
            ai_response=analysis_result.get("response", ""),
            conversation_type=request.analysis_type,
            intent=analysis_result.get("intent"),
            entities=json.dumps(analysis_result.get("entities", {})),
            sentiment=analysis_result.get("sentiment"),
            confidence=analysis_result.get("confidence", 0.0),
            tokens_used=analysis_result.get("tokens_used", 0),
            processing_time=analysis_result.get("processing_time", 0.0),
            model_version=analysis_result.get("model_version"),
            user_id=current_user.id
        )

        db.add(ai_conversation)
        db.commit()

        return AIAnalysisResponse(
            analysis=analysis_result.get("response", ""),
            conversation_type=analysis_result.get("intent", request.analysis_type),
            intent=analysis_result.get("intent"),
            entities=analysis_result.get("entities", {}),
            sentiment=analysis_result.get("sentiment"),
            confidence=analysis_result.get("confidence", 0.8),
            tokens_used=analysis_result.get("tokens_used", 0),
            processing_time=analysis_result.get("processing_time", 0.0),
            model_version=analysis_result.get("model_version", "unknown")
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI 분석 중 오류가 발생했습니다: {str(e)}"
        )

@router.post("/schedule-extract", response_model=ScheduleExtractResponse)
async def extract_schedule(
    request: ScheduleExtractRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    일정 정보 추출
    텍스트에서 일정 관련 정보를 추출합니다.
    """
    try:
        result = ai_service.extract_schedule(request.text)

        # 추출 결과가 있으면 AI 대화로 저장
        if result.get("extracted_tasks"):
            ai_conversation = AIConversation(
                user_input=request.text,
                ai_response=f"일정 {len(result['extracted_tasks'])}개를 추출했습니다.",
                conversation_type="schedule",
                intent="schedule_extraction",
                entities=json.dumps({"extracted_tasks": result["extracted_tasks"]}),
                confidence=result.get("confidence", 0.0),
                user_id=current_user.id
            )
            db.add(ai_conversation)
            db.commit()

        return ScheduleExtractResponse(
            extracted_tasks=result.get("extracted_tasks", []),
            confidence=result.get("confidence", 0.0),
            analysis=result.get("analysis", "")
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"일정 추출 중 오류가 발생했습니다: {str(e)}"
        )

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    AI 채팅
    AI와 자연스러운 대화를 나눕니다.
    """
    try:
        # AI 응답 생성
        chat_result = ai_service.chat_response(
            message=request.message,
            conversation_type="general",  # 추후 분석을 통해 결정
            context=request.context
        )

        # 채팅 메시지 저장 (사용자 메시지)
        from ..models.chat_message import ChatMessage
        user_message = ChatMessage(
            content=request.message,
            is_user=True,
            message_type=request.message_type,
            user_id=current_user.id
        )
        db.add(user_message)

        # AI 응답 메시지 저장
        ai_message = ChatMessage(
            content=chat_result.get("message", ""),
            is_user=False,
            message_type="text",
            tokens_used=chat_result.get("tokens_used", 0),
            confidence=chat_result.get("confidence", 0.0),
            user_id=current_user.id
        )
        db.add(ai_message)

        # AI 대화 분석 결과 저장
        ai_conversation = AIConversation(
            user_input=request.message,
            ai_response=chat_result.get("message", ""),
            conversation_type=chat_result.get("conversation_type", "general"),
            confidence=chat_result.get("confidence", 0.0),
            tokens_used=chat_result.get("tokens_used", 0),
            processing_time=chat_result.get("processing_time", 0.0),
            model_version=chat_result.get("model_version"),
            user_id=current_user.id
        )
        db.add(ai_conversation)

        db.commit()

        return ChatResponse(
            message=ai_message,
            ai_response=chat_result.get("message", ""),
            conversation_type=chat_result.get("conversation_type", "general"),
            intent=None,  # 추후 구현
            entities=None,  # 추후 구현
            sentiment=None,  # 추후 구현
            confidence=chat_result.get("confidence", 0.0)
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"채팅 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/conversations")
async def get_conversations(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    AI 대화 기록 조회
    사용자의 AI 분석 및 채팅 기록을 조회합니다.
    """
    conversations = db.query(AIConversation).filter(
        AIConversation.user_id == current_user.id
    ).order_by(AIConversation.created_at.desc()).offset(skip).limit(limit).all()

    return {
        "conversations": [conv.to_analysis_dict() for conv in conversations],
        "total": len(conversations)
    }

@router.get("/health")
async def ai_service_health():
    """
    AI 서비스 상태 확인
    """
    try:
        # 간단한 테스트로 AI 서비스 상태 확인
        test_result = ai_service.analyze_text("테스트 메시지", "general")
        return {
            "status": "healthy",
            "model": test_result.get("model_version", "unknown"),
            "response_time": test_result.get("processing_time", 0.0)
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }