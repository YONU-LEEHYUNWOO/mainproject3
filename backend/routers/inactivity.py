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

@router.get("/debug/time")
async def debug_time(current_user: User = Depends(get_current_user)):
    """디버깅을 위해 서버 시간과 사용자 활동 시간을 반환합니다."""
    return {
        "server_utc": datetime.utcnow().isoformat(),
        "user_last_activity": current_user.last_activity_at.isoformat() if current_user.last_activity_at else None,
        "diff_seconds": (datetime.utcnow() - current_user.last_activity_at).total_seconds() if current_user.last_activity_at else None
    }

@router.get("/settings/{target_user_id}")
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
        db.add(settings); db.commit(); db.refresh(settings)
    
    from schemas.inactivity import InactivitySettingsResponse
    return success_response(data=InactivitySettingsResponse.model_validate(settings).dict())

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

from utils.activity import record_user_activity

@router.post("/activity")
async def update_activity(
    update: ActivityUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """사용자의 마지막 활동 시간을 업데이트합니다."""
    record_user_activity(db, current_user, update.activity_type)
    log_info(f"[ACTIVITY] User {current_user.id} updated activity: {update.activity_type}")
    return success_response(message="활동이 기록되었습니다.")

@router.get("/status/{target_user_id}")
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
    if user:
        db.refresh(user) # 최신 상테 강제 로드
    settings = db.query(InactivitySettings).filter(InactivitySettings.user_id == target_user_id).first()
    
    # 디버깅로그 추가
    now = datetime.utcnow()
    last_act = user.last_activity_at or user.created_at
    diff = now - last_act
    minutes_diff = int(diff.total_seconds() / 60)
    print(f"🕵️ [STATUS-CHECK] User:{target_user_id} Now:{now} LastAct:{last_act} Diff:{minutes_diff}m")
    
    if not settings or not settings.is_enabled:
        return success_response(data={
            "user_id": target_user_id,
            "status": "Disabled",
            "last_activity_at": user.last_activity_at,
            "minutes_since_last_activity": 0,
            "is_sleep_time": False,
            "message": "무활동 감지 기능이 꺼져 있습니다."
        })

    # ... (기존 로직 유지) ...
    is_sleep = False
    now_time_str = (now + timedelta(hours=9)).strftime("%H:%M") # KST 기준
    if settings.sleep_start <= now_time_str or now_time_str <= settings.sleep_end:
        is_sleep = True

    status_str = "Active"
    message = "정상 활동 중입니다."
    reminder_count = 0

    if not is_sleep:
        # 무활동 시간 계산 (초 단위)
        seconds_diff = int(diff.total_seconds())
        threshold_seconds = settings.threshold_hours * 3600
        
        # 1단계: 기본 무활동 (임계치의 80%)
        if seconds_diff > threshold_seconds * 0.8:
            status_str = "Inactive"
            message = "부모님이 앱을 사용하신 지 꽤 되었습니다."

        # 2단계 이상: 알림(핑) 단계 (임계치 초과)
        if seconds_diff > threshold_seconds:
            # 최근의 InactivityLog 조회
            active_log = db.query(InactivityLog).filter(
                InactivityLog.user_id == target_user_id,
                InactivityLog.status.in_(["detected", "alerted"])
            ).order_by(InactivityLog.detected_at.desc()).first()
            
            if not active_log:
                active_log = InactivityLog(user_id=target_user_id, status="detected")
                db.add(active_log); db.commit(); db.refresh(active_log)
                
                # NotificationLog에도 추가하여 '알림 센터' 위젯에 노출
                from models.notification_log import NotificationLog
                db.add(NotificationLog(
                    user_id=target_user_id,
                    notification_type="inactivity_danger",
                    title="⚠️ 활동 확인 알림",
                    message="오랫동안 앱 사용이 없으셨어요. 무사하시다면 확인을 눌러주세요!"
                ))
                db.commit()
            
            reminder_count = active_log.reminder_count
            status_str = "Danger"
            
            if reminder_count == 0:
                message = "현재 무활동 상태로 감지되었습니다. 활동 확인을 부탁드립니다."
            elif reminder_count == 1:
                message = "무활동 상태가 지속되고 있습니다. (2회차 알림)"
            elif reminder_count >= 2:
                message = "마지막 알림입니다! 확인 버튼으로 해제 부탁드립니다!"
            
            # 보호자 통보 로직 (Max 도달 시)
            if reminder_count >= settings.max_reminders:
                active_log.status = "alerted"
                message = "긴급! 보호자에게 활동 중단이 통보되었습니다."
                db.commit()

    elif is_sleep:
        status_str = "Sleep"
        message = "현재는 설정된 취침 시간입니다."

    return success_response(data={
        "user_id": target_user_id,
        "status": status_str,
        "reminder_count": reminder_count,
        "last_activity_at": last_act,
        "minutes_since_last_activity": minutes_diff,
        "is_sleep_time": is_sleep,
        "message": message
    })

@router.patch("/reminder/increment/{target_user_id}")
async def increment_reminder_count(
    target_user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """부모님께 보낸 알림 횟수를 1 증가시킵니다."""
    active_log = db.query(InactivityLog).filter(
        InactivityLog.user_id == target_user_id,
        InactivityLog.status.in_(["detected", "alerted"])
    ).order_by(InactivityLog.detected_at.desc()).first()
    
    if active_log:
        active_log.reminder_count += 1
        db.commit()
        return success_response(data={"count": active_log.reminder_count})
    return success_response(message="진행 중인 무활동 로그가 없습니다.")
