"""
보호자 관리 API 라우터
사용자의 보호자 정보를 관리하는 CRUD 기능을 제공합니다.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..auth import get_current_user
from ..models.user import User
from ..models.guardian import Guardian
from ..schemas.guardian import (
    GuardianCreate, GuardianUpdate, GuardianResponse, GuardianListResponse
)

router = APIRouter()

@router.get("/", response_model=GuardianListResponse)
async def get_guardians(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    보호자 목록 조회
    현재 사용자의 모든 보호자를 조회합니다.
    """
    guardians = db.query(Guardian).filter(Guardian.user_id == current_user.id).all()
    return GuardianListResponse(
        guardians=[GuardianResponse.from_orm(guardian) for guardian in guardians],
        total=len(guardians)
    )

@router.post("/", response_model=GuardianResponse, status_code=status.HTTP_201_CREATED)
async def create_guardian(
    guardian: GuardianCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    새 보호자 추가
    """
    # 같은 관계의 주보호자가 이미 있는지 확인
    if guardian.is_primary and guardian.relationship:
        existing_primary = db.query(Guardian).filter(
            Guardian.user_id == current_user.id,
            Guardian.relationship == guardian.relationship,
            Guardian.is_primary == True
        ).first()

        if existing_primary:
            # 기존 주보호자의 주보호자 상태 해제
            existing_primary.is_primary = False

    db_guardian = Guardian(
        **guardian.dict(),
        user_id=current_user.id
    )
    db.add(db_guardian)
    db.commit()
    db.refresh(db_guardian)
    return GuardianResponse.from_orm(db_guardian)

@router.get("/{guardian_id}", response_model=GuardianResponse)
async def get_guardian(
    guardian_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    특정 보호자 조회
    """
    guardian = db.query(Guardian).filter(
        Guardian.id == guardian_id,
        Guardian.user_id == current_user.id
    ).first()

    if not guardian:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="보호자를 찾을 수 없습니다"
        )

    return GuardianResponse.from_orm(guardian)

@router.put("/{guardian_id}", response_model=GuardianResponse)
async def update_guardian(
    guardian_id: int,
    guardian_update: GuardianUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    보호자 정보 수정
    """
    guardian = db.query(Guardian).filter(
        Guardian.id == guardian_id,
        Guardian.user_id == current_user.id
    ).first()

    if not guardian:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="보호자를 찾을 수 없습니다"
        )

    # 주보호자 상태 변경 시 검증
    if guardian_update.is_primary is True and guardian_update.relationship:
        existing_primary = db.query(Guardian).filter(
            Guardian.user_id == current_user.id,
            Guardian.relationship == guardian_update.relationship,
            Guardian.is_primary == True,
            Guardian.id != guardian_id
        ).first()

        if existing_primary:
            existing_primary.is_primary = False

    # 업데이트할 필드만 적용
    update_data = guardian_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(guardian, field, value)

    db.commit()
    db.refresh(guardian)
    return GuardianResponse.from_orm(guardian)

@router.delete("/{guardian_id}")
async def delete_guardian(
    guardian_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    보호자 삭제
    """
    guardian = db.query(Guardian).filter(
        Guardian.id == guardian_id,
        Guardian.user_id == current_user.id
    ).first()

    if not guardian:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="보호자를 찾을 수 없습니다"
        )

    db.delete(guardian)
    db.commit()
    return {"message": "보호자가 삭제되었습니다"}

@router.patch("/{guardian_id}/primary")
async def set_primary_guardian(
    guardian_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    주보호자로 설정
    해당 보호자를 주보호자로 설정하고 다른 보호자들의 주보호자 상태를 해제합니다.
    """
    guardian = db.query(Guardian).filter(
        Guardian.id == guardian_id,
        Guardian.user_id == current_user.id
    ).first()

    if not guardian:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="보호자를 찾을 수 없습니다"
        )

    # 같은 관계의 다른 보호자들의 주보호자 상태 해제
    db.query(Guardian).filter(
        Guardian.user_id == current_user.id,
        Guardian.relationship == guardian.relationship,
        Guardian.id != guardian_id
    ).update({"is_primary": False})

    # 해당 보호자를 주보호자로 설정
    guardian.is_primary = True
    db.commit()
    db.refresh(guardian)

    return GuardianResponse.from_orm(guardian)

@router.get("/emergency/contacts")
async def get_emergency_contacts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    긴급 연락처 조회
    긴급 상황 시 연락할 보호자 목록을 반환합니다.
    """
    emergency_guardians = db.query(Guardian).filter(
        Guardian.user_id == current_user.id,
        Guardian.emergency_contact == True
    ).all()

    return {
        "emergency_contacts": [
            {
                "id": g.id,
                "name": g.name,
                "phone": g.phone,
                "relationship": g.get_relationship_display()
            }
            for g in emergency_guardians
        ],
        "total": len(emergency_guardians)
    }

@router.get("/by-relationship/{relationship}")
async def get_guardians_by_relationship(
    relationship: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    관계별 보호자 조회
    특정 관계(자녀, 배우자 등)의 보호자들을 조회합니다.
    """
    guardians = db.query(Guardian).filter(
        Guardian.user_id == current_user.id,
        Guardian.relationship == relationship
    ).all()

    return GuardianListResponse(
        guardians=[GuardianResponse.from_orm(g) for g in guardians],
        total=len(guardians)
    )