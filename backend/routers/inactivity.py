"""
무활동 감지 API 라우터
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, time, timedelta
from typing import List, Optional

from database import get_db
from auth import get_current_user
from models.user import User
from models.inactivity import InactivitySettings, InactivityLog
from models.guardian import Guardian
from schemas.inactivity import (
    InactivitySettingsResponse, InactivitySettingsUpdate, 
    ActivityUpdate, InactivityStatusResponse
)
from utils.response import success_response
from utils.logger import log_info

router = APIRouter()

@router.get("/settings/{target_user_id}", response_model=InactivitySettingsResponse)
async def get_inactivity_settings(
    target_user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """지정된 사용자의 무활동 설정을 조회합니다 (보호자 권한 필요)"""
    # 권한 확인
    if current_user.id != target_user_id:
        guardian = db.query(Guardian).filter(
            Guardian.guardian_user_id == current_user.id,
            Guardian.user_id == target_user_id
        ).first()
        if not guardian:
            raise HTTPException(status_code=403, detail="설정을 조회할 권한이 없습니다.")

    settings = db.query(InactivitySettings).filter(InactivitySettings.user_id == target_user_id).first()
    if not settings:
        # 기본값으로 생성
        settings = InactivitySettings(user_id=target_user_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return settings

@router.put("/settings/{target_user_id}")
async def update_inactivity_settings(
    target_user_id: int,
    settings_update: InactivitySettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """무활동 설정을 수정합니다."""
    # 권한 확인
    if current_user.id != target_user_id:
        guardian = db.query(Guardian).filter(
            Guardian.guardian_user_id == current_user.id,
            Guardian.user_id == target_user_id
        ).first()
        if not guardian:
            raise HTTPException(status_code=403, detail="설정을 수정할 권한이 없습니다.")

    settings = db.query(InactivitySettings).filter(InactivitySettings.user_id == target_user_id).first()
    if not settings:
        settings = InactivitySettings(user_id=target_user_id)
        db.add(settings)
    
    # 필드 업데이트
    for field, value in settings_update.dict().items():
        setattr(settings, field, value)
    
    db.commit()
    return success_response(message="설정이 저장되었습니다.")

@router.post("/activity")
async def update_activity(
    update: ActivityUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """사용자의 마지막 활동 시간을 업데이트합니다."""
    current_user.last_activity_at = datetime.utcnow()
    
    # 만약 현재 진행 중인 무활동 로그가 있다면 confirmed/resolved로 변경
    active_logs = db.query(InactivityLog).filter(
        InactivityLog.user_id == current_user.id,
        InactivityLog.status.in_(["detected", "alerted"])
    ).all()
    
    for log in active_logs:
        log.status = "resolved"
        log.resolved_at = datetime.utcnow()
    
    db.commit()
    log_info(f"[ACTIVITY] User {current_user.id} updated activity: {update.activity_type}")
    return success_response(message="활동이 기록되었습니다.")

@router.get("/status/{target_user_id}", response_model=InactivityStatusResponse)
async def get_inactivity_status(
    target_user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """사용자의 현재 무활동 상태를 조회합니다."""
    # 권한 확인 (본인이거나 보호자일 때)
    if current_user.id != target_user_id:
        guardian = db.query(Guardian).filter(
            Guardian.guardian_user_id == current_user.id,
            Guardian.user_id == target_user_id
        ).first()
        if not guardian:
            raise HTTPException(status_code=403, detail="상태를 조회할 권한이 없습니다.")

    user = db.query(User).filter(User.id == target_user_id).first()
    settings = db.query(InactivitySettings).filter(InactivitySettings.user_id == target_user_id).first()
    
    if not settings or not settings.is_enabled:
        return {
            "user_id": target_user_id,
            "status": "Disabled",
            "last_activity_at": user.last_activity_at,
            "minutes_since_last_activity": 0,
            "is_sleep_time": False,
            "message": "무활동 감지 기능이 꺼져 있습니다."
        }

    now = datetime.utcnow()
    # last_activity_at이 없으면 가입 시간 등으로 대체 고려 (여기서는 0으로 처리)
    last_act = user.last_activity_at or user.created_at
    diff = now - last_act
    minutes_diff = int(diff.total_seconds() / 60)
    
    # 취침 시간 확인 (로컬 시간 기준 비교 필요하나 여기서는 단순화)
    # 실제로는 유저의 타임존 고려 필요
    is_sleep = False
    now_time_str = (now + timedelta(hours=9)).strftime("%H:%M") # KST 기준
    if settings.sleep_start <= now_time_str or now_time_str <= settings.sleep_end:
        is_sleep = True

    status_str = "Active"
    message = "정상 활동 중입니다."
    
    if not is_sleep:
        if minutes_diff > (settings.threshold_hours * 60):
            status_str = "Inactive"
            message = "장시간 활동이 감지되지 않았습니다."
            
            # 위험 상태 확인 (핑 응답 없음 등은 앱 로직에서 처리)
            # 여기서는 단순 시간 차이만 반환
    elif is_sleep:
        status_str = "Sleep"
        message = "현재는 설정된 취침 시간입니다."

    return {
        "user_id": target_user_id,
        "status": status_str,
        "last_activity_at": last_act,
        "minutes_since_last_activity": minutes_diff,
        "is_sleep_time": is_sleep,
        "message": message
    }
