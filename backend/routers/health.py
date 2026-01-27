"""
건강 기록 API 라우터
부모님의 혈압, 혈당, 체중 등 건강 정보를 관리합니다.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional, List
from datetime import datetime, timedelta, date

from database import get_db
from auth import get_current_user
from models.user import User
from models.health_record import HealthRecord
from models.guardian import Guardian
from schemas.health_record import (
    HealthRecordCreate,
    HealthRecordResponse,
    HealthRecordListResponse,
    HealthStatsResponse
)
from utils.response import success_response
from utils.activity import record_user_activity

router = APIRouter()

@router.post("/records", response_model=dict)
async def create_health_record(
    record_in: HealthRecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """건강 기록 추가 (부모 모드)"""
    # measured_at이 없으면 현재 시간
    measured_at = record_in.measured_at or datetime.now()
    
    record = HealthRecord(
        user_id=current_user.id,
        record_type=record_in.record_type,
        systolic=record_in.systolic,
        diastolic=record_in.diastolic,
        glucose=record_in.glucose,
        weight=record_in.weight,
        measured_at=measured_at,
        notes=record_in.notes
    )
    
    db.add(record)
    db.commit()
    db.refresh(record)
    
    # 활동 기록
    record_user_activity(db, current_user, f"health_record_created_{record.record_type}")
    
    return success_response(
        data=HealthRecordResponse.model_validate(record).dict(),
        message="건강 기록이 추가되었습니다"
    )

@router.get("/records", response_model=dict)
async def get_health_records(
    record_type: Optional[str] = Query(None, description="blood_pressure, glucose, weight"),
    user_id: Optional[int] = Query(None, description="조회할 사용자 ID (보호자 권한)"),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """건강 기록 조회 (부모/자식 모드)"""
    # 대상 사용자 결정
    target_user_id = current_user.id
    
    # 자식 모드에서 부모님 기록 조회
    if user_id and user_id != current_user.id:
        guardian = db.query(Guardian).filter(
            Guardian.user_id == user_id,
            Guardian.guardian_user_id == current_user.id
        ).first()
        
        if not guardian:
            raise HTTPException(status_code=403, detail="권한이 없습니다")
        
        target_user_id = user_id
    
    # 쿼리 구성
    query = db.query(HealthRecord).filter(HealthRecord.user_id == target_user_id)
    
    if record_type:
        query = query.filter(HealthRecord.record_type == record_type)
    
    if start_date:
        query = query.filter(HealthRecord.measured_at >= start_date)
    
    if end_date:
        # end_date의 마지막 시간까지 포함
        end_datetime = datetime.combine(end_date, datetime.max.time())
        query = query.filter(HealthRecord.measured_at <= end_datetime)
    
    # 최신순 정렬
    records = query.order_by(desc(HealthRecord.measured_at)).limit(limit).all()
    
    return success_response(
        data={
            "records": [HealthRecordResponse.model_validate(r).dict() for r in records],
            "total": len(records)
        },
        message="성공"
    )

@router.get("/records/latest", response_model=dict)
async def get_latest_health_record(
    record_type: str = Query(..., description="blood_pressure, glucose, weight"),
    user_id: Optional[int] = Query(None, description="조회할 사용자 ID (보호자 권한)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """최신 건강 기록 조회"""
    # 대상 사용자 결정
    target_user_id = current_user.id
    
    if user_id and user_id != current_user.id:
        guardian = db.query(Guardian).filter(
            Guardian.user_id == user_id,
            Guardian.guardian_user_id == current_user.id
        ).first()
        
        if not guardian:
            raise HTTPException(status_code=403, detail="권한이 없습니다")
        
        target_user_id = user_id
    
    # 최신 기록 조회
    record = db.query(HealthRecord).filter(
        HealthRecord.user_id == target_user_id,
        HealthRecord.record_type == record_type
    ).order_by(desc(HealthRecord.measured_at)).first()
    
    if not record:
        return success_response(
            data=None,
            message="기록이 없습니다"
        )
    
    return success_response(
        data=HealthRecordResponse.model_validate(record).dict(),
        message="성공"
    )

@router.get("/stats", response_model=dict)
async def get_health_stats(
    record_type: str = Query(..., description="blood_pressure, glucose, weight"),
    user_id: Optional[int] = Query(None, description="조회할 사용자 ID (보호자 권한)"),
    days: int = Query(30, ge=1, le=365, description="통계 기간 (일)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """건강 통계 조회"""
    # 대상 사용자 결정
    target_user_id = current_user.id
    
    if user_id and user_id != current_user.id:
        guardian = db.query(Guardian).filter(
            Guardian.user_id == user_id,
            Guardian.guardian_user_id == current_user.id
        ).first()
        
        if not guardian:
            raise HTTPException(status_code=403, detail="권한이 없습니다")
        
        target_user_id = user_id
    
    # 기간 설정
    start_date = datetime.now() - timedelta(days=days)
    
    # 데이터 조회
    records = db.query(HealthRecord).filter(
        HealthRecord.user_id == target_user_id,
        HealthRecord.record_type == record_type,
        HealthRecord.measured_at >= start_date
    ).all()
    
    if not records:
        return success_response(
            data={
                "record_type": record_type,
                "total_count": 0,
                "latest_record": None
            },
            message="기록이 없습니다"
        )
    
    # 통계 계산
    stats = {"record_type": record_type, "total_count": len(records)}
    
    if record_type == "blood_pressure":
        systolic_values = [r.systolic for r in records if r.systolic]
        diastolic_values = [r.diastolic for r in records if r.diastolic]
        
        if systolic_values:
            stats["avg_systolic"] = sum(systolic_values) / len(systolic_values)
        if diastolic_values:
            stats["avg_diastolic"] = sum(diastolic_values) / len(diastolic_values)
    
    elif record_type == "glucose":
        glucose_values = [r.glucose for r in records if r.glucose]
        if glucose_values:
            stats["avg_glucose"] = sum(glucose_values) / len(glucose_values)
            stats["min_value"] = min(glucose_values)
            stats["max_value"] = max(glucose_values)
    
    elif record_type == "weight":
        weight_values = [r.weight for r in records if r.weight]
        if weight_values:
            stats["avg_weight"] = sum(weight_values) / len(weight_values)
            stats["min_value"] = min(weight_values)
            stats["max_value"] = max(weight_values)
    
    # 최신 기록
    latest = max(records, key=lambda r: r.measured_at)
    stats["latest_record"] = HealthRecordResponse.model_validate(latest).dict()
    
    return success_response(
        data=stats,
        message="성공"
    )

@router.delete("/records/{record_id}", response_model=dict)
async def delete_health_record(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """건강 기록 삭제"""
    record = db.query(HealthRecord).filter(
        HealthRecord.id == record_id,
        HealthRecord.user_id == current_user.id
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="기록을 찾을 수 없습니다")
    
    db.delete(record)
    db.commit()
    
    return success_response(
        data={"id": record_id},
        message="건강 기록이 삭제되었습니다"
    )
