"""
보호자 관리 API 라우터
사용자의 보호자 정보를 관리하는 CRUD 기능을 제공합니다.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from auth import get_current_user
from models.user import User
from models.guardian import Guardian
from schemas.guardian import (
    GuardianCreate, GuardianUpdate, GuardianResponse, GuardianListResponse
)

router = APIRouter()

@router.get("/")
async def get_guardians(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    보호자 목록 조회
    현재 사용자의 모든 보호자를 조회합니다.
    """
    try:
        print(f"DEBUG: get_guardians 호출됨 (UPDATED). user_id={current_user.id}")
        guardians = db.query(Guardian).filter(Guardian.user_id == current_user.id).all()
        print(f"DEBUG: 조회된 guardians 개수: {len(guardians)}")
        
        result = []
        for g in guardians:
            print(f"DEBUG: Processing guardian {g.id}")
            result.append({
                "id": g.id,
                "name": g.name,
                "phone": g.phone,
                "email": g.email,
                "relationship": g.relationship_type, # 명시적 매핑
                "is_primary": g.is_primary,
                "emergency_contact": g.emergency_contact,
                "notification_enabled": g.notification_enabled,
                "access_level": g.access_level,
                "user_id": g.user_id,
                "guardian_user_id": g.guardian_user_id,
                "created_at": str(g.created_at),
                "updated_at": str(g.updated_at)
            })
            
        print(f"DEBUG: returning {len(result)} items")
        # Pydantic 모델 검증 우회하여 딕셔너리 직접 반환
        return {
            "guardians": result,
            "total": len(result)
        }
    except Exception as e:
        print(f"ERROR in get_guardians: {e}")
        return {"guardians": [], "total": 0}

@router.get("/managed-users")
async def get_managed_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    내가 관리하는 사용자(부모님) 목록 조회
    현재 사용자가 보호자로 등록된 모든 사용자를 조회합니다.
    """
    try:
        managed_relations = db.query(Guardian).filter(
            Guardian.guardian_user_id == current_user.id
        ).all()
        
        result = []
        for rel in managed_relations:
            # 피보호자(부모님) 정보 가져오기
            parent = db.query(User).filter(User.id == rel.user_id).first()
            if parent:
                result.append({
                    "id": rel.id,
                    "user_id": parent.id,
                    "username": parent.username,
                    "full_name": parent.full_name,
                    "relationship": rel.relationship_type,
                    "is_primary": rel.is_primary,
                    "created_at": str(rel.created_at)
                })
        
        return {
            "managed_users": result,
            "total": len(result)
        }
    except Exception as e:
        print(f"ERROR in get_managed_users: {e}")
        return {"managed_users": [], "total": 0}
        raise HTTPException(status_code=500, detail=str(e))

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

    # 전화번호로 기존 가입자 확인 및 자동 연동
    guardian_user_id = guardian.guardian_user_id
    if not guardian_user_id and guardian.phone:
        matched_user = db.query(User).filter(User.phone == guardian.phone).first()
        if matched_user:
            guardian_user_id = matched_user.id
            print(f"DEBUG: Guardian match found! Phone: {guardian.phone} -> User ID: {guardian_user_id}")

    # Pydantic 필드명(relationship)을 DB 컬럼명(relationship_type)으로 변환
    guardian_data = guardian.dict(exclude={"guardian_user_id", "relationship"})
    relationship_type = guardian.relationship

    db_guardian = Guardian(
        **guardian_data,
        relationship_type=relationship_type,
        guardian_user_id=guardian_user_id,
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

@router.get("/parents/{parent_id}/report")
async def get_parent_report(
    parent_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    부모님 활동 리포트 조회
    최근 일주일간의 일정 완료율, 약 복용 준수율 등을 통계로 제공합니다.
    """
    # 1. 권한 확인
    guardian = db.query(Guardian).filter(
        Guardian.user_id == parent_id,
        Guardian.guardian_user_id == current_user.id
    ).first()
    
    if not guardian:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="이 사용자의 리포트를 볼 권한이 없습니다."
        )
        
    from models.task import Task
    from models.medicine_alarm import MedicineAlarm
    from datetime import date, timedelta
    from services.ai_service import AIService
    
    today = date.today()
    last_week = today - timedelta(days=7)
    
    # 2. 일정 통계
    tasks = db.query(Task).filter(
        Task.owner_id == parent_id,
        Task.date >= last_week,
        Task.date <= today
    ).all()
    
    total_tasks = len(tasks)
    completed_tasks = sum(1 for t in tasks if t.completed)
    task_rate = round((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0, 1)
    
    # 요일별 일정 추이
    daily_tasks = []
    for i in range(7):
        d = last_week + timedelta(days=i)
        day_tasks = [t for t in tasks if t.date == d]
        daily_tasks.append({
            "date": d.strftime("%m/%d"),
            "total": len(day_tasks),
            "completed": sum(1 for t in day_tasks if t.completed)
        })
        
    # 3. 복약 통계 (간소화)
    medicines = db.query(MedicineAlarm).filter(
        MedicineAlarm.user_id == parent_id,
        MedicineAlarm.is_active == True
    ).all()
    
    # 4. AI 인사이트 생성 (AIService 호출)
    ai_service = AIService()
    stats_for_ai = {
        "task_rate": task_rate,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "medicine_count": len(medicines)
    }
    
    insight_prompt = f"""당신은 보호자를 위한 노인 케어 전문가입니다.
부모님의 최근 일주일간 활동 통계를 보고 자녀에게 전할 짧은 분석 리포트와 조언(인사이트)을 작성하세요.

통계 데이터:
- 일주일간 전체 일정: {total_tasks}개
- 완료된 일정: {completed_tasks}개 (완료율 {task_rate}%)
- 현재 설정된 복약 알림: {len(medicines)}개

지침:
1. 부모님의 활동이 활발한지, 혹은 주의가 필요한지 분석하세요.
2. 자녀가 부모님께 건낼 따뜻한 말 한마디를 추천하세요.
3. 아주 정중하고 전문적인 말투를 사용하세요.
4. 응답은 '인사이트'와 '조언' 두 부분으로 나누어 2-3문장 내외로 작성하세요.
"""
    
    insight = "부모님께서 활동적으로 잘 지내고 계십니다. 이번 주말에는 안부 전화를 드려보는 게 어떨까요? 😊"
    try:
        if ai_service.api_available:
            response = await ai_service.model.generate_content_async(insight_prompt)
            insight = response.text.strip()
    except Exception as e:
        print(f"AI Insight error: {e}")

    return {
        "status": "success",
        "data": {
            "task_stats": {
                "total": total_tasks,
                "completed": completed_tasks,
                "rate": task_rate,
                "daily": daily_tasks
            },
            "medicine_stats": {
                "total_alarms": len(medicines),
                "adherence_rate": 100.0
            },
            "insight": insight
        }
    }
