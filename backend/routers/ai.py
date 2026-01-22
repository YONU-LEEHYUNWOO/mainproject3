"""
AI 분석 API 라우터
Google Gemini AI를 활용한 텍스트 분석, 일정 추출, 채팅 기능을 제공합니다.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import json
from typing import List, Dict, Optional

from database import get_db
from auth import get_current_user
from models.user import User
from models.ai_conversation import AIConversation
from services.ai_service import AIService
from schemas.ai_conversation import (
    AIAnalysisRequest, AIAnalysisResponse,
    ScheduleExtractRequest, ScheduleExtractResponse
)
from schemas.chat_message import ChatRequest, ChatResponse
from utils.response import success_response

router = APIRouter()

# AI 서비스 인스턴스
ai_service = AIService()

def _check_schedule_conflicts(extracted_tasks: List[Dict], user_id: int, db: Session) -> List[Dict]:
    """
    추출된 일정과 기존 일정 간 충돌 감지

    Args:
        extracted_tasks: AI가 추출한 일정 목록
        user_id: 사용자 ID
        db: 데이터베이스 세션

    Returns:
        충돌 정보 목록
    """
    from models.task import Task
    from datetime import datetime, date, time

    conflicts = []

    for extracted_task in extracted_tasks:
        try:
            # 추출된 일정의 날짜/시간 파싱
            task_date_str = extracted_task.get("date")
            task_time_str = extracted_task.get("time")

            if not task_date_str:
                continue

            # 날짜 파싱
            try:
                task_date = datetime.strptime(task_date_str, "%Y-%m-%d").date()
            except ValueError:
                continue

            # 시간 파싱 (없으면 하루 종일로 간주)
            task_time = None
            if task_time_str:
                try:
                    # HH:MM 형식 파싱
                    hour, minute = map(int, task_time_str.split(':'))
                    task_time = time(hour=hour, minute=minute)
                except (ValueError, AttributeError):
                    pass

            # 기존 일정 조회 (같은 날짜)
            existing_tasks = db.query(Task).filter(
                Task.owner_id == user_id,
                Task.date == task_date
            ).all()

            # 각 기존 일정과 충돌 확인
            for existing_task in existing_tasks:
                conflict_info = _check_time_overlap(
                    extracted_task, existing_task, task_time
                )
                if conflict_info:
                    conflicts.append(conflict_info)

        except Exception as e:
            # 개별 일정 처리 오류는 무시하고 계속 진행
            continue

    return conflicts

def _check_time_overlap(extracted_task: Dict, existing_task, extracted_time) -> Optional[Dict]:
    """
    두 일정 간 시간 겹침 확인

    Args:
        extracted_task: 추출된 일정 정보
        existing_task: 기존 Task 객체
        extracted_time: 추출된 일정의 시간

    Returns:
        충돌 정보 또는 None
    """
    from datetime import time

    # 둘 다 시간이 없는 경우 (하루 종일) - 날짜가 같으면 충돌
    if not extracted_time and not existing_task.time:
        return {
            "type": "full_day_overlap",
            "extracted_task": extracted_task.get("title", "알 수 없는 일정"),
            "existing_task": {
                "id": existing_task.id,
                "title": existing_task.title,
                "date": str(existing_task.date),
                "time": existing_task.time.strftime("%H:%M") if existing_task.time else None
            },
            "message": f"'{existing_task.title}' 일정과 날짜가 겹칩니다"
        }

    # 추출된 일정에 시간 정보가 있는 경우
    if extracted_time:
        if existing_task.time:
            # 둘 다 시간 정보가 있는 경우 - 시간 범위 비교
            time_diff = abs((existing_task.time.hour * 60 + existing_task.time.minute) -
                          (extracted_time.hour * 60 + extracted_time.minute))

            # 2시간 이내로 가까우면 충돌로 간주
            if time_diff <= 120:  # 2시간 = 120분
                return {
                    "type": "time_overlap",
                    "extracted_task": extracted_task.get("title", "알 수 없는 일정"),
                    "existing_task": {
                        "id": existing_task.id,
                        "title": existing_task.title,
                        "date": str(existing_task.date),
                        "time": existing_task.time.strftime("%H:%M") if existing_task.time else None
                    },
                    "time_diff_minutes": time_diff,
                    "message": f"'{existing_task.title}' 일정과 {time_diff}분 차이로 시간이 가깝습니다"
                }
        else:
            # 기존 일정은 하루 종일, 새 일정은 특정 시간 - 날짜가 같으면 충돌
            return {
                "type": "mixed_overlap",
                "extracted_task": extracted_task.get("title", "알 수 없는 일정"),
                "existing_task": {
                    "id": existing_task.id,
                    "title": existing_task.title,
                    "date": str(existing_task.date),
                    "time": None
                },
                "message": f"'{existing_task.title}' 일정(하루 종일)과 겹칠 수 있습니다"
            }

    # 추출된 일정에 시간 정보가 없고 기존 일정에 시간 정보가 있는 경우
    # 추출된 일정은 하루 종일로 간주 - 날짜가 같으면 충돌
    if not extracted_time and existing_task.time:
        return {
            "type": "mixed_overlap",
            "extracted_task": extracted_task.get("title", "알 수 없는 일정"),
            "existing_task": {
                "id": existing_task.id,
                "title": existing_task.title,
                "date": str(existing_task.date),
                "time": existing_task.time.strftime("%H:%M") if existing_task.time else None
            },
            "message": f"'{existing_task.title}' 일정과 겹칠 수 있습니다"
        }

    return None

@router.post("/analyze")
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
        analysis_result = await ai_service.analyze_text(
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

        analysis_data = {
            "analysis": analysis_result.get("response", ""),
            "conversation_type": analysis_result.get("intent", request.analysis_type),
            "intent": analysis_result.get("intent"),
            "entities": analysis_result.get("entities", {}),
            "sentiment": analysis_result.get("sentiment"),
            "confidence": analysis_result.get("confidence", 0.8),
            "tokens_used": analysis_result.get("tokens_used", 0),
            "processing_time": analysis_result.get("processing_time", 0.0),
            "model_version": analysis_result.get("model_version", "unknown")
        }

        return success_response(
            data=analysis_data,
            message="분석이 완료되었습니다"
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI 분석 중 오류가 발생했습니다: {str(e)}"
        )

@router.post("/schedule-extract")
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
        result = await ai_service.extract_schedule(request.text)

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

        return success_response(
            data={
                "extracted_tasks": result.get("extracted_tasks", []),
                "confidence": result.get("confidence", 0.0),
                "analysis": result.get("analysis", ""),
                "conflicts": _check_schedule_conflicts(result.get("extracted_tasks", []), current_user.id, db)
            },
            message="일정이 추출되었습니다"
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"일정 추출 중 오류가 발생했습니다: {str(e)}"
        )

@router.post("/chat")
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
        chat_result = await ai_service.chat_response(
            message=request.message,
            conversation_type="general",  # 추후 분석을 통해 결정
            context=request.context
        )

        # 채팅 메시지 저장 (사용자 메시지)
        from models.chat_message import ChatMessage
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

        return success_response(
            data={
                "ai_response": chat_result.get("message", ""),
                "action": chat_result.get("action"),
                "conversation_type": chat_result.get("conversation_type", "general"),
                "confidence": chat_result.get("confidence", 0.0)
            },
            message="채팅이 완료되었습니다"
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

    return success_response(
        data={
            "conversations": [conv.to_analysis_dict() for conv in conversations],
            "total": len(conversations)
        },
        message="성공"
    )

@router.get("/proactive")
async def get_proactive_message(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    능동형 케어 메시지 생성
    현재 시간, 일정, 복약 현황을 기반으로 AI가 먼저 제안할 메시지를 생성합니다.
    """
    try:
        from models.task import Task
        from models.medicine_alarm import MedicineAlarm
        from datetime import date, datetime
        
        today = date.today()
        now = datetime.now()
        
        # 1. 오늘 일정 가져오기
        tasks = db.query(Task).filter(
            Task.owner_id == current_user.id,
            Task.date == today
        ).all()
        
        # 2. 지금 복용해야 하거나 오늘 예정된 약 가져오기
        medicines = db.query(MedicineAlarm).filter(
            MedicineAlarm.user_id == current_user.id,
            MedicineAlarm.is_active == True
        ).all()
        
        # 컨텍스트 요약
        context = {
            "current_time": now.strftime("%H:%M"),
            "today_date": today.strftime("%Y-%m-%d"),
            "tasks": [{"title": t.title, "time": t.time.strftime("%H:%M") if t.time else "하루 종일", "completed": t.completed} for t in tasks],
            "medicines": [{"name": m.medicine_name, "next_reminder": m.next_reminder.strftime("%H:%M") if m.next_reminder else None} for m in medicines if m.is_active]
        }
        
        # 3. AI 서비스로 메시지 생성
        proactive_result = await ai_service.generate_proactive_message(context)
        
        return success_response(
            data=proactive_result,
            message="능동형 메시지가 생성되었습니다"
        )
    except Exception as e:
        log_error(f"능동형 메시지 생성 오류: {e}")
        return success_response(
            data={"message": "오늘도 건강하고 활기찬 하루 보내세요! 😊", "action": None},
            message="기본 메시지를 반환합니다"
        )

@router.get("/health")
async def ai_service_health():
    """
    AI 서비스 상태 확인
    """
    try:
        # 간단한 테스트로 AI 서비스 상태 확인
        test_result = ai_service.analyze_text("테스트 메시지", "general")
        return success_response(
            data={
                "status": "healthy",
                "model": test_result.get("model_version", "unknown"),
                "response_time": test_result.get("processing_time", 0.0)
            },
            message="AI 서비스가 정상 작동 중입니다"
        )
    except Exception as e:
        return success_response(
            data={
                "status": "unhealthy",
                "error": str(e)
            },
            message="AI 서비스에 문제가 있습니다",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE
        )