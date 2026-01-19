"""
알림 로그 API 라우터
알림 실행 이력을 관리합니다.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from database import get_db
from auth import get_current_user
from models.user import User
from models.notification_log import NotificationLog
from schemas.notification_log import (
    NotificationLogCreate, NotificationLogUpdate, NotificationLogResponse, NotificationLogListResponse
)

router = APIRouter()


@router.get("/", response_model=NotificationLogListResponse)
async def get_notification_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    알림 로그 목록 조회
    사용자의 알림 로그를 조회합니다.
    """
    query = db.query(NotificationLog).filter(NotificationLog.user_id == current_user.id)

    # 정렬 (최신순)
    query = query.order_by(NotificationLog.created_at.desc())

    # 페이징
    total = query.count()
    logs = query.offset(skip).limit(limit).all()

    return NotificationLogListResponse(
        notification_logs=[NotificationLogResponse.from_orm(log) for log in logs],
        total=total,
        page=skip // limit + 1,
        per_page=limit
    )


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