"""
알림 로그 API 라우터
알림 실행 이력을 관리합니다.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta

from database import get_db
from auth import get_current_user
from models.user import User
from models.notification_log import NotificationLog
from models.task import Task
from models.medicine_alarm import MedicineAlarm
from schemas.notification_log import (
    NotificationLogCreate, NotificationLogUpdate, NotificationLogResponse, NotificationLogListResponse
)

from utils.response import success_response

router = APIRouter()

@router.post("/read-all")
async def mark_all_read(u: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(NotificationLog).filter(NotificationLog.user_id == u.id, NotificationLog.is_read == False).update({"is_read": True})
    db.commit(); return success_response(message="모두 읽음 처리됨")

@router.patch("/{log_id}/read")
async def mark_read(log_id: int, u: User = Depends(get_current_user), db: Session = Depends(get_db)):
    log = db.query(NotificationLog).filter(NotificationLog.id == log_id, NotificationLog.user_id == u.id).first()
    if log: log.is_read = True; db.commit()
    return success_response(message="읽음 처리됨")


from models.inactivity import InactivitySettings, InactivityLog

def _sync_notifications(db: Session, user_id: int):
    """오늘의 일정, 복약 정보 및 현재 무활동 상태를 확인하여 알림 로그를 생성합니다."""
    today = date.today()
    now = datetime.now()
    db_now_utc = datetime.utcnow() # Add this line for UTC time comparison
    
    # 0. 무활동 상태 동기화 (실시간 상태 체크 후 로그 생성)
    # status 로직을 가져오는 대신 DB에서 직접 체크
    user = db.query(User).filter(User.id == user_id).first()
    ia_settings = db.query(InactivitySettings).filter(InactivitySettings.user_id == user_id).first() # Renamed to ia_settings
    
    if user and ia_settings and ia_settings.is_enabled: # Use ia_settings
        last_act = user.last_activity_at or user.created_at
        diff_seconds = (db_now_utc - last_act).total_seconds() # Use db_now_utc
        threshold_seconds = ia_settings.threshold_hours * 3600 # Use ia_settings
        
        if diff_seconds > threshold_seconds:
            print(f"🕵️ [SYNC-NOTICE] User:{user_id} is in DANGER (Diff:{int(diff_seconds/60)}m)") # Added print
            # Danger 상태임. 미독 알림이 있는지 확인
            exists = db.query(NotificationLog).filter(
                NotificationLog.user_id == user_id,
                NotificationLog.notification_type == "inactivity_danger",
                NotificationLog.is_read == False
            ).first()
            if not exists:
                print(f"➕ [SYNC-NOTICE] Creating NEW NotificationLog for User:{user_id}") # Added print
                db.add(NotificationLog(
                    user_id=user_id,
                    notification_type="inactivity_danger",
                    title="⚠️ 활동 확인 알림",
                    message="오랫동안 앱 사용이 없으셨어요. 무사하시다면 확인을 눌러주세요!"
                ))
            else:
                print(f"✔️ [SYNC-NOTICE] NotificationLog already exists for User:{user_id}") # Added print

    # 1. 일정 알림 동기화
    tasks = db.query(Task).filter(Task.owner_id == user_id, Task.date == today, Task.completed == False).all()
    for task in tasks:
        if task.time:
            task_dt = datetime.combine(today, task.time)
            remind_dt = task_dt - timedelta(minutes=task.reminder_minutes or 0)
            if now >= remind_dt and now <= (task_dt + timedelta(hours=1)):
                exists = db.query(NotificationLog).filter(NotificationLog.user_id == user_id, NotificationLog.task_id == task.id, NotificationLog.notification_type == "task_reminder").first()
                if not exists:
                    db.add(NotificationLog(
                        user_id=user_id, task_id=task.id, notification_type="task_reminder",
                        title=f"🕒 일정 알림: {task.title}",
                        message=f"{task.time.strftime('%H:%M')}에 일정이 있습니다. (알림 설정: {task.reminder_minutes}분 전)"
                    ))

    # 2. 복약 알림 동기화
    medicines = db.query(MedicineAlarm).filter(MedicineAlarm.user_id == user_id, MedicineAlarm.is_active == True, MedicineAlarm.start_date <= today).all()
    for med in medicines:
        for t_attr in ['time_1', 'time_2', 'time_3', 'time_4']:
            m_time = getattr(med, t_attr)
            if m_time:
                med_dt = datetime.combine(today, m_time)
                remind_dt = med_dt - timedelta(minutes=med.reminder_minutes or 0)
                unique_title = f"💊 복약 알림: {med.medicine_name} ({m_time.strftime('%H:%M')})"
                if now >= remind_dt and now <= (med_dt + timedelta(hours=1)):
                    exists = db.query(NotificationLog).filter(NotificationLog.user_id == user_id, NotificationLog.notification_type == "medicine_reminder", NotificationLog.title.like(f"%{med.medicine_name}%{m_time.strftime('%H:%M')}%")).first()
                    if not exists:
                        db.add(NotificationLog(user_id=user_id, notification_type="medicine_reminder", title=unique_title, message=f"{med.medicine_name} 복용 시간입니다. 잊지 말고 챙겨 드세요! ({med.dosage or ''})"))
    db.commit()

from models.guardian import Guardian

@router.get("/")
async def get_notification_logs(
    target_user_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    알림 로그 목록 조회 (보호자 타겟 조회 지원)
    """
    query_user_id = current_user.id
    
    # 보호자가 대상을 지정한 경우 권한 확인
    if target_user_id and target_user_id != current_user.id:
        is_guardian = db.query(Guardian).filter(
            Guardian.guardian_user_id == current_user.id,
            Guardian.user_id == target_user_id
        ).first()
        if not is_guardian:
            raise HTTPException(status_code=403, detail="해당 사용자의 알림을 조회할 권한이 없습니다.")
        query_user_id = target_user_id

    # 조회 시 동기화 수행
    _sync_notifications(db, query_user_id)
    
    query = db.query(NotificationLog).filter(NotificationLog.user_id == query_user_id)

    # 정렬 (최신순)
    query = query.order_by(NotificationLog.created_at.desc())

    # 페이징
    total = query.count()
    logs = query.offset(skip).limit(limit).all()

    return success_response(data={
        "notification_logs": [log for log in logs],
        "total": total,
        "page": skip // limit + 1,
        "per_page": limit
    })


@router.post("/", response_model=NotificationLogResponse, status_code=status.HTTP_201_CREATED)
async def create_notification_log(
    log: NotificationLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    알림 로그 생성
    """
    db_log = NotificationLog(
        **log.dict(),
        user_id=current_user.id
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return NotificationLogResponse.from_orm(db_log)


@router.get("/{log_id}", response_model=NotificationLogResponse)
async def get_notification_log(
    log_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    특정 알림 로그 조회
    """
    log = db.query(NotificationLog).filter(
        NotificationLog.id == log_id,
        NotificationLog.user_id == current_user.id
    ).first()

    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="알림 로그를 찾을 수 없습니다"
        )

    return NotificationLogResponse.from_orm(log)


@router.put("/{log_id}", response_model=NotificationLogResponse)
async def update_notification_log(
    log_id: int,
    log_update: NotificationLogUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    알림 로그 수정
    """
    log = db.query(NotificationLog).filter(
        NotificationLog.id == log_id,
        NotificationLog.user_id == current_user.id
    ).first()

    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="알림 로그를 찾을 수 없습니다"
        )

    # 업데이트할 필드만 적용
    update_data = log_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(log, field, value)

    db.commit()
    db.refresh(log)
    return NotificationLogResponse.from_orm(log)