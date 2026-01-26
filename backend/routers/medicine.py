"""
약 관리 API 라우터
사용자의 약 복용 알림을 관리하는 CRUD 기능을 제공합니다.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime, date
from database import get_db
from auth import get_current_user
from models.user import User
from models.medicine_alarm import MedicineAlarm
from models.guardian import Guardian
from schemas.medicine_alarm import (
    MedicineAlarmCreate, MedicineAlarmUpdate, MedicineAlarmResponse,
    MedicineAlarmListResponse, MedicineTakenRequest
)
from utils.activity import record_user_activity
from utils.response import success_response

router = APIRouter()

@router.get("/alarms")
async def get_medicine_alarms(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    약 알림 목록 조회
    현재 사용자의 모든 약 알림을 조회합니다.
    """
    alarms = db.query(MedicineAlarm).filter(MedicineAlarm.user_id == current_user.id).all()
    
    return success_response(
        data={
            "alarms": [MedicineAlarmResponse.model_validate(alarm).dict() for alarm in alarms],
            "total": len(alarms)
        },
        message="성공"
    )

@router.post("/alarms", status_code=status.HTTP_201_CREATED)
async def create_medicine_alarm(
    alarm: MedicineAlarmCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    새 약 알림 생성
    """
    # 종료일이 시작일보다 이전인지 확인
    if alarm.end_date and alarm.end_date < alarm.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="종료일은 시작일보다 늦어야 합니다"
        )

    db_alarm = MedicineAlarm(
        **alarm.model_dump(),
        user_id=current_user.id
    )

    # 다음 알림 시간 계산
    db_alarm.calculate_next_reminder()

    db.add(db_alarm)
    db.commit()
    db.refresh(db_alarm)
    
    return success_response(
        data=MedicineAlarmResponse.model_validate(db_alarm).dict(),
        message="약 알림이 생성되었습니다",
        status_code=status.HTTP_201_CREATED
    )

@router.get("/alarms/{alarm_id}")
async def get_medicine_alarm(
    alarm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    특정 약 알림 조회
    """
    alarm = db.query(MedicineAlarm).filter(
        MedicineAlarm.id == alarm_id,
        MedicineAlarm.user_id == current_user.id
    ).first()

    if not alarm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="약 알림을 찾을 수 없습니다"
        )

    return success_response(
        data=MedicineAlarmResponse.model_validate(alarm).dict(),
        message="성공"
    )

@router.put("/alarms/{alarm_id}")
async def update_medicine_alarm(
    alarm_id: int,
    alarm_update: MedicineAlarmUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    약 알림 수정
    """
    alarm = db.query(MedicineAlarm).filter(
        MedicineAlarm.id == alarm_id,
        MedicineAlarm.user_id == current_user.id
    ).first()

    if not alarm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="약 알림을 찾을 수 없습니다"
        )

    # 종료일 검증
    if alarm_update.end_date and alarm_update.start_date:
        if alarm_update.end_date < alarm_update.start_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="종료일은 시작일보다 늦어야 합니다"
            )
    elif alarm_update.end_date and alarm.end_date:
        start_date = alarm_update.start_date or alarm.start_date
        if alarm_update.end_date < start_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="종료일은 시작일보다 늦어야 합니다"
            )

    # 업데이트할 필드만 적용
    update_data = alarm_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(alarm, field, value)

    # 다음 알림 시간 재계산
    alarm.calculate_next_reminder()

    db.commit()
    db.refresh(alarm)
    
    return success_response(
        data=MedicineAlarmResponse.model_validate(alarm).dict(),
        message="약 알림이 수정되었습니다"
    )

@router.delete("/alarms/{alarm_id}")
async def delete_medicine_alarm(
    alarm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    약 알림 삭제
    """
    alarm = db.query(MedicineAlarm).filter(
        MedicineAlarm.id == alarm_id,
        MedicineAlarm.user_id == current_user.id
    ).first()

    if not alarm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="약 알림을 찾을 수 없습니다"
        )

    db.delete(alarm)
    db.commit()
    
    return success_response(
        data=None,
        message="약 알림이 삭제되었습니다"
    )

@router.post("/taken")
async def mark_medicine_taken(
    request: MedicineTakenRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    약 복용 완료 표시
    """
    alarm = db.query(MedicineAlarm).filter(
        MedicineAlarm.id == request.alarm_id,
        MedicineAlarm.user_id == current_user.id
    ).first()

    if not alarm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="약 알림을 찾을 수 없습니다"
        )

    if alarm.is_expired():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="만료된 약 알림입니다"
        )

    # 복용 완료 처리
    alarm.mark_taken()
    # The 'log' variable is not defined in the original code. Assuming it's a placeholder or part of an unprovided context.
    # For now, I will add the record_user_activity call as instructed, without the 'log' line.
    # if log: log.taken = True; log.taken_at = datetime.utcnow()
    record_user_activity(db, current_user, f"medicine_taken_{alarm.id}")
    db.commit()

    return success_response(
        data={
            "id": alarm.id,
            "last_taken": alarm.last_taken.isoformat() if alarm.last_taken else None,
            "next_reminder": alarm.next_reminder.isoformat() if alarm.next_reminder else None
        },
        message="약 복용이 기록되었습니다"
    )

@router.get("/today")
async def get_today_medicine_alarms(
    user_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    오늘의 약 알림 조회 (보호자 권한 지원)
    """
    today = date.today()
    
    # 대상 사용자 ID 결정
    target_id = current_user.id
    if user_id and user_id != current_user.id:
        guardian = db.query(Guardian).filter(
            Guardian.user_id == user_id, 
            Guardian.guardian_user_id == current_user.id
        ).first()
        if not guardian:
            raise HTTPException(status_code=403, detail="권한이 없습니다.")
        target_id = user_id

    from sqlalchemy import or_
    alarms = db.query(MedicineAlarm).filter(
        MedicineAlarm.user_id == target_id,
        MedicineAlarm.is_active == True,
        MedicineAlarm.start_date <= today,
        or_(MedicineAlarm.end_date >= today, MedicineAlarm.end_date.is_(None))
    ).all()

    today_alarms = []
    for alarm in alarms:
        times = alarm.get_times()
        if times:  # 복용 시간이 설정된 경우만
            # time_1, time_2, time_3, time_4 추출
            time_list = [t.strftime("%H:%M") if t else None for t in times]
            # 최대 4개 시간까지 지원
            while len(time_list) < 4:
                time_list.append(None)
            
            today_alarms.append({
                "id": alarm.id,
                "medicine_name": alarm.medicine_name,
                "dosage": alarm.dosage,
                "time_1": time_list[0],
                "time_2": time_list[1] if len(time_list) > 1 else None,
                "time_3": time_list[2] if len(time_list) > 2 else None,
                "time_4": time_list[3] if len(time_list) > 3 else None,
                "last_taken": alarm.last_taken.isoformat() if alarm.last_taken else None,
                "next_reminder": alarm.next_reminder.isoformat() if alarm.next_reminder else None,
                "is_taken": False,  # TODO: 복용 완료 여부 로직 추가 필요
                "is_active": alarm.is_active
            })
    
    # time_1 기준으로 정렬
    today_alarms.sort(key=lambda x: x["time_1"] or "99:99")

    return success_response(
        data={
            "alarms": today_alarms,
            "total": len(today_alarms)
        },
        message="성공"
    )

@router.get("/due-now")
async def get_due_medicine_alarms(
    user_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    지금 복용해야 할 약 조회 (보호자 권한 지원)
    """
    now = datetime.now()
    current_time = now.time()
    
    # 대상 사용자 ID 결정
    target_id = current_user.id
    if user_id and user_id != current_user.id:
        guardian = db.query(Guardian).filter(
            Guardian.user_id == user_id, 
            Guardian.guardian_user_id == current_user.id
        ).first()
        if not guardian:
            raise HTTPException(status_code=403, detail="권한이 없습니다.")
        target_id = user_id

    alarms = db.query(MedicineAlarm).filter(
        MedicineAlarm.user_id == target_id,
        MedicineAlarm.is_active == True
    ).all()

    due_alarms = []
    for alarm in alarms:
        if alarm.should_remind():
            times = alarm.get_times()
            # 현재 시간 근처의 복용 시간 확인 (30분 이내)
            for alarm_time in times:
                time_diff = abs((datetime.combine(now.date(), alarm_time) - now).total_seconds() / 60)
                if time_diff <= 30:  # 30분 이내
                    due_alarms.append({
                        "id": alarm.id,
                        "medicine_name": alarm.medicine_name,
                        "dosage": alarm.dosage,
                        "scheduled_time": alarm_time.strftime("%H:%M"),
                        "instructions": alarm.instructions,
                        "minutes_until": int(time_diff)
                    })
                    break

    return success_response(
        data={
            "due_alarms": sorted(due_alarms, key=lambda x: x["minutes_until"]),
            "total": len(due_alarms)
        },
        message="성공"
    )

@router.patch("/alarms/{alarm_id}/toggle")
async def toggle_medicine_alarm(
    alarm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    약 알림 활성화/비활성화 토글
    """
    alarm = db.query(MedicineAlarm).filter(
        MedicineAlarm.id == alarm_id,
        MedicineAlarm.user_id == current_user.id
    ).first()

    if not alarm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="약 알림을 찾을 수 없습니다"
        )

    alarm.is_active = not alarm.is_active
    if alarm.is_active:
        alarm.calculate_next_reminder()
    else:
        alarm.next_reminder = None

    db.commit()
    db.refresh(alarm)

    return success_response(
        data=MedicineAlarmResponse.model_validate(alarm).dict(),
        message="약 알림이 활성화되었습니다" if alarm.is_active else "약 알림이 비활성화되었습니다"
    )