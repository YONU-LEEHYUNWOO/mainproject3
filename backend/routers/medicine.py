"""
약 관리 API 라우터
사용자의 약 복용 알림을 관리하는 CRUD 기능을 제공합니다.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date

from database import get_db
from auth import get_current_user
from models.user import User
from models.medicine_alarm import MedicineAlarm
from schemas.medicine_alarm import (
    MedicineAlarmCreate, MedicineAlarmUpdate, MedicineAlarmResponse,
    MedicineAlarmListResponse, MedicineTakenRequest, MedicineTakenResponse
)

router = APIRouter()

@router.get("/alarms", response_model=MedicineAlarmListResponse)
async def get_medicine_alarms(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    약 알림 목록 조회
    현재 사용자의 모든 약 알림을 조회합니다.
    """
    alarms = db.query(MedicineAlarm).filter(MedicineAlarm.user_id == current_user.id).all()
    return MedicineAlarmListResponse(
        alarms=[MedicineAlarmResponse.model_validate(alarm) for alarm in alarms],
        total=len(alarms)
    )

@router.post("/alarms", response_model=MedicineAlarmResponse, status_code=status.HTTP_201_CREATED)
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
    return MedicineAlarmResponse.model_validate(db_alarm)

@router.get("/alarms/{alarm_id}", response_model=MedicineAlarmResponse)
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

    return MedicineAlarmResponse.model_validate(alarm)

@router.put("/alarms/{alarm_id}", response_model=MedicineAlarmResponse)
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
    return MedicineAlarmResponse.model_validate(alarm)

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
    return {"message": "약 알림이 삭제되었습니다"}

@router.post("/taken", response_model=MedicineTakenResponse)
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
    db.commit()

    return MedicineTakenResponse(
        success=True,
        message="약 복용이 기록되었습니다",
        next_reminder=alarm.next_reminder
    )

@router.get("/today")
async def get_today_medicine_alarms(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    오늘의 약 알림 조회
    오늘 복용해야 할 약 목록을 반환합니다.
    """
    today = date.today()

    from sqlalchemy import or_
    alarms = db.query(MedicineAlarm).filter(
        MedicineAlarm.user_id == current_user.id,
        MedicineAlarm.is_active == True,
        MedicineAlarm.start_date <= today,
        or_(MedicineAlarm.end_date >= today, MedicineAlarm.end_date.is_(None))
    ).all()

    today_alarms = []
    for alarm in alarms:
        times = alarm.get_times()
        if times:  # 복용 시간이 설정된 경우만
            today_alarms.append({
                "id": alarm.id,
                "medicine_name": alarm.medicine_name,
                "dosage": alarm.dosage,
                "times": [t.strftime("%H:%M") for t in times],
                "instructions": alarm.instructions,
                "last_taken": alarm.last_taken,
                "next_reminder": alarm.next_reminder
            })

    return {
        "today_alarms": today_alarms,
        "total": len(today_alarms)
    }

@router.get("/due-now")
async def get_due_medicine_alarms(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    지금 복용해야 할 약 조회
    현재 시간에 복용해야 할 약 목록을 반환합니다.
    """
    now = datetime.now()
    current_time = now.time()

    alarms = db.query(MedicineAlarm).filter(
        MedicineAlarm.user_id == current_user.id,
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

    return {
        "due_alarms": sorted(due_alarms, key=lambda x: x["minutes_until"]),
        "total": len(due_alarms)
    }

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

    return MedicineAlarmResponse.model_validate(alarm)